import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database/pg-client"

export async function POST(request: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params
    const inviterId = request.headers.get("x-user-id")

    if (!inviterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { inviteeId } = await request.json()

    if (!inviteeId) {
      return NextResponse.json({ error: "Invitee ID is required" }, { status: 400 })
    }

    // Check if inviter is a member of the group
    const memberCheck = await query(
      `
      SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2
    `,
      [groupId, inviterId],
    )

    if (memberCheck.rows.length === 0) {
      return NextResponse.json({ error: "You must be a member to invite others" }, { status: 403 })
    }

    // Check if invitee is already a member
    const existingMember = await query(
      `
      SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2
    `,
      [groupId, inviteeId],
    )

    if (existingMember.rows.length > 0) {
      return NextResponse.json({ error: "User is already a member" }, { status: 400 })
    }

    // Create invitation
    const result = await query(
      `
      INSERT INTO group_invitations (group_id, inviter_id, invitee_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (group_id, invitee_id) 
      DO UPDATE SET status = 'pending', inviter_id = $2, updated_at = NOW()
      RETURNING invitation_id
    `,
      [groupId, inviterId, inviteeId],
    )

    return NextResponse.json({
      success: true,
      invitation_id: result.rows[0].invitation_id,
    })
  } catch (error) {
    console.error("[v0] Error creating group invitation:", error)
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  try {
    const { groupId } = await params
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get pending invitations for this group
    const result = await query(
      `
      SELECT 
        gi.invitation_id,
        gi.invitee_id,
        u.name as invitee_name,
        gi.created_at
      FROM group_invitations gi
      JOIN users u ON gi.invitee_id = u.user_id
      WHERE gi.group_id = $1 AND gi.status = 'pending'
      ORDER BY gi.created_at DESC
    `,
      [groupId],
    )

    return NextResponse.json({ invitations: result.rows })
  } catch (error) {
    console.error("[v0] Error fetching group invitations:", error)
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 })
  }
}
