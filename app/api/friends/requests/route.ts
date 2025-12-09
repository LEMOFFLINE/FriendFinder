import { NextResponse } from "next/server"
import { query } from "@/lib/database/pg-client"

export async function GET(request: Request) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 })
    }

    // Get all pending friend requests sent TO this user
    const result = await query(
      `
      SELECT 
        f.friendship_id,
        f.user_id as requester_id,
        f.created_at,
        u.name as requester_name,
        u.email as requester_email,
        u.avatar_url,
        u.age,
        u.location,
        u.bio,
        COALESCE(ui.hobbies, ARRAY[]::text[]) as interests
      FROM friendships f
      JOIN users u ON f.user_id = u.user_id
      LEFT JOIN user_interests ui ON u.user_id = ui.user_id
      WHERE f.friend_id = $1 
        AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `,
      [userId],
    )

    return NextResponse.json({
      requests: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching friend requests:", error)
    return NextResponse.json({ error: "Failed to fetch friend requests" }, { status: 500 })
  }
}
