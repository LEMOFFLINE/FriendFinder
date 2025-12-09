"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, Compass, MessageCircle, User, Check, X, Clock } from "lucide-react"

export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const currentUser = JSON.parse(storedUser)
      setUser(currentUser)

      const receivedRequests = JSON.parse(localStorage.getItem(`friend_requests_received_${currentUser.id}`) || "[]")

      const now = Date.now()
      const validRequests = receivedRequests.filter((req: any) => {
        return req.status === "pending" && new Date(req.expiresAt).getTime() > now
      })

      setRequests(validRequests)
    }
  }, [])

  const handleAccept = (request: any) => {
    if (!user) return

    const contacts = JSON.parse(localStorage.getItem(`contacts_${user.id}`) || "[]")
    const requesterData = JSON.parse(localStorage.getItem("allUsers") || "[]").find(
      (u: any) => u.id === request.fromUserId,
    )

    if (requesterData && !contacts.find((c: any) => c.id === requesterData.id)) {
      contacts.push(requesterData)
      localStorage.setItem(`contacts_${user.id}`, JSON.stringify(contacts))

      const requesterContacts = JSON.parse(localStorage.getItem(`contacts_${request.fromUserId}`) || "[]")
      if (!requesterContacts.find((c: any) => c.id === user.id)) {
        requesterContacts.push({
          id: user.id,
          name: user.name,
          age: user.age,
          location: user.location,
          interests: user.interests,
          bio: user.bio,
        })
        localStorage.setItem(`contacts_${request.fromUserId}`, JSON.stringify(requesterContacts))
      }
    }

    const updatedRequest = { ...request, status: "accepted" }
    const allReceivedRequests = JSON.parse(localStorage.getItem(`friend_requests_received_${user.id}`) || "[]")
    const updatedReceivedRequests = allReceivedRequests.map((r: any) => (r.id === request.id ? updatedRequest : r))
    localStorage.setItem(`friend_requests_received_${user.id}`, JSON.stringify(updatedReceivedRequests))

    const sentRequests = JSON.parse(localStorage.getItem(`friend_requests_sent_${request.fromUserId}`) || "[]")
    const updatedSentRequests = sentRequests.map((r: any) => (r.id === request.id ? updatedRequest : r))
    localStorage.setItem(`friend_requests_sent_${request.fromUserId}`, JSON.stringify(updatedSentRequests))

    setRequests(requests.filter((r) => r.id !== request.id))
    alert(`You are now friends with ${request.fromUserName}!`)
  }

  const handleReject = (request: any) => {
    if (!user) return

    const updatedRequest = { ...request, status: "rejected" }
    const allReceivedRequests = JSON.parse(localStorage.getItem(`friend_requests_received_${user.id}`) || "[]")
    const updatedReceivedRequests = allReceivedRequests.map((r: any) => (r.id === request.id ? updatedRequest : r))
    localStorage.setItem(`friend_requests_received_${user.id}`, JSON.stringify(updatedReceivedRequests))

    const sentRequests = JSON.parse(localStorage.getItem(`friend_requests_sent_${request.fromUserId}`) || "[]")
    const updatedSentRequests = sentRequests.map((r: any) => (r.id === request.id ? updatedRequest : r))
    localStorage.setItem(`friend_requests_sent_${request.fromUserId}`, JSON.stringify(updatedSentRequests))

    setRequests(requests.filter((r) => r.id !== request.id))
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = Date.now()
    const expires = new Date(expiresAt).getTime()
    const diff = expires - now
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    return `${days} day${days !== 1 ? "s" : ""} left`
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-20">
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

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold mb-6">Friend Requests</h1>

        {requests.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-[var(--color-muted)]" />
            <h2 className="mt-4 text-xl font-semibold">No pending requests</h2>
            <p className="mt-2 text-[var(--color-muted)]">When people send you friend requests, they'll appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4"
              >
                <div className="flex gap-4">
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-2xl font-bold text-white">
                    {getInitials(request.fromUserName)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{request.fromUserName}</h3>
                    <div className="mt-1 flex items-center gap-1 text-sm text-[var(--color-muted)]">
                      <Clock className="h-3 w-3" />
                      {getTimeRemaining(request.expiresAt)}
                    </div>
                    {request.message && (
                      <p className="mt-2 text-sm text-[var(--color-muted)] italic">"{request.message}"</p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleAccept(request)}
                        className="flex items-center gap-1 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(request)}
                        className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-surface)] transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex justify-around py-3">
            <Link href="/discover" className="flex flex-col items-center gap-1 text-[var(--color-muted)]">
              <Compass className="h-6 w-6" />
              <span className="text-xs font-medium">Discover</span>
            </Link>
            <Link href="/contacts" className="flex flex-col items-center gap-1 text-[var(--color-muted)]">
              <MessageCircle className="h-6 w-6" />
              <span className="text-xs font-medium">Contacts</span>
            </Link>
            <Link href="/notifications" className="flex flex-col items-center gap-1 text-[var(--color-primary)]">
              <Users className="h-6 w-6" />
              <span className="text-xs font-medium">Requests</span>
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
