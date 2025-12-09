"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "../database/schema"
import { db } from "../database/client"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user from database on mount
    const loadUser = async () => {
      const sessionUserId = sessionStorage.getItem("currentUserId")
      if (sessionUserId) {
        const userData = await db.getUserById(sessionUserId)
        if (userData) {
          setUser(userData)
        }
      }
      setIsLoading(false)
    }

    loadUser()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    sessionStorage.setItem("currentUserId", userData.user_id)
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem("currentUserId")
  }

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    await db.updateUser(user.user_id, updates)
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
