import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database/pg-client"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ invitationId: string }> }) {
  try {
    const { invitationId } = await params
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action } = await request.json()

    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Get invitation details
    const invitationResult = await query(
      `
      SELECT group_id, invitee_id, status
      FROM group_invitations
      WHERE invitation_id = $1
    `,
      [invitationId],
    )

    if (invitationResult.rows.length === 0) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    const invitation = invitationResult.rows[0]

    if (invitation.invitee_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (invitation.status !== "pending") {
      return NextResponse.json({ error: "Invitation already processed" }, { status: 400 })
    }

    // Update invitation status
    await query(
      `
      UPDATE group_invitations
      SET status = $1, updated_at = NOW()
      WHERE invitation_id = $2
    `,
      [action === "accept" ? "accepted" : "rejected", invitationId],
    )

    // If accepted, add user to group
    if (action === "accept") {
      await query(
        `
        INSERT INTO group_members (group_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT (group_id, user_id) DO NOTHING
      `,
        [invitation.group_id, userId],
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error handling group invitation:", error)
    return NextResponse.json({ error: "Failed to handle invitation" }, { status: 500 })
  }
}
