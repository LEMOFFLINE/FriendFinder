"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Send,
  ImageIcon,
  X,
  Hash,
  MoreVertical,
  Users,
  UserMinus,
  Crown,
  LogOut,
  UserPlus,
} from "lucide-react"
import { ClickableAvatar } from "@/components/clickable-avatar"
import { formatMessageTime, splitMessage, validateMessage } from "@/lib/utils/message-utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Message {
  message_id: string
  sender_id: string
  message_type: "text" | "image"
  content: string
  sent_at: string
  sender_name: string
  sender_avatar: string
  display_name: string
}

interface GroupInfo {
  group_name: string
  is_disbanded: boolean
  member_count: number
  group_leader_id: string
}

interface Friend {
  user_id: string
  name: string
}

export default function GroupChatPage({ params }: { params: Promise<{ groupId: string }> }) {
  const resolvedParams = use(params)
  const groupId = resolvedParams.groupId
  const router = useRouter()

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isLeader, setIsLeader] = useState(false)
  const [members, setMembers] = useState<any[]>([])
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showKickDialog, setShowKickDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showNameDialog, setShowNameDialog] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [availableFriends, setAvailableFriends] = useState<Friend[]>([])
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([])

  useEffect(() => {
    const userStr = sessionStorage.getItem("currentUser")
    if (!userStr) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(userStr)
    setCurrentUser(userData)

    loadGroupInfo(userData.user_id)
    loadMessages(userData.user_id)
  }, [groupId, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadGroupInfo = async (userId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        headers: { "x-user-id": userId },
      })

      if (response.ok) {
        const data = await response.json()
        setGroupInfo({
          group_name: data.group.group_name,
          is_disbanded: data.group.is_disbanded,
          member_count: data.group.member_count,
          group_leader_id: data.group.group_leader_id,
        })
        setIsLeader(data.group.group_leader_id === userId)
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error("[v0] Error loading group info:", error)
    }
  }

  const loadMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/messages/${groupId}?type=group`, {
        headers: { "x-user-id": userId },
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

  const loadAvailableFriends = async () => {
    try {
      const response = await fetch(`/api/friends/list?userId=${currentUser.user_id}`)
      if (response.ok) {
        const data = await response.json()
        // Filter out friends who are already members
        const memberIds = new Set(members.map((m) => m.user_id))
        const available = (data.friends || []).filter((f: any) => !memberIds.has(f.user_id))
        setAvailableFriends(available)
      }
    } catch (error) {
      console.error("[v0] Error loading friends:", error)
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
    if (!currentUser || (!newMessage.trim() && !selectedImage) || groupInfo?.is_disbanded) return

    const messageParts = splitMessage(newMessage.trim() || null, selectedImage)

    if (messageParts.length === 0) {
      alert("Cannot send empty message")
      return
    }

    try {
      for (const part of messageParts) {
        const validation = validateMessage(part.type, part.content)
        if (!validation.valid) {
          alert(validation.error)
          return
        }

        const response = await fetch("/api/messages/send", {
          method: "POST",
          headers: {
            "x-user-id": currentUser.user_id,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            groupId: groupId,
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
            display_name: currentUser.name,
          },
        ])
      }

      setNewMessage("")
      setSelectedImage(null)
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      alert("Failed to send message")
    }
  }

  const handleUpdateGroupName = async () => {
    if (!newGroupName.trim()) return

    try {
      const response = await fetch(`/api/groups/${groupId}/update-name`, {
        method: "PUT",
        headers: {
          "x-user-id": currentUser.user_id,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupName: newGroupName }),
      })

      if (response.ok) {
        alert("Group name updated successfully")
        loadGroupInfo(currentUser.user_id)
        setShowNameDialog(false)
      } else {
        alert("Failed to update group name")
      }
    } catch (error) {
      console.error("[v0] Error updating group name:", error)
      alert("Failed to update group name")
    }
  }

  const handleKickMembers = async () => {
    if (selectedMembers.length === 0) return

    try {
      const response = await fetch(`/api/groups/${groupId}/kick-members`, {
        method: "POST",
        headers: {
          "x-user-id": currentUser.user_id,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberIds: selectedMembers }),
      })

      if (response.ok) {
        alert(`Kicked ${selectedMembers.length} member(s)`)
        loadGroupInfo(currentUser.user_id)
        setShowKickDialog(false)
        setSelectedMembers([])
      } else {
        alert("Failed to kick members")
      }
    } catch (error) {
      console.error("[v0] Error kicking members:", error)
      alert("Failed to kick members")
    }
  }

  const handleTransferLeader = async () => {
    if (selectedMembers.length !== 1) {
      alert("Please select exactly one member to transfer leadership")
      return
    }

    const confirmed = confirm("Are you sure you want to transfer group leadership? This action cannot be undone.")
    if (!confirmed) return

    try {
      const response = await fetch(`/api/groups/${groupId}/transfer`, {
        method: "POST",
        headers: {
          "x-user-id": currentUser.user_id,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newLeaderId: selectedMembers[0] }),
      })

      if (response.ok) {
        alert("Leadership transferred successfully")
        loadGroupInfo(currentUser.user_id)
        setShowTransferDialog(false)
        setSelectedMembers([])
      } else {
        alert("Failed to transfer leadership")
      }
    } catch (error) {
      console.error("[v0] Error transferring leadership:", error)
      alert("Failed to transfer leadership")
    }
  }

  const handleLeaveGroup = async () => {
    const confirmed = confirm("Are you sure you want to leave this group?")
    if (!confirmed) return

    try {
      const response = await fetch(`/api/groups/${groupId}/leave`, {
        method: "POST",
        headers: { "x-user-id": currentUser.user_id },
      })

      if (response.ok) {
        alert("You have left the group")
        router.push("/contacts")
      } else {
        alert("Failed to leave group")
      }
    } catch (error) {
      console.error("[v0] Error leaving group:", error)
      alert("Failed to leave group")
    }
  }

  const handleInviteFriends = async () => {
    if (selectedFriendIds.length === 0) {
      alert("Please select at least one friend to invite")
      return
    }

    try {
      const promises = selectedFriendIds.map((friendId) =>
        fetch(`/api/groups/${groupId}/invite`, {
          method: "POST",
          headers: {
            "x-user-id": currentUser.user_id,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inviteeId: friendId }),
        }),
      )

      await Promise.all(promises)
      setShowInviteDialog(false)
      setSelectedFriendIds([])
      alert(`Invited ${selectedFriendIds.length} friend(s) successfully!`)
    } catch (error) {
      console.error("[v0] Error sending invitations:", error)
      alert("Failed to send invitations")
    }
  }

  const handleDisbandGroup = async () => {
    const confirmed = confirm(
      "Are you sure you want to disband this group? This action cannot be undone and will delete all group data.",
    )
    if (!confirmed) return

    try {
      const response = await fetch(`/api/groups/${groupId}/disband`, {
        method: "POST",
        headers: { "x-user-id": currentUser.user_id },
      })

      if (response.ok) {
        alert("Group disbanded successfully")
        router.push("/contacts")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to disband group")
      }
    } catch (error) {
      console.error("[v0] Error disbanding group:", error)
      alert("Failed to disband group")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!groupInfo) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Group not found</p>
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
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="h-10 w-10 rounded-lg bg-gray-600 flex items-center justify-center text-white">
                <Hash className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-semibold">{groupInfo.group_name}</h1>
                <p className="text-xs text-gray-500">
                  {groupInfo.is_disbanded ? "Disbanded" : `${groupInfo.member_count} members`}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors">
                <MoreVertical className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/groups/${groupId}`)}>
                  <Users className="h-4 w-4 mr-2" />
                  Group Info
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    loadAvailableFriends()
                    setShowInviteDialog(true)
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Friends
                </DropdownMenuItem>
                {isLeader ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowNameDialog(true)}>Change Group Name</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const url = prompt("Enter group portrait URL:")
                        if (url) {
                          fetch(`/api/groups/${groupId}/update-portrait`, {
                            method: "PUT",
                            headers: {
                              "x-user-id": currentUser.user_id,
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ avatarUrl: url }),
                          }).then(() => {
                            alert("Portrait updated")
                            loadGroupInfo(currentUser.user_id)
                          })
                        }
                      }}
                    >
                      Change Group Portrait
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowKickDialog(true)}>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Kick Off Members
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowTransferDialog(true)}>
                      <Crown className="h-4 w-4 mr-2" />
                      Transfer Leadership
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDisbandGroup} className="text-red-600">
                      Disband Group
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLeaveGroup} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Quit Group
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {groupInfo.is_disbanded && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-center">
            <p className="text-sm text-red-600 font-medium">
              This group has been disbanded. You can view messages but cannot send new ones.
            </p>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 border-2 border-gray-200 mb-4">
              <Hash className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to send a message!</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((message) => {
              const isOwn = message.sender_id === currentUser.user_id
              const isImage = message.message_type === "image"

              return (
                <div key={message.message_id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                  {!isOwn && (
                    <ClickableAvatar
                      userId={message.sender_id}
                      userName={message.sender_name}
                      size="sm"
                      currentUserId={currentUser?.user_id}
                      className="flex-shrink-0"
                    />
                  )}

                  <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
                    {!isOwn && <p className="text-xs text-gray-500 mb-1 px-1">{message.sender_name}</p>}
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
      {!groupInfo.is_disbanded && (
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
      )}

      {/* Dialogs for group management */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Group Name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter new group name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateGroupName}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showKickDialog} onOpenChange={setShowKickDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kick Members</DialogTitle>
            <DialogDescription>Select one or more members to remove from the group</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {members
              .filter((m) => m.user_id !== currentUser?.user_id)
              .map((member) => (
                <div key={member.user_id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.user_id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers([...selectedMembers, member.user_id])
                      } else {
                        setSelectedMembers(selectedMembers.filter((id) => id !== member.user_id))
                      }
                    }}
                    className="rounded"
                  />
                  <ClickableAvatar
                    userId={member.user_id}
                    userName={member.display_name}
                    size="sm"
                    currentUserId={currentUser?.user_id}
                  />
                  <span className="text-sm">{member.display_name}</span>
                </div>
              ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowKickDialog(false)
                setSelectedMembers([])
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleKickMembers} disabled={selectedMembers.length === 0}>
              Kick {selectedMembers.length > 0 && `(${selectedMembers.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Leadership</DialogTitle>
            <DialogDescription>Select exactly one member to become the new group leader</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {members
              .filter((m) => m.user_id !== currentUser?.user_id)
              .map((member) => (
                <div key={member.user_id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <input
                    type="radio"
                    name="transfer"
                    checked={selectedMembers.includes(member.user_id)}
                    onChange={() => setSelectedMembers([member.user_id])}
                    className="rounded"
                  />
                  <ClickableAvatar
                    userId={member.user_id}
                    userName={member.display_name}
                    size="sm"
                    currentUserId={currentUser?.user_id}
                  />
                  <span className="text-sm">{member.display_name}</span>
                </div>
              ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTransferDialog(false)
                setSelectedMembers([])
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleTransferLeader} disabled={selectedMembers.length !== 1}>
              Transfer Leadership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Friends to Group</DialogTitle>
            <DialogDescription>Select one or more friends to invite</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto py-4">
            {availableFriends.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No friends available to invite</p>
            ) : (
              availableFriends.map((friend) => (
                <div key={friend.user_id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedFriendIds.includes(friend.user_id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFriendIds([...selectedFriendIds, friend.user_id])
                      } else {
                        setSelectedFriendIds(selectedFriendIds.filter((id) => id !== friend.user_id))
                      }
                    }}
                    className="rounded"
                  />
                  <ClickableAvatar
                    userId={friend.user_id}
                    userName={friend.name}
                    size="sm"
                    currentUserId={currentUser?.user_id}
                  />
                  <span className="text-sm">{friend.name}</span>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteFriends} disabled={selectedFriendIds.length === 0}>
              Invite {selectedFriendIds.length > 0 && `(${selectedFriendIds.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
