import { type NextRequest, NextResponse } from "next/server"
import { getPool } from "@/lib/database/pg-client"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  const pool = getPool()

  try {
    // Get accepted friendships with friend details
    const result = await pool.query(
      `
      SELECT 
        u.user_id,
        COALESCE(un.nickname, u.name) as name,
        u.name as original_name,
        u.email,
        u.age,
        u.location,
        u.bio,
        u.avatar_url,
        f.created_at as friendship_since
      FROM friendships f
      JOIN users u ON (
        CASE 
          WHEN f.user_id = $1 THEN u.user_id = f.friend_id
          WHEN f.friend_id = $1 THEN u.user_id = f.user_id
        END
      )
      LEFT JOIN user_nicknames un ON un.nicknamer_id = $1 AND un.target_user_id = u.user_id
      WHERE (f.user_id = $1 OR f.friend_id = $1)
        AND f.status = 'accepted'
      ORDER BY f.accepted_at DESC
      `,
      [userId],
    )

    // Get interests for each friend
    const friendsWithInterests = await Promise.all(
      result.rows.map(async (friend) => {
        const interestsResult = await pool.query(`SELECT hobbies FROM user_interests WHERE user_id = $1`, [
          friend.user_id,
        ])

        return {
          ...friend,
          interests: interestsResult.rows.length > 0 ? interestsResult.rows[0].hobbies || [] : [],
        }
      }),
    )

    return NextResponse.json({ friends: friendsWithInterests })
  } catch (error) {
    console.error("[v0] Error fetching friends:", error)
    return NextResponse.json({ error: "Failed to load friends" }, { status: 500 })
  }
}
