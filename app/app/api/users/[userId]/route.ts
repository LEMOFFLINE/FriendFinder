import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database/pg-client"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = await params
    const { searchParams } = new URL(request.url)
    const currentUserId = searchParams.get("currentUserId")

    console.log("[v0] Fetching user profile:", userId)

    const userResult = await query(
      `SELECT 
        u.user_id, 
        COALESCE(un.nickname, u.name) as name,
        u.name as original_name,
        u.email, 
        u.age, 
        u.location, 
        u.bio, 
        u.created_at
       FROM users u
       LEFT JOIN user_nicknames un ON un.nicknamer_id = $2 AND un.target_user_id = u.user_id
       WHERE u.user_id = $1`,
      [userId, currentUserId || null],
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult.rows[0]

    const interestsResult = await query("SELECT hobbies FROM user_interests WHERE user_id = $1", [userId])
    const interests = interestsResult.rows.length > 0 ? interestsResult.rows[0].hobbies || [] : []

    // Get user's posts
    const postsResult = await query(
      `SELECT 
        p.*,
        EXISTS(
          SELECT 1 FROM likes 
          WHERE likes.target_type = 'post' 
          AND likes.target_id = p.post_id 
          AND likes.user_id = $2
        ) as liked_by_current_user,
        
        -- Fetch original post data for reposts
        op.content as original_post_content,
        op.image_urls as original_post_image_urls,
        op.created_at as original_post_created_at,
        ou.user_id as original_post_author_id,
        ou.name as original_post_author_name,
        ou.avatar_url as original_post_author_avatar_url

       FROM posts p
       -- Left join for original post data
       LEFT JOIN posts op ON p.original_post_id = op.post_id
       LEFT JOIN users ou ON op.author_id = ou.user_id
       
       WHERE p.author_id = $1
       AND p.is_deleted = false
       AND (
         p.author_id = $2
         OR p.visibility = 'public'
         OR (
           p.visibility = 'friends'
           AND EXISTS (
             SELECT 1 FROM friendships f
             WHERE f.status = 'accepted'
             AND ((f.user_id = $2 AND f.friend_id = $1)
               OR (f.friend_id = $2 AND f.user_id = $1))
           )
         )
       )
       ORDER BY p.created_at DESC`,
      [userId, currentUserId || userId],
    )

    let friendshipStatus = "none"
    if (currentUserId && currentUserId !== userId) {
      const friendshipResult = await query(
        `SELECT status, user_id, friend_id
         FROM friendships
         WHERE ((user_id = $1 AND friend_id = $2)
            OR (user_id = $2 AND friend_id = $1))
         AND status IN ('accepted', 'pending')`,
        [currentUserId, userId],
      )

      if (friendshipResult.rows.length > 0) {
        const friendship = friendshipResult.rows[0]
        if (friendship.status === "accepted") {
          friendshipStatus = "friends"
        } else if (friendship.user_id === currentUserId) {
          friendshipStatus = "pending_sent"
        } else {
          friendshipStatus = "pending_received"
        }
      }
    }

    console.log("[v0] User profile loaded:", user.name, "with", postsResult.rows.length, "posts")

    return NextResponse.json({
      user: {
        ...user,
        interests,
      },
      posts: postsResult.rows,
      friendshipStatus,
    })
  } catch (error) {
    console.error("[v0] Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to load user profile" }, { status: 500 })
  }
}
