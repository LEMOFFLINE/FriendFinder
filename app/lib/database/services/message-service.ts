// Message service - direct messaging

import { db } from "../client"
import type { Message } from "../schema"
import { generateId } from "../../utils"

export class MessageService {
  async sendMessage(data: {
    fromUserId: string
    toUserId: string
    content: string
  }): Promise<{ success: boolean; message?: Message; error?: string }> {
    if (!data.content || data.content.length > 2000) {
      return { success: false, error: "Message must be between 1 and 2000 characters" }
    }

    // Check if they are friends
    const friendship = await db.getFriendship(data.fromUserId, data.toUserId)
    if (!friendship || friendship.status !== "accepted") {
      return { success: false, error: "Can only message friends" }
    }

    const messageId = generateId()
    const message: Message = {
      message_id: messageId,
      from_user_id: data.fromUserId,
      to_user_id: data.toUserId,
      content: data.content,
      is_read: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
    }

    const createdMessage = await db.createMessage(message)
    return { success: true, message: createdMessage }
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    const allMessages = await db.getMessages()

    return allMessages
      .filter(
        (m) =>
          !m.is_deleted &&
          ((m.from_user_id === userId1 && m.to_user_id === userId2) ||
            (m.from_user_id === userId2 && m.to_user_id === userId1)),
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  async markAsRead(messageId: string): Promise<void> {
    await db.updateMessage(messageId, { is_read: true })
  }

  async deleteMessage(messageId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const message = await db.getMessageById(messageId)
    if (!message) {
      return { success: false, error: "Message not found" }
    }

    if (message.from_user_id !== userId) {
      return { success: false, error: "Unauthorized" }
    }

    await db.updateMessage(messageId, { is_deleted: true })
    return { success: true }
  }
}

export const messageService = new MessageService()
