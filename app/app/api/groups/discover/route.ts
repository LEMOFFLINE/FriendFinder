import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/pg-client';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all groups that the user has NOT joined and are not disbanded
    const result = await query(`
      SELECT 
        g.group_id,
        g.group_name,
        g.group_description,
        g.group_leader_id,
        g.avatar_url,
        g.tags,
        g.member_count,
        g.created_at,
        u.name as leader_name
      FROM groups g
      JOIN users u ON g.group_leader_id = u.user_id
      WHERE g.is_disbanded = FALSE
        AND g.group_id NOT IN (
          SELECT group_id FROM group_members WHERE user_id = $1
        )
      ORDER BY g.member_count DESC, g.created_at DESC
    `, [userId]);

    return NextResponse.json({ groups: result.rows });
  } catch (error) {
    console.error('[v0] Error fetching discover groups:', error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}
