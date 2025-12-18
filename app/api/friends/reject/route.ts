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
      "SELECT user_id FROM friendships WHERE friendship_id = $1 AND friend_id = $2 AND status = $3",
      [friendshipId, userId, "pending"],
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: "Friend request not found" }, { status: 404 })
    }

    // Reject the request by deleting it
    await query("DELETE FROM friendships WHERE friendship_id = $1", [friendshipId])

    console.log("[v0] Friend request rejected:", friendshipId)

    return NextResponse.json({
      success: true,
      message: "Friend request rejected",
    })
  } catch (error) {
    console.error("[v0] Error rejecting friend request:", error)
    return NextResponse.json({ error: "Failed to reject friend request" }, { status: 500 })
  }
}
