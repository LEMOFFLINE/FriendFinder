"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Users, Compass, MessageCircle, User, Settings, LogOut, Shield } from "lucide-react"

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
    <div className="min-h-screen bg-[var(--color-surface)] pb-20">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">FriendFinder</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Profile Header */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-2xl font-bold text-white">
              {user.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-[var(--color-muted)]">{user.email}</p>
              <p className="text-sm text-[var(--color-muted)]">
                {user.age} years old • {user.location}
              </p>
            </div>
          </div>

          {/* Interests */}
          {user.interests && (
            <div className="mt-6">
              <p className="text-sm font-medium mb-2">Your Interests</p>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest: string) => (
                  <span
                    key={interest}
                    className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-sm text-[var(--color-primary)]"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Settings & Actions */}
        <div className="mt-6 space-y-3">
          <button className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 flex items-center gap-3 hover:bg-[var(--color-surface)] transition-colors">
            <Settings className="h-5 w-5 text-[var(--color-muted)]" />
            <span className="font-medium">Account Settings</span>
          </button>

          <button className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 flex items-center gap-3 hover:bg-[var(--color-surface)] transition-colors">
            <Shield className="h-5 w-5 text-[var(--color-muted)]" />
            <span className="font-medium">Privacy & Safety</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full rounded-xl border border-[var(--color-error)] bg-[var(--color-background)] p-4 flex items-center gap-3 text-[var(--color-error)] hover:bg-[var(--color-error)]/5 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>

        {/* PWA Info */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 p-6">
          <h3 className="font-semibold mb-2">About This App</h3>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed">
            FriendFinder is a Progressive Web App (PWA) built as a university project. It demonstrates modern web
            technologies including offline support, installability, and responsive design.
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex justify-around py-3">
            <Link href="/discover" className="flex flex-col items-center gap-1 text-[var(--color-muted)]">
              <Compass className="h-6 w-6" />
              <span className="text-xs font-medium">Discover</span>
            </Link>
            <Link href="/matches" className="flex flex-col items-center gap-1 text-[var(--color-muted)]">
              <MessageCircle className="h-6 w-6" />
              <span className="text-xs font-medium">Matches</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-1 text-[var(--color-primary)]">
              <User className="h-6 w-6" />
              <span className="text-xs font-medium">Profile</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
