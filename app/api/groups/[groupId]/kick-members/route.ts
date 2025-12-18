import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database/pg-client"

export async function POST(request: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params
    const userId = request.headers.get("x-user-id")
    const { memberIds } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json({ error: "Member IDs required" }, { status: 400 })
    }

    // Check if user is group leader
    const groupResult = await query("SELECT group_leader_id FROM groups WHERE group_id = $1", [groupId])

    if (groupResult.rows.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    if (groupResult.rows[0].group_leader_id !== userId) {
      return NextResponse.json({ error: "Only group leader can kick members" }, { status: 403 })
    }

    // Cannot kick the leader
    if (memberIds.includes(userId)) {
      return NextResponse.json({ error: "Cannot kick yourself" }, { status: 400 })
    }

    // Remove members
    const placeholders = memberIds.map((_, i) => `$${i + 2}`).join(",")
    await query(`DELETE FROM group_members WHERE group_id = $1 AND user_id IN (${placeholders})`, [
      groupId,
      ...memberIds,
    ])

    return NextResponse.json({ success: true, kickedCount: memberIds.length })
  } catch (error) {
    console.error("[v0] Error kicking members:", error)
    return NextResponse.json({ error: "Failed to kick members" }, { status: 500 })
  }
}
