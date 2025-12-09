import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/pg-client';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { receiverId, groupId, messageType, content } = body;

    // Validate message type and content
    if (!messageType || !['text', 'image'].includes(messageType)) {
      return NextResponse.json({ error: 'Invalid message type' }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (messageType === 'text' && content.length > 200) {
      return NextResponse.json({ error: 'Text message exceeds 200 characters' }, { status: 400 });
    }

    // Must be either 1-on-1 or group, not both or neither
    if ((receiverId && groupId) || (!receiverId && !groupId)) {
      return NextResponse.json({ error: 'Must specify either receiverId or groupId' }, { status: 400 });
    }

    // If group message, verify membership and check if disbanded
    if (groupId) {
      const groupCheck = await query(`
        SELECT g.is_disbanded, gm.user_id
        FROM groups g
        LEFT JOIN group_members gm ON g.group_id = gm.group_id AND gm.user_id = $1
        WHERE g.group_id = $2
      `, [userId, groupId]);

      if (groupCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      }

      if (groupCheck.rows[0].is_disbanded) {
        return NextResponse.json({ error: 'Group has been disbanded' }, { status: 400 });
      }

      if (!groupCheck.rows[0].user_id) {
        return NextResponse.json({ error: 'Not a group member' }, { status: 403 });
      }
    }

    // Insert message
    const messageResult = await query(`
      INSERT INTO messages (sender_id, receiver_id, group_id, message_type, content)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING message_id, sender_id, receiver_id, group_id, message_type, content, sent_at
    `, [userId, receiverId || null, groupId || null, messageType, content]);

    return NextResponse.json({ message: messageResult.rows[0] });
  } catch (error) {
    console.error('[v0] Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
