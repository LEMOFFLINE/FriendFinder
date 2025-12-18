import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/pg-client';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get both 1-on-1 conversations and group conversations
    const conversationsResult = await query(`
      WITH latest_messages AS (
        SELECT DISTINCT ON (
          CASE 
            WHEN group_id IS NOT NULL THEN group_id::text
            WHEN sender_id = $1 THEN receiver_id::text
            ELSE sender_id::text
          END
        )
          message_id,
          sender_id,
          receiver_id,
          group_id,
          message_type,
          content,
          sent_at,
          CASE 
            WHEN group_id IS NOT NULL THEN 'group'
            ELSE '1on1'
          END as conversation_type,
          CASE 
            WHEN group_id IS NOT NULL THEN group_id::text
            WHEN sender_id = $1 THEN receiver_id::text
            ELSE sender_id::text
          END as conversation_id
        FROM messages
        WHERE sender_id = $1 OR receiver_id = $1 OR group_id IN (
          SELECT group_id FROM group_members WHERE user_id = $1
        )
        ORDER BY conversation_id, sent_at DESC
      )
      SELECT 
        lm.*,
        CASE 
          WHEN lm.conversation_type = 'group' THEN g.group_name
          ELSE COALESCE(un.nickname, u.name)
        END as display_name,
        CASE 
          WHEN lm.conversation_type = 'group' THEN g.avatar_url
          ELSE u.avatar_url
        END as avatar_url,
        CASE 
          WHEN lm.conversation_type = 'group' THEN g.is_disbanded
          ELSE FALSE
        END as is_disbanded
      FROM latest_messages lm
      LEFT JOIN users u ON lm.conversation_type = '1on1' AND (
        (lm.sender_id = $1 AND u.user_id = lm.receiver_id) OR
        (lm.receiver_id = $1 AND u.user_id = lm.sender_id)
      )
      LEFT JOIN user_nicknames un ON lm.conversation_type = '1on1' AND un.nicknamer_id = $1 AND un.target_user_id = u.user_id
      LEFT JOIN groups g ON lm.conversation_type = 'group' AND g.group_id = lm.group_id
      ORDER BY lm.sent_at DESC
    `, [userId]);

    return NextResponse.json({ conversations: conversationsResult.rows });
  } catch (error) {
    console.error('[v0] Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
