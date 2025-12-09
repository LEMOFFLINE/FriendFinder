// User service - business logic layer

import { db } from "../client"
import type { User } from "../schema"
import { generateId } from "../../utils"

export class UserService {
  // Simulate consistent response time to prevent timing attacks
  private async addSecurityDelay() {
    const baseDelay = 200
    const randomDelay = Math.random() * 100
    await new Promise((resolve) => setTimeout(resolve, baseDelay + randomDelay))
  }

  // Check if email exists (with anti-enumeration protection)
  async checkEmailExists(email: string): Promise<boolean> {
    const startTime = Date.now()

    try {
      const normalizedEmail = email.trim().toLowerCase()
      const user = await db.getUserByEmail(normalizedEmail)
      const exists = !!user

      // Ensure consistent response time
      const elapsed = Date.now() - startTime
      if (elapsed < 200) {
        await new Promise((resolve) => setTimeout(resolve, 200 - elapsed))
      }

      return exists
    } catch (error) {
      // On error, still maintain consistent timing
      await this.addSecurityDelay()
      return false
    }
  }

  // Validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  // Validate password strength
  private isStrongPassword(password: string): boolean {
    // At least 8 characters, contains letter and number
    return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)
  }

  async register(data: {
    email: string
    password: string
    name: string
    age?: number
    location?: string
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    // Validate email format
    if (!this.isValidEmail(data.email)) {
      return { success: false, error: "Invalid email format" }
    }

    // Validate password strength
    if (!this.isStrongPassword(data.password)) {
      return { success: false, error: "Password must be at least 8 characters with letters and numbers" }
    }

    // Normalize email (case-insensitive)
    const normalizedEmail = data.email.trim().toLowerCase()

    // Check if email exists
    const existingUser = await db.getUserByEmail(normalizedEmail)
    if (existingUser) {
      return { success: false, error: "Email already registered" }
    }

    const userId = generateId()
    const user: User = {
      user_id: userId,
      email: normalizedEmail,
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
    const normalizedEmail = email.trim().toLowerCase()
    const user = await db.getUserByEmail(normalizedEmail)

    if (!user || user.password_hash !== password) {
      await this.addSecurityDelay()
      return { success: false, error: "Invalid email or password" }
    }

    // Update last active
    await db.updateUser(user.user_id, { last_active_at: new Date().toISOString() })

    return { success: true, user }
  }

  async updateInterests(userId: string, interests: string[]): Promise<void> {
    await db.setUserInterests(userId, interests)
  }

  async getUserWithInterests(userId: string): Promise<{ user: User; interests: string[] } | null> {
    const user = await db.getUserById(userId)
    if (!user) return null

    const interests = await db.getUserInterests(userId)
    return {
      user,
      interests,
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
