import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/database/services/auth-service'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.email || !data.password || !data.name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    const result = await authService.register(data)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Registration failed' },
        { status: 400 }
      )
    }

    return NextResponse.json({ user: result.user })
  } catch (error) {
    console.error('[v0] Registration API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
