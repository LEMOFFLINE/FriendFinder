import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database/pg-client"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all groups that the user has joined
    const result = await query(
      `
      SELECT 
        g.group_id,
        g.group_name,
        g.group_description,
        g.group_leader_id,
        g.avatar_url,
        g.tags,
        g.member_count,
        g.is_disbanded,
        g.created_at,
        u.name as leader_name,
        gm.joined_at
      FROM groups g
      JOIN group_members gm ON g.group_id = gm.group_id
      JOIN users u ON g.group_leader_id = u.user_id
      WHERE gm.user_id = $1
      ORDER BY gm.joined_at DESC
    `,
      [userId],
    )

    return NextResponse.json({ groups: result.rows })
  } catch (error) {
    console.error("[v0] Error fetching user groups:", error)
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 })
  }
}
