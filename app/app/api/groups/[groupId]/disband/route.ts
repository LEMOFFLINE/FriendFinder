import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database/pg-client"

export async function POST(request: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify current user is the leader
    const groupCheck = await query(
      `
      SELECT group_leader_id FROM groups WHERE group_id = $1
    `,
      [groupId],
    )

    if (groupCheck.rows.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    if (groupCheck.rows[0].group_leader_id !== userId) {
      return NextResponse.json({ error: "Only group leader can disband the group" }, { status: 403 })
    }

    await query("BEGIN")

    // Delete group invitations
    await query("DELETE FROM group_invitations WHERE group_id = $1", [groupId])

    // Delete group messages
    await query("DELETE FROM group_messages WHERE group_id = $1", [groupId])

    // Delete group members
    await query("DELETE FROM group_members WHERE group_id = $1", [groupId])

    // Delete the group itself
    await query("DELETE FROM groups WHERE group_id = $1", [groupId])

    await query("COMMIT")

    return NextResponse.json({ success: true })
  } catch (error) {
    await query("ROLLBACK")
    console.error("[v0] Error disbanding group:", error)
    return NextResponse.json({ error: "Failed to disband group" }, { status: 500 })
  }
}
