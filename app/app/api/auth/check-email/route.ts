import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/database/services/auth-service'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const exists = await authService.checkEmailExists(email)
    return NextResponse.json({ exists })
  } catch (error) {
    console.error('[v0] Email check API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
