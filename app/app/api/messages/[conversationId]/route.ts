import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/pg-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const isGroup = searchParams.get('type') === 'group';

    let messagesResult;

    if (isGroup) {
      // Group messages - get last 7 days from cloud
      messagesResult = await query(`
        SELECT 
          m.message_id,
          m.sender_id,
          m.message_type,
          m.content,
          m.sent_at,
          u.name as sender_name,
          u.avatar_url as sender_avatar,
          COALESCE(un.nickname, u.name) as display_name
        FROM messages m
        JOIN users u ON m.sender_id = u.user_id
        LEFT JOIN user_nicknames un ON un.nicknamer_id = $2 AND un.target_user_id = m.sender_id
        WHERE m.group_id = $1
          AND m.sent_at > NOW() - INTERVAL '7 days'
        ORDER BY m.sent_at ASC
      `, [conversationId, userId]);
    } else {
      // 1-on-1 messages - get last 7 days from cloud
      messagesResult = await query(`
        SELECT 
          m.message_id,
          m.sender_id,
          m.receiver_id,
          m.message_type,
          m.content,
          m.sent_at,
          u.name as sender_name,
          u.avatar_url as sender_avatar,
          COALESCE(un.nickname, u.name) as display_name
        FROM messages m
        JOIN users u ON m.sender_id = u.user_id
        LEFT JOIN user_nicknames un ON un.nicknamer_id = $1 AND un.target_user_id = m.sender_id
        WHERE (
          (m.sender_id = $1 AND m.receiver_id = $2) OR
          (m.sender_id = $2 AND m.receiver_id = $1)
        )
        AND m.sent_at > NOW() - INTERVAL '7 days'
        ORDER BY m.sent_at ASC
      `, [userId, conversationId]);
    }

    return NextResponse.json({ messages: messagesResult.rows });
  } catch (error) {
    console.error('[v0] Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
