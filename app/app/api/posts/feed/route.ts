import { NextRequest, NextResponse } from 'next/server'
import { pgPostService } from '@/lib/database/services/pg-post-service'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const posts = await pgPostService.getFeed(userId)
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('[v0] Feed API error:', error)
    return NextResponse.json(
      { error: 'Failed to load feed' },
      { status: 500 }
    )
  }
}
