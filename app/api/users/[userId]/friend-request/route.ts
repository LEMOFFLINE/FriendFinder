import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database/pg-client"

export async function POST(request: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params

    const currentUserId = request.headers.get("x-user-id")

    if (!currentUserId) {
      console.error("Missing x-user-id header")
      return NextResponse.json({ error: "Unauthorized - missing user ID" }, { status: 401 })
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId) || !uuidRegex.test(currentUserId)) {
      console.error("Invalid UUID format:", { userId, currentUserId })
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    const acceptedFriendship = await query(
      `SELECT * FROM friendships
       WHERE ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))
         AND status = 'accepted'`,
      [currentUserId, userId],
    )

    if (acceptedFriendship.rows.length > 0) {
      return NextResponse.json({ error: "Already friends" }, { status: 400 })
    }

    const incomingRequest = await query(
      `SELECT * FROM friendships
       WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'`,
      [userId, currentUserId],
    )

    if (incomingRequest.rows.length > 0) {
      await query(
        `UPDATE friendships 
         SET status = 'accepted', accepted_at = NOW()
         WHERE friendship_id = $1`,
        [incomingRequest.rows[0].friendship_id],
      )
      return NextResponse.json({ success: true, status: "accepted" })
    }

    const outgoingRequest = await query(
      `SELECT * FROM friendships
       WHERE user_id = $1 AND friend_id = $2`,
      [currentUserId, userId],
    )

    if (outgoingRequest.rows.length > 0) {
      const status = outgoingRequest.rows[0].status
      const friendshipId = outgoingRequest.rows[0].friendship_id

      if (status === "pending") {
        return NextResponse.json({ error: "Friend request already sent" }, { status: 400 })
      }

      if (status === "rejected") {
        await query(
          `UPDATE friendships 
           SET status = 'pending', created_at = NOW()
           WHERE friendship_id = $1`,
          [friendshipId],
        )
        return NextResponse.json({ success: true, status: "pending" })
      }
    }

    const result = await query(
      `INSERT INTO friendships (user_id, friend_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [currentUserId, userId],
    )

    return NextResponse.json({ success: true, status: "pending" })
  } catch (error: any) {
    console.error("Error in friend request handler:", error)
    console.error("Error stack:", error.stack)

    return NextResponse.json(
      {
        error: "Failed to send friend request",
        details: error.message || "Unknown error",
        type: error.constructor.name,
      },
      { status: 500 },
    )
  }
}
