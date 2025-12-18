import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/pg-client';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, tags } = body;

    if (!name || name.length > 100) {
      return NextResponse.json({ error: 'Invalid group name' }, { status: 400 });
    }

    // Create group
    const groupResult = await query(`
      INSERT INTO groups (group_name, group_description, group_leader_id, tags)
      VALUES ($1, $2, $3, $4)
      RETURNING group_id, group_name, group_description, group_leader_id, tags, created_at
    `, [name, description || null, userId, tags || []]);

    const group = groupResult.rows[0];

    // Add creator as member
    await query(`
      INSERT INTO group_members (group_id, user_id)
      VALUES ($1, $2)
    `, [group.group_id, userId]);

    return NextResponse.json({ group });
  } catch (error) {
    console.error('[v0] Error creating group:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}
