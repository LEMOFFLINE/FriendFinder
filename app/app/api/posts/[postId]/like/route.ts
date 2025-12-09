import { NextRequest, NextResponse } from 'next/server'
import { pgPostService } from '@/lib/database/services/pg-post-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const result = await pgPostService.toggleLike(userId, postId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[v0] Like API error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}
