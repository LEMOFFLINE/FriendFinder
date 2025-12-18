import { query } from "../pg-client"
import * as crypto from "crypto"

export interface User {
  user_id: string
  email: string
  name: string
  age?: number
  location?: string
  bio?: string
  avatar_url?: string
  background_image_url?: string
  post_count: number
  follower_count: number
  following_count: number
  profile_visibility: "public" | "friends" | "private"
  post_default_visibility: "public" | "friends" | "private"
  allow_message_from: "public" | "friends" | "private"
  require_friend_confirmation: boolean
  is_active: boolean
  last_active_at: string
  created_at: string
  updated_at: string
}

export interface UserWithInterests extends User {
  interests: string[]
}

class AuthService {
  // Hash password (simple implementation, should use bcrypt in production)
  private hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex")
  }

  // Check if email exists
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const result = await query("SELECT user_id FROM users WHERE email = $1", [email.trim().toLowerCase()])
      return result.rows.length > 0
    } catch (error) {
      console.error("[v0] Error checking email:", error)
      return false
    }
  }

  // Register new user
  async register(data: {
    email: string
    password: string
    name: string
    age?: number
    location?: string
  }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const normalizedEmail = data.email.trim().toLowerCase()

      // Check if email exists
      const exists = await this.checkEmailExists(normalizedEmail)
      if (exists) {
        return { success: false, error: "Email already registered" }
      }

      // Hash password
      const passwordHash = this.hashPassword(data.password)

      // Insert user
      const result = await query<User>(
        `INSERT INTO users (email, password_hash, name, age, location)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [normalizedEmail, passwordHash, data.name, data.age, data.location],
      )

      const user = result.rows[0]
      console.log("[v0] User registered:", user.email)

      return { success: true, user }
    } catch (error) {
      console.error("[v0] Registration error:", error)
      return { success: false, error: "Registration failed" }
    }
  }

  // Login user
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const passwordHash = this.hashPassword(password)

      const result = await query<User>(`SELECT * FROM users WHERE email = $1 AND password_hash = $2`, [
        normalizedEmail,
        passwordHash,
      ])

      if (result.rows.length === 0) {
        return { success: false, error: "Invalid email or password" }
      }

      const user = result.rows[0]

      // Update last active
      await query("UPDATE users SET last_active_at = NOW() WHERE user_id = $1", [user.user_id])

      console.log("[v0] User logged in:", user.email)
      return { success: true, user }
    } catch (error) {
      console.error("[v0] Login error:", error)
      return { success: false, error: "Login failed" }
    }
  }

  // Get user with interests
  async getUserWithInterests(userId: string): Promise<UserWithInterests | null> {
    try {
      const userResult = await query<User>("SELECT * FROM users WHERE user_id = $1", [userId])

      if (userResult.rows.length === 0) {
        return null
      }

      const interestsResult = await query<{ hobbies: string[] }>(
        "SELECT hobbies FROM user_interests WHERE user_id = $1",
        [userId],
      )

      return {
        ...userResult.rows[0],
        interests: interestsResult.rows[0]?.hobbies || [],
      }
    } catch (error) {
      console.error("[v0] Error getting user with interests:", error)
      return null
    }
  }

  // Update user interests
  async updateInterests(userId: string, interests: string[]): Promise<void> {
    try {
      await query(
        `INSERT INTO user_interests (user_id, hobbies) 
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO UPDATE SET hobbies = $2`,
        [userId, interests],
      )

      console.log("[v0] Updated interests for user:", userId)
    } catch (error) {
      console.error("[v0] Error updating interests:", error)
      throw error
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await query<User>("SELECT * FROM users WHERE user_id = $1", [userId])
      return result.rows[0] || null
    } catch (error) {
      console.error("[v0] Error getting user:", error)
      return null
    }
  }
}

export const authService = new AuthService()
