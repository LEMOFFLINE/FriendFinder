import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/database/services/auth-service'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const result = await authService.login(email, password)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Login failed' },
        { status: 401 }
      )
    }

    return NextResponse.json({ user: result.user })
  } catch (error) {
    console.error('[v0] Login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
