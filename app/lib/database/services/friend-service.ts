// Friend service - friendship and contact management

import { db } from "../client"
import type { Friendship, FriendRequest } from "../schema"
import { generateId } from "../../utils"

export class FriendService {
  async sendFriendRequest(data: {
    fromUserId: string
    toUserId: string
    message?: string
  }): Promise<{ success: boolean; request?: FriendRequest; error?: string }> {
    // Check if request already exists
    const existing = await db.getFriendRequest(data.fromUserId, data.toUserId)
    if (existing) {
      return { success: false, error: "Friend request already sent" }
    }

    // Check if already friends
    const friendship = await db.getFriendship(data.fromUserId, data.toUserId)
    if (friendship) {
      return { success: false, error: "Already friends" }
    }

    const requestId = generateId()
    const request: FriendRequest = {
      request_id: requestId,
      from_user_id: data.fromUserId,
      to_user_id: data.toUserId,
      message: data.message,
      status: "pending",
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }

    const createdRequest = await db.createFriendRequest(request)
    return { success: true, request: createdRequest }
  }

  async acceptFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    const request = await db.getFriendRequestById(requestId)
    if (!request) {
      return { success: false, error: "Request not found" }
    }

    if (request.status !== "pending") {
      return { success: false, error: "Request already processed" }
    }

    // Update request status
    await db.updateFriendRequest(requestId, { status: "accepted" })

    // Create friendship
    const friendshipId = generateId()
    const friendship: Friendship = {
      friendship_id: friendshipId,
      user_id: request.from_user_id,
      friend_id: request.to_user_id,
      status: "accepted",
      created_at: new Date().toISOString(),
    }

    await db.createFriendship(friendship)

    // Update follower/following counts
    const user1 = await db.getUserById(request.from_user_id)
    const user2 = await db.getUserById(request.to_user_id)

    if (user1) {
      await db.updateUser(request.from_user_id, { following_count: user1.following_count + 1 })
    }
    if (user2) {
      await db.updateUser(request.to_user_id, { follower_count: user2.follower_count + 1 })
    }

    return { success: true }
  }

  async rejectFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    const request = await db.getFriendRequestById(requestId)
    if (!request) {
      return { success: false, error: "Request not found" }
    }

    await db.updateFriendRequest(requestId, { status: "rejected" })
    return { success: true }
  }

  async getFriends(userId: string): Promise<{ user_id: string; name: string; avatar_url?: string }[]> {
    const friendships = await db.getFriendships(userId)
    const friends = []

    for (const friendship of friendships) {
      if (friendship.status === "accepted") {
        const friendId = friendship.user_id === userId ? friendship.friend_id : friendship.user_id
        const friend = await db.getUserById(friendId)
        if (friend) {
          friends.push({
            user_id: friend.user_id,
            name: friend.name,
            avatar_url: friend.avatar_url,
          })
        }
      }
    }

    return friends
  }

  async getPendingRequests(userId: string): Promise<FriendRequest[]> {
    return await db.getFriendRequestsByToUser(userId)
  }
}

export const friendService = new FriendService()
