import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database/pg-client"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params
    const userId = request.headers.get("x-user-id")
    const { avatarUrl } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is group leader
    const groupResult = await query("SELECT group_leader_id FROM groups WHERE group_id = $1", [groupId])

    if (groupResult.rows.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    if (groupResult.rows[0].group_leader_id !== userId) {
      return NextResponse.json({ error: "Only group leader can update portrait" }, { status: 403 })
    }

    // Update group portrait
    await query("UPDATE groups SET avatar_url = $1, updated_at = NOW() WHERE group_id = $2", [avatarUrl, groupId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating group portrait:", error)
    return NextResponse.json({ error: "Failed to update portrait" }, { status: 500 })
  }
}
