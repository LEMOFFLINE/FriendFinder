import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database/pg-client"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await query(
      `
      SELECT 
        gi.invitation_id,
        gi.group_id,
        gi.inviter_id,
        g.group_name,
        g.group_description,
        g.member_count,
        g.avatar_url as group_avatar_url,
        u.name as inviter_name,
        gi.created_at
      FROM group_invitations gi
      JOIN groups g ON gi.group_id = g.group_id
      JOIN users u ON gi.inviter_id = u.user_id
      LEFT JOIN group_members gm ON gi.group_id = gm.group_id AND gm.user_id = $1
      WHERE gi.invitee_id = $1 
        AND gi.status = 'pending' 
        AND g.is_disbanded = FALSE
        AND gm.user_id IS NULL
      ORDER BY gi.created_at DESC
    `,
      [userId],
    )

    return NextResponse.json({
      invitations: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching group invitations:", error)
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 })
  }
}
