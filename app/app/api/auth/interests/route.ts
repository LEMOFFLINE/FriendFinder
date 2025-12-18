import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/database/services/auth-service'

export async function POST(request: NextRequest) {
  try {
    const { userId, interests } = await request.json()

    if (!userId || !interests || !Array.isArray(interests)) {
      return NextResponse.json(
        { error: 'User ID and interests array are required' },
        { status: 400 }
      )
    }

    await authService.updateInterests(userId, interests)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Interests update API error:', error)
    return NextResponse.json(
      { error: 'Failed to update interests' },
      { status: 500 }
    )
  }
}
