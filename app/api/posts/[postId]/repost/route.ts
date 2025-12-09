import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database/pg-client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId: originalPostId } = await params
    const { userId, content, imageUrls } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (content && content.length > 300) {
      return NextResponse.json({ error: 'Repost content cannot exceed 300 characters' }, { status: 400 })
    }

    if (imageUrls && imageUrls.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 images allowed for reposts' }, { status: 400 })
    }

    // Get original post
    const originalPost = await query(
      'SELECT * FROM posts WHERE post_id = $1 AND is_deleted = false',
      [originalPostId]
    )

    if (originalPost.rows.length === 0) {
      return NextResponse.json({ error: 'Original post not found' }, { status: 404 })
    }

    const original = originalPost.rows[0]
    const rootPostId = original.root_post_id || originalPostId
    const depth = (original.depth || 0) + 1

    if (depth > 10) {
      return NextResponse.json({ error: 'Maximum repost depth exceeded' }, { status: 400 })
    }

    // Create repost entry
    await query(
      `INSERT INTO reposts (user_id, original_post_id, root_post_id, content, image_urls, depth)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, originalPostId, rootPostId, content || null, imageUrls || [], depth]
    )

    // Create post entry
    const newPostResult = await query(
      `INSERT INTO posts (author_id, content, image_urls, type, original_post_id, root_post_id, depth, visibility)
       VALUES ($1, $2, $3, 'repost', $4, $5, $6, $7)
       RETURNING *`,
      [userId, content || null, imageUrls || [], originalPostId, rootPostId, depth, 'friends']
    )

    // Update repost count on original post
    await query(
      'UPDATE posts SET repost_count = repost_count + 1 WHERE post_id = $1',
      [originalPostId]
    )

    console.log('[v0] Post reposted:', originalPostId, '-> new post:', newPostResult.rows[0].post_id)

    return NextResponse.json({ success: true, post: newPostResult.rows[0] })
  } catch (error) {
    console.error('[v0] Repost API error:', error)
    return NextResponse.json({ error: 'Failed to repost' }, { status: 500 })
  }
}
