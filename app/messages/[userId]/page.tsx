"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Send, ImageIcon, X, MoreVertical } from "lucide-react"
import { ClickableAvatar } from "@/components/clickable-avatar"
import { formatMessageTime, splitMessage, validateMessage } from "@/lib/utils/message-utils"
import { AppHeader } from "@/components/app-header"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Message {
  message_id: string
  sender_id: string
  message_type: "text" | "image"
  content: string
  sent_at: string
  sender_name: string
  sender_avatar: string
}

export default function MessagePage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = use(params)
  const userId = resolvedParams.userId
  const router = useRouter()

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [chatPartner, setChatPartner] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const userStr = sessionStorage.getItem("currentUser")
    if (!userStr) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(userStr)
    setCurrentUser(userData)

    loadChatPartner(userId)
    loadMessages(userData.user_id, userId)
  }, [userId, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadChatPartner = async (partnerId: string) => {
    try {
      const response = await fetch(`/api/users/${partnerId}`)
      if (response.ok) {
        const data = await response.json()
        setChatPartner(data.user)
      }
    } catch (error) {
      console.error("[v0] Error loading chat partner:", error)
    }
  }

  const loadMessages = async (currentUserId: string, partnerId: string) => {
    try {
      const response = await fetch(`/api/messages/${partnerId}?type=1on1`, {
        headers: { "x-user-id": currentUserId },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("[v0] Error loading messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || (!newMessage.trim() && !selectedImage)) return

    const messageParts = splitMessage(newMessage.trim() || null, selectedImage)

    if (messageParts.length === 0) {
      alert("Cannot send empty message")
      return
    }

    try {
      for (const part of messageParts) {
        // Validate message
        const validation = validateMessage(part.type, part.content)
        if (!validation.valid) {
          alert(validation.error)
          return
        }

        // Send message
        const response = await fetch("/api/messages/send", {
          method: "POST",
          headers: {
            "x-user-id": currentUser.user_id,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiverId: userId,
            messageType: part.type,
            content: part.content,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          alert(data.error || "Failed to send message")
          return
        }

        const data = await response.json()
        setMessages((prev) => [
          ...prev,
          {
            ...data.message,
            sender_name: currentUser.name,
            sender_avatar: currentUser.avatar_url,
          },
        ])
      }

      // Clear inputs
      setNewMessage("")
      setSelectedImage(null)
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      alert("Failed to send message")
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleSetNickname = async () => {
    const nickname = prompt("Enter nickname for this user:")
    if (!nickname || !nickname.trim()) return

    try {
      const response = await fetch(`/api/users/${userId}/nickname`, {
        method: "PUT",
        headers: {
          "x-user-id": currentUser.user_id,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname: nickname.trim() }),
      })

      if (response.ok) {
        alert("Nickname set successfully")
        loadChatPartner(userId)
      } else {
        alert("Failed to set nickname")
      }
    } catch (error) {
      console.error("[v0] Error setting nickname:", error)
      alert("Failed to set nickname")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!chatPartner) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">User not found</p>
          <Link href="/contacts" className="text-gray-900 mt-2 inline-block">
            Back to Contacts
          </Link>
        </div>
      </div>
    )
  }

  const characterCount = newMessage.length
  const characterLimit = 200

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <AppHeader />

      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              {chatPartner && (
                <>
                  <ClickableAvatar
                    userId={chatPartner.user_id}
                    userName={chatPartner.display_name || chatPartner.name}
                    size="md"
                    currentUserId={currentUser?.user_id}
                  />
                  <div>
                    <h1 className="font-semibold">{chatPartner.display_name || chatPartner.name}</h1>
                    <p className="text-xs text-gray-500">{chatPartner.email}</p>
                  </div>
                </>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors">
                <MoreVertical className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSetNickname}>Set Nickname</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 border-2 border-gray-200 mb-4">
              <Send className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400 mt-1">Start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => {
              const isOwn = message.sender_id === currentUser.user_id
              const isImage = message.message_type === "image"

              return (
                <div key={message.message_id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                  <ClickableAvatar
                    userId={message.sender_id}
                    userName={message.sender_name}
                    size="sm"
                    currentUserId={currentUser?.user_id}
                    className="flex-shrink-0"
                  />

                  <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwn ? "bg-gray-900 text-white" : "bg-white border border-gray-200"
                      }`}
                    >
                      {isImage ? (
                        <img
                          src={message.content || "/placeholder.svg"}
                          alt="Shared image"
                          className="max-w-full rounded-lg"
                        />
                      ) : (
                        <p className="text-sm break-words">{message.content}</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 px-1">{formatMessageTime(message.sent_at)}</p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Selected"
              className="h-20 rounded-lg border border-gray-200"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="mx-auto max-w-3xl flex gap-2">
          <input type="file" id="image-upload" accept="image/*" onChange={handleImageSelect} className="hidden" />
          <label
            htmlFor="image-upload"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <ImageIcon className="h-5 w-5 text-gray-500" />
          </label>

          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              maxLength={characterLimit}
              className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 pr-12"
            />
            <span
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs ${
                characterCount > characterLimit * 0.9 ? "text-red-500" : "text-gray-400"
              }`}
            >
              {characterCount}/{characterLimit}
            </span>
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim() && !selectedImage}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
