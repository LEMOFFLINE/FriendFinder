import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/pg-client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { newLeaderId } = body;

    if (!newLeaderId) {
      return NextResponse.json({ error: 'New leader ID required' }, { status: 400 });
    }

    // Verify current user is the leader
    const groupCheck = await query(`
      SELECT group_leader_id FROM groups WHERE group_id = $1
    `, [groupId]);

    if (groupCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (groupCheck.rows[0].group_leader_id !== userId) {
      return NextResponse.json({ error: 'Only group leader can transfer leadership' }, { status: 403 });
    }

    // Verify new leader is a member
    const memberCheck = await query(`
      SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2
    `, [groupId, newLeaderId]);

    if (memberCheck.rows.length === 0) {
      return NextResponse.json({ error: 'New leader must be a group member' }, { status: 400 });
    }

    // Transfer leadership
    await query(`
      UPDATE groups SET group_leader_id = $1 WHERE group_id = $2
    `, [newLeaderId, groupId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error transferring leadership:', error);
    return NextResponse.json({ error: 'Failed to transfer leadership' }, { status: 500 });
  }
}
