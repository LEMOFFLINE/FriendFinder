import { type NextRequest, NextResponse } from "next/server"
import { postgresDb } from "@/lib/database/postgres-client"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const body = await request.json()
    const { name, location, avatar_url, bio } = body

    console.log("[v0] Updating profile for user:", userId, body)

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Update user profile
    const updatedUser = await postgresDb.updateUser(userId, {
      name,
      location: location || undefined,
      avatar_url: avatar_url || undefined,
      bio: bio || undefined,
      updated_at: new Date().toISOString(),
    })

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("[v0] Profile updated successfully:", updatedUser.name)

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("[v0] Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
