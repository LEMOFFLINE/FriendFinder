import { type NextRequest, NextResponse } from "next/server"
import { postgresDb } from "@/lib/database/postgres-client"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const body = await request.json()
    const { interests } = body

    console.log("[v0] Updating interests for user:", userId, interests)

    if (!Array.isArray(interests)) {
      return NextResponse.json({ error: "Interests must be an array" }, { status: 400 })
    }

    await postgresDb.setUserInterests(userId, interests)

    console.log("[v0] Interests updated successfully")

    return NextResponse.json({ success: true, interests })
  } catch (error) {
    console.error("[v0] Error updating interests:", error)
    return NextResponse.json({ error: "Failed to update interests" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params

    const interests = await postgresDb.getUserInterests(userId)

    return NextResponse.json({ interests })
  } catch (error) {
    console.error("[v0] Error fetching interests:", error)
    return NextResponse.json({ error: "Failed to fetch interests" }, { status: 500 })
  }
}
