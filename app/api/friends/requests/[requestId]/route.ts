import { NextResponse } from "next/server"
import { query } from "@/lib/database/pg-client"

export async function PUT(request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await params
    const userId = request.headers.get("x-user-id")
    const { action } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 })
    }

    if (!action || !["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Verify this request is for the current user
    const checkResult = await query(
      "SELECT user_id, friend_id FROM friendships WHERE friendship_id = $1 AND friend_id = $2 AND status = $3",
      [requestId, userId, "pending"],
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Friend request not found" }, { status: 404 })
    }

    const requesterId = checkResult.rows[0].user_id

    if (action === "accept") {
      await query("UPDATE friendships SET status = $1, accepted_at = NOW() WHERE friendship_id = $2", [
        "accepted",
        requestId,
      ])

      await query(
        `DELETE FROM friendships 
         WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'`,
        [userId, requesterId],
      )

      return NextResponse.json({
        success: true,
        message: "Friend request accepted",
      })
    } else {
      // Reject the request
      await query("UPDATE friendships SET status = $1 WHERE friendship_id = $2", ["rejected", requestId])

      return NextResponse.json({
        success: true,
        message: "Friend request rejected",
      })
    }
  } catch (error) {
    console.error("[v0] Error handling friend request:", error)
    return NextResponse.json({ error: "Failed to handle friend request" }, { status: 500 })
  }
}
