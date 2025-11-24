// User service - business logic layer

import { db } from "../client"
import type { User, UserInterest } from "../schema"
import { generateId } from "../../utils"

export class UserService {
  async register(data: {
    email: string
    password: string
    name: string
    age?: number
    location?: string
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    // Check if email exists
    const existingUser = await db.getUserByEmail(data.email)
    if (existingUser) {
      return { success: false, error: "Email already registered" }
    }

    const userId = generateId()
    const user: User = {
      user_id: userId,
      email: data.email,
      password_hash: data.password, // TODO: Should be hashed in production
      name: data.name,
      age: data.age,
      location: data.location,
      bio: "",
      avatar_url: undefined,
      background_image_url: undefined,
      post_count: 0,
      follower_count: 0,
      following_count: 0,
      profile_visibility: "public",
      post_default_visibility: "friends",
      allow_message_from: "friends",
      require_friend_confirmation: true,
      is_active: true,
      last_active_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const createdUser = await db.createUser(user)
    return { success: true, user: createdUser }
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const user = await db.getUserByEmail(email)
    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    // TODO: Should verify hashed password in production
    if (user.password_hash !== password) {
      return { success: false, error: "Invalid email or password" }
    }

    // Update last active
    await db.updateUser(user.user_id, { last_active_at: new Date().toISOString() })

    return { success: true, user }
  }

  async updateInterests(userId: string, interests: string[]): Promise<void> {
    // Delete existing interests
    await db.deleteUserInterests(userId)

    // Create new interests
    for (const interest of interests) {
      const userInterest: UserInterest = {
        interest_id: generateId(),
        user_id: userId,
        interest,
        created_at: new Date().toISOString(),
      }
      await db.createUserInterest(userInterest)
    }
  }

  async getUserWithInterests(userId: string): Promise<{ user: User; interests: string[] } | null> {
    const user = await db.getUserById(userId)
    if (!user) return null

    const interests = await db.getUserInterests(userId)
    return {
      user,
      interests: interests.map((i) => i.interest),
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.getUsers()
  }

  async discoverUsers(currentUserId: string): Promise<User[]> {
    const allUsers = await db.getUsers()
    const friendships = await db.getFriendships(currentUserId)

    const friendIds = new Set(
      friendships
        .filter((f) => f.status === "accepted")
        .map((f) => (f.user_id === currentUserId ? f.friend_id : f.user_id)),
    )

    return allUsers.filter((u) => u.user_id !== currentUserId && !friendIds.has(u.user_id))
  }
}

export const userService = new UserService()
