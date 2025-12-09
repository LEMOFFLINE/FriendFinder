"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, Compass, MessageCircle, User, MapPin, MoreVertical, Trash2 } from "lucide-react"

export default function MatchesPage() {
  const [user, setUser] = useState<any>(null)
  const [connections, setConnections] = useState<any[]>([])
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({})
  const [showMenu, setShowMenu] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const currentUser = JSON.parse(storedUser)
      setUser(currentUser)

      const storedConnections = localStorage.getItem("connections")
      if (storedConnections) {
        setConnections(JSON.parse(storedConnections))
      }

      const counts: { [key: string]: number } = {}

      if (currentUser.id && storedConnections) {
        const conns = JSON.parse(storedConnections)
        conns.forEach((conn: any) => {
          const chatKey = `messages_${currentUser.id}_${conn.id}`
          const messages = JSON.parse(localStorage.getItem(chatKey) || "[]")
          const lastReadKey = `lastRead_${currentUser.id}_${conn.id}`
          const lastReadTime = localStorage.getItem(lastReadKey) || "0"

          const unreadMessages = messages.filter((msg: any) => msg.senderId === conn.id && msg.timestamp > lastReadTime)
          counts[conn.id] = unreadMessages.length
        })
      }

      setUnreadCounts(counts)
    }
  }, [])

  const handleDelete = (connection: any) => {
    if (!user) return

    const confirmed = confirm(
      `Are you sure you want to delete ${connection.name}? All message history will be permanently removed.`,
    )

    if (!confirmed) return

    // Remove from connections
    const updatedConnections = connections.filter((c) => c.id !== connection.id)
    setConnections(updatedConnections)
    localStorage.setItem("connections", JSON.stringify(updatedConnections))

    // Delete all messages with this user
    const chatKey1 = `messages_${user.id}_${connection.id}`
    const chatKey2 = `messages_${connection.id}_${user.id}`
    localStorage.removeItem(chatKey1)
    localStorage.removeItem(chatKey2)
    localStorage.removeItem(`lastRead_${user.id}_${connection.id}`)

    // Close menu
    setShowMenu(null)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-20">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">FriendFinder</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold mb-6">Your Connections</h1>

        {connections.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-12 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-[var(--color-muted)]" />
            <h2 className="mt-4 text-xl font-semibold">No connections yet</h2>
            <p className="mt-2 text-[var(--color-muted)]">Start discovering people to make your first connection!</p>
            <Link
              href="/discover"
              className="mt-6 inline-block rounded-lg bg-[var(--color-primary)] px-6 py-2 font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Start Discovering
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 flex gap-4"
              >
                <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-2xl font-bold text-white">
                  {getInitials(connection.name)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {connection.name}, {connection.age}
                  </h3>
                  <div className="mt-1 flex items-center gap-1 text-sm text-[var(--color-muted)]">
                    <MapPin className="h-3 w-3" />
                    {connection.location}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {connection.interests?.slice(0, 3).map((interest: string) => (
                      <span
                        key={interest}
                        className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs text-[var(--color-primary)]"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/messages/${connection.id}`}
                    className="relative rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors"
                  >
                    Message
                    {unreadCounts[connection.id] > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadCounts[connection.id]}
                      </span>
                    )}
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(showMenu === connection.id ? null : connection.id)}
                      className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-surface)] transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {showMenu === connection.id && (
                      <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg z-10">
                        <button
                          onClick={() => handleDelete(connection)}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-[var(--color-surface)] transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Connection
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex justify-around py-3">
            <Link href="/discover" className="flex flex-col items-center gap-1 text-[var(--color-muted)]">
              <Compass className="h-6 w-6" />
              <span className="text-xs font-medium">Discover</span>
            </Link>
            <Link href="/matches" className="flex flex-col items-center gap-1 text-[var(--color-primary)]">
              <MessageCircle className="h-6 w-6" />
              <span className="text-xs font-medium">Matches</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-1 text-[var(--color-muted)]">
              <User className="h-6 w-6" />
              <span className="text-xs font-medium">Profile</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
