import { NextResponse } from "next/server"
import { query } from "@/lib/database/pg-client"

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id")
    const { friendshipId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 })
    }

    if (!friendshipId) {
      return NextResponse.json({ error: "Friendship ID required" }, { status: 400 })
    }

    // Verify this request is for the current user
    const checkResult = await query(
      "SELECT user_id, friend_id FROM friendships WHERE friendship_id = $1 AND friend_id = $2 AND status = $3",
      [friendshipId, userId, "pending"],
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Friend request not found" }, { status: 404 })
    }

    const requesterId = checkResult.rows[0].user_id

    // Accept the request
    await query("UPDATE friendships SET status = $1, accepted_at = NOW() WHERE friendship_id = $2", [
      "accepted",
      friendshipId,
    ])

    // Delete any reverse pending request
    await query(
      `DELETE FROM friendships 
       WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'`,
      [userId, requesterId],
    )

    console.log("[v0] Friend request accepted:", friendshipId)

    return NextResponse.json({
      success: true,
      message: "Friend request accepted",
    })
  } catch (error) {
    console.error("[v0] Error accepting friend request:", error)
    return NextResponse.json({ error: "Failed to accept friend request" }, { status: 500 })
  }
}
