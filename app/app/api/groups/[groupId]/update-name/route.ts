import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database/pg-client"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params
    const userId = request.headers.get("x-user-id")
    const { groupName } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!groupName || groupName.trim().length === 0) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 })
    }

    // Check if user is group leader
    const groupResult = await query("SELECT group_leader_id FROM groups WHERE group_id = $1", [groupId])

    if (groupResult.rows.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    if (groupResult.rows[0].group_leader_id !== userId) {
      return NextResponse.json({ error: "Only group leader can update name" }, { status: 403 })
    }

    // Update group name
    await query("UPDATE groups SET group_name = $1, updated_at = NOW() WHERE group_id = $2", [
      groupName.trim(),
      groupId,
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating group name:", error)
    return NextResponse.json({ error: "Failed to update name" }, { status: 500 })
  }
}
