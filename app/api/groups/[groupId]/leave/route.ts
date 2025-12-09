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

    // Check if user is group leader
    const groupCheck = await query(`
      SELECT group_leader_id FROM groups WHERE group_id = $1
    `, [groupId]);

    if (groupCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (groupCheck.rows[0].group_leader_id === userId) {
      return NextResponse.json({ 
        error: 'Group leader cannot leave. Transfer leadership or disband the group first.' 
      }, { status: 400 });
    }

    // Remove member
    await query(`
      DELETE FROM group_members WHERE group_id = $1 AND user_id = $2
    `, [groupId, userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error leaving group:', error);
    return NextResponse.json({ error: 'Failed to leave group' }, { status: 500 });
  }
}
