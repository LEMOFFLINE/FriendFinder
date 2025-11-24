"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Users, Settings, LogOut, Shield, MessageCircle } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    router.push("/")
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">FriendFinder</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Profile Header */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-600 text-2xl font-bold text-white">
              {user.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-500">
                {user.age} years old • {user.location}
              </p>
            </div>
          </div>

          {/* Interests */}
          {user.interests && (
            <div className="mt-6">
              <p className="text-sm font-medium mb-2 text-gray-900">Your Interests</p>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest: string) => (
                  <span key={interest} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings & Actions */}
        <div className="mt-6 space-y-3">
          <button className="w-full rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
            <Settings className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-900">Account Settings</span>
          </button>

          <Link
            href="/privacy"
            className="w-full rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <Shield className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-900">Privacy & Safety</span>
          </Link>

          <Link
            href="/feed"
            className="w-full rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <MessageCircle className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-900">My Feed</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full rounded-xl border border-red-200 bg-white p-4 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>

        {/* PWA Info */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <h3 className="font-semibold mb-2 text-gray-900">About This App</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            FriendFinder is a Progressive Web App (PWA) built as a university project. It demonstrates modern web
            technologies including offline support, installability, and responsive design.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
