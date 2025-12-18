import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database/pg-client"

export async function POST(request: NextRequest, context: { params: Promise<{ userId: string }> }) {
  console.log("[v0] Friend request API called")

  try {
    const { userId } = await context.params
    console.log("[v0] Target userId:", userId)

    const currentUserId = request.headers.get("x-user-id")
    console.log("[v0] Current userId from header:", currentUserId)

    if (!currentUserId) {
      console.error("[v0] Missing x-user-id header")
      return NextResponse.json({ error: "Unauthorized - missing user ID" }, { status: 401 })
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId) || !uuidRegex.test(currentUserId)) {
      console.error("[v0] Invalid UUID format:", { userId, currentUserId })
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    console.log("[v0] Sending friend request from", currentUserId, "to", userId)

    const acceptedFriendship = await query(
      `SELECT * FROM friendships
       WHERE ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))
         AND status = 'accepted'`,
      [currentUserId, userId],
    )

    if (acceptedFriendship.rows.length > 0) {
      console.log("[v0] Users are already friends")
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
      console.log("[v0] Auto-accepted incoming friend request, users are now friends")
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
        console.log("[v0] Friend request already sent and pending")
        return NextResponse.json({ error: "Friend request already sent" }, { status: 400 })
      }

      if (status === "rejected") {
        await query(
          `UPDATE friendships 
           SET status = 'pending', created_at = NOW()
           WHERE friendship_id = $1`,
          [friendshipId],
        )
        console.log("[v0] Friend request re-sent after rejection")
        return NextResponse.json({ success: true, status: "pending" })
      }
    }

    const result = await query(
      `INSERT INTO friendships (user_id, friend_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [currentUserId, userId],
    )

    console.log("[v0] Friend request sent successfully:", result.rows[0])

    return NextResponse.json({ success: true, status: "pending" })
  } catch (error: any) {
    console.error("[v0] Error in friend request handler:", error)
    console.error("[v0] Error stack:", error.stack)

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
