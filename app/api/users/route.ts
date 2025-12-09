import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database/pg-client"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    const searchParams = request.nextUrl.searchParams
    const excludeUserId = searchParams.get("excludeUserId")

    const currentUserId = excludeUserId || userId || ""

    // First get current user's interests for matching
    const currentUserInterests = await query(
      `SELECT COALESCE(hobbies, ARRAY[]::text[]) as hobbies FROM user_interests WHERE user_id = $1`,
      [currentUserId],
    )

    const myInterests = currentUserInterests.rows[0]?.hobbies || []

    // Query users with match score based on common interests
    const sql = `
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.age,
        u.location,
        u.bio,
        u.avatar_url,
        COALESCE(ui.hobbies, ARRAY[]::text[]) as interests,
        -- Calculate common interests count for sorting
        COALESCE(
          array_length(
            ARRAY(
              SELECT unnest(ui.hobbies) 
              INTERSECT 
              SELECT unnest($2::text[])
            ), 
            1
          ), 
          0
        ) as common_interests_count
      FROM users u
      LEFT JOIN user_interests ui ON u.user_id = ui.user_id
      WHERE u.is_active = TRUE
        AND u.user_id != $1
        AND NOT EXISTS (
          SELECT 1 FROM friendships f
          WHERE (
            (f.user_id = $1 AND f.friend_id = u.user_id) OR
            (f.friend_id = $1 AND f.user_id = u.user_id)
          )
          AND f.status IN ('accepted', 'pending')
        )
      ORDER BY common_interests_count DESC, u.created_at DESC
    `

    const result = await query(sql, [currentUserId, myInterests])

    return NextResponse.json({ users: result.rows })
  } catch (error) {
    console.error("[v0] Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
