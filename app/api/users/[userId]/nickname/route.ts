import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/pg-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params;
    const currentUserId = request.headers.get('x-user-id');

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT nickname FROM user_nicknames 
       WHERE nicknamer_id = $1 AND target_user_id = $2`,
      [currentUserId, targetUserId]
    );

    return NextResponse.json({ 
      nickname: result.rows.length > 0 ? result.rows[0].nickname : null 
    });
  } catch (error) {
    console.error('[v0] Error fetching nickname:', error);
    return NextResponse.json({ error: 'Failed to fetch nickname' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params;
    const currentUserId = request.headers.get('x-user-id');
    const { nickname } = await request.json();

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!nickname || nickname.trim() === '') {
      // Delete nickname if empty
      await query(
        `DELETE FROM user_nicknames 
         WHERE nicknamer_id = $1 AND target_user_id = $2`,
        [currentUserId, targetUserId]
      );
    } else {
      // Upsert nickname
      await query(
        `INSERT INTO user_nicknames (nicknamer_id, target_user_id, nickname)
         VALUES ($1, $2, $3)
         ON CONFLICT (nicknamer_id, target_user_id)
         DO UPDATE SET nickname = $3, updated_at = NOW()`,
        [currentUserId, targetUserId, nickname.trim()]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Error setting nickname:', error);
    return NextResponse.json({ error: 'Failed to set nickname' }, { status: 500 });
  }
}
