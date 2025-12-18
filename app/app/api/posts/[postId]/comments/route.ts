import { NextRequest, NextResponse } from 'next/server'
import { pgPostService } from '@/lib/database/services/pg-post-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const comments = await pgPostService.getComments(postId)
    return NextResponse.json({ comments })
  } catch (error) {
    console.error('[v0] Comments API error:', error)
    return NextResponse.json(
      { error: 'Failed to load comments' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const { userId, content } = await request.json()

    if (!userId || !content) {
      return NextResponse.json(
        { error: 'User ID and content are required' },
        { status: 400 }
      )
    }

    const result = await pgPostService.addComment({
      user_id: userId,
      post_id: postId,
      content
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ comment: result.comment })
  } catch (error) {
    console.error('[v0] Comment creation API error:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}
