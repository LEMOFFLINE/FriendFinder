import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/pg-client';

export async function PUT(
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
    const { nickname } = body;

    if (!nickname || nickname.length > 50) {
      return NextResponse.json({ error: 'Invalid nickname' }, { status: 400 });
    }

    // Verify user is a member
    const memberCheck = await query(`
      SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2
    `, [groupId, userId]);

    if (memberCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Not a group member' }, { status: 403 });
    }

    // Upsert nickname
    await query(`
      INSERT INTO group_nicknames (group_id, user_id, nickname)
      VALUES ($1, $2, $3)
      ON CONFLICT (group_id, user_id)
      DO UPDATE SET nickname = $3, updated_at = NOW()
    `, [groupId, userId, nickname]);

    return NextResponse.json({ success: true, nickname });
  } catch (error) {
    console.error('[v0] Error setting nickname:', error);
    return NextResponse.json({ error: 'Failed to set nickname' }, { status: 500 });
  }
}
