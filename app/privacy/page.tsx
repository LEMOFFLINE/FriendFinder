"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, ArrowLeft, UserX } from "lucide-react"

export default function PrivacyPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [blockedUsers, setBlockedUsers] = useState<any[]>([])

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const currentUser = JSON.parse(storedUser)
      setUser(currentUser)

      // Load blocked users
      const blocked = JSON.parse(localStorage.getItem(`blocked_${currentUser.id}`) || "[]")
      setBlockedUsers(blocked)
    }
  }, [])

  const handleUnblock = (blockedUser: any) => {
    if (!user) return

    const blocked = JSON.parse(localStorage.getItem(`blocked_${user.id}`) || "[]")
    const updated = blocked.filter((u: any) => u.id !== blockedUser.id)
    localStorage.setItem(`blocked_${user.id}`, JSON.stringify(updated))
    setBlockedUsers(updated)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">Privacy & Safety</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6">
          <h2 className="text-xl font-semibold mb-4">Blocked Users</h2>
          <p className="text-sm text-[var(--color-muted)] mb-6">
            Blocked users cannot send you messages or see your profile in discovery.
          </p>

          {blockedUsers.length === 0 ? (
            <div className="text-center py-8">
              <UserX className="h-12 w-12 mx-auto text-[var(--color-muted)]" />
              <p className="mt-4 text-[var(--color-muted)]">No blocked users</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((blockedUser) => (
                <div
                  key={blockedUser.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-[var(--color-border)]"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold">
                    {getInitials(blockedUser.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{blockedUser.name}</h3>
                    <p className="text-sm text-[var(--color-muted)]">Blocked</p>
                  </div>
                  <button
                    onClick={() => handleUnblock(blockedUser)}
                    className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-surface)] transition-colors"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6">
          <h2 className="text-xl font-semibold mb-4">Privacy Information</h2>
          <div className="space-y-4 text-sm text-[var(--color-muted)]">
            <p>
              Your data is stored locally on your device. We take your privacy seriously and do not share your
              information with third parties.
            </p>
            <p>
              When you block a user, they will not be able to see your profile or send you messages. You can unblock
              them at any time from this page.
            </p>
            <p>
              When you delete a connection, all message history with that user will be permanently removed from your
              device.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
