"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Send, Users } from "lucide-react"

export default function MessagePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [chatPartner, setChatPartner] = useState<any>(null)

  useEffect(() => {
    // Get current logged in user
    const storedUser = localStorage.getItem("user")
    const currentUserId = localStorage.getItem("currentUserId")
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
    }

    // Get chat partner from connections
    const connections = JSON.parse(localStorage.getItem("connections") || "[]")
    const partner = connections.find((c: any) => c.id.toString() === userId)
    if (partner) {
      setChatPartner(partner)
    }

    if (currentUserId) {
      const chatKey = `messages_${currentUserId}_${userId}`
      const storedMessages = localStorage.getItem(chatKey)
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages))
      }

      // Mark all messages as read
      const lastReadKey = `lastRead_${currentUserId}_${userId}`
      localStorage.setItem(lastReadKey, new Date().toISOString())
    }
  }, [userId])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return

    const currentUserId = localStorage.getItem("currentUserId")
    if (!currentUserId) return

    const message = {
      id: Date.now(),
      senderId: currentUserId,
      text: newMessage,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)

    const chatKey = `messages_${currentUserId}_${userId}`
    localStorage.setItem(chatKey, JSON.stringify(updatedMessages))

    const otherChatKey = `messages_${userId}_${currentUserId}`
    const otherMessages = JSON.parse(localStorage.getItem(otherChatKey) || "[]")
    otherMessages.push(message)
    localStorage.setItem(otherChatKey, JSON.stringify(otherMessages))

    setNewMessage("")
  }

  const getInitials = (name: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (!chatPartner) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-muted)]">User not found</p>
          <Link href="/matches" className="text-[var(--color-primary)] mt-2 inline-block">
            Back to Matches
          </Link>
        </div>
      </div>
    )
  }

  const currentUserId = localStorage.getItem("currentUserId")

  return (
    <div className="flex h-screen flex-col bg-[var(--color-surface)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--color-surface)] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold">
                {getInitials(chatPartner.name)}
              </div>
              <div>
                <h1 className="font-semibold">{chatPartner.name}</h1>
                <p className="text-xs text-[var(--color-muted)]">{chatPartner.location}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] mb-4">
              <Users className="h-8 w-8 text-[var(--color-muted)]" />
            </div>
            <p className="text-[var(--color-muted)]">No messages yet</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">Start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === currentUserId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    message.senderId === currentUserId
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface)] border border-[var(--color-border)]"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.senderId === currentUserId ? "text-white/70" : "text-[var(--color-muted)]"
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-background)] px-4 py-4">
        <form onSubmit={handleSendMessage} className="mx-auto max-w-3xl flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
