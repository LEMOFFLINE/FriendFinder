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

    // Check if group exists and is not disbanded
    const groupCheck = await query(`
      SELECT is_disbanded FROM groups WHERE group_id = $1
    `, [groupId]);

    if (groupCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (groupCheck.rows[0].is_disbanded) {
      return NextResponse.json({ error: 'Group has been disbanded' }, { status: 400 });
    }

    // Check if already a member
    const memberCheck = await query(`
      SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2
    `, [groupId, userId]);

    if (memberCheck.rows.length > 0) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 });
    }

    // Add member
    await query(`
      INSERT INTO group_members (group_id, user_id)
      VALUES ($1, $2)
    `, [groupId, userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error joining group:', error);
    return NextResponse.json({ error: 'Failed to join group' }, { status: 500 });
  }
}
