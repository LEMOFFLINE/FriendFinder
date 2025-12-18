import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database/pg-client"

export async function GET(request: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params
    const userId = request.headers.get("x-user-id")

    // Get group details
    const groupResult = await query(
      `
      SELECT 
        g.*,
        u.name as leader_name,
        CASE WHEN gm.user_id IS NOT NULL THEN true ELSE false END as is_member,
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id) as member_count
      FROM groups g
      JOIN users u ON g.group_leader_id = u.user_id
      LEFT JOIN group_members gm ON g.group_id = gm.group_id AND gm.user_id = $2
      WHERE g.group_id = $1
    `,
      [groupId, userId || null],
    )

    if (groupResult.rows.length === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Get members
    const membersResult = await query(
      `
      SELECT 
        u.user_id,
        u.name,
        u.avatar_url,
        gm.joined_at,
        COALESCE(un.nickname, u.name) as display_name,
        CASE WHEN u.user_id = $2 THEN true ELSE false END as is_leader
      FROM group_members gm
      JOIN users u ON gm.user_id = u.user_id
      LEFT JOIN user_nicknames un ON un.nicknamer_id = $3 AND un.target_user_id = u.user_id
      WHERE gm.group_id = $1
      ORDER BY is_leader DESC, gm.joined_at ASC
    `,
      [groupId, groupResult.rows[0].group_leader_id, userId || null],
    )

    return NextResponse.json({
      group: groupResult.rows[0],
      members: membersResult.rows,
    })
  } catch (error) {
    console.error("[v0] Error fetching group:", error)
    return NextResponse.json({ error: "Failed to fetch group" }, { status: 500 })
  }
}
