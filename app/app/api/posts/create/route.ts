import { NextRequest, NextResponse } from 'next/server'
import { pgPostService } from '@/lib/database/services/pg-post-service'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.author_id) {
      return NextResponse.json(
        { error: 'Author ID is required' },
        { status: 400 }
      )
    }

    const result = await pgPostService.createPost(data)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ post: result.post })
  } catch (error) {
    console.error('[v0] Post creation API error:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
