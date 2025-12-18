"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, MoreVertical, Trash2, Hash, MessageCircle, UserPlus } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { ClickableAvatar } from "@/components/clickable-avatar"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Friend {
  user_id: string
  name: string
  email: string
  age: number
  location: string
  bio: string
  avatar_url: string
  interests: string[]
  friendship_since: string
}

interface Group {
  group_id: string
  group_name: string
  group_description: string
  member_count: number
  avatar_url: string
  is_disbanded: boolean
}

type ContactItem = (Friend | Group) & {
  type: "friend" | "group"
  lastMessage?: string
  lastMessageTime?: string
}

interface FriendRequest {
  friendship_id: string
  requester_id: string
  requester_name: string
  requester_email: string
  avatar_url: string
  age: number
  location: string
  bio: string
  interests: string[]
  created_at: string
}

interface GroupInvitation {
  invitation_id: string
  group_id: string
  group_name: string
  group_description: string
  member_count: number
  inviter_id: string
  inviter_name: string
  created_at: string
}

export default function ContactsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [contacts, setContacts] = useState<ContactItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showMenu, setShowMenu] = useState<string | null>(null)
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [requestCount, setRequestCount] = useState(0)
  const [isRequestsOpen, setIsRequestsOpen] = useState(false)
  const [groupInvitations, setGroupInvitations] = useState<GroupInvitation[]>([])
  const [groupInvitationCount, setGroupInvitationCount] = useState(0)
  const [activeTab, setActiveTab] = useState<"friends" | "groups">("friends")

  useEffect(() => {
    const userStr = sessionStorage.getItem("currentUser")

    if (!userStr) {
      window.location.href = "/login"
      return
    }

    const userData = JSON.parse(userStr)
    setCurrentUser(userData)
    loadContacts(userData.user_id)
    loadFriendRequests(userData.user_id)
    loadGroupInvitations(userData.user_id)
  }, [])

  const loadFriendRequests = async (userId: string) => {
    try {
      const response = await fetch("/api/friends/requests", {
        headers: { "x-user-id": userId },
      })

      if (response.ok) {
        const data = await response.json()
        setFriendRequests(data.requests || [])
        setRequestCount((data.requests || []).length)
      }
    } catch (error) {
      console.error("Failed to load friend requests:", error)
    }
  }

  const loadGroupInvitations = async (userId: string) => {
    try {
      const response = await fetch("/api/groups/invitations", {
        headers: { "x-user-id": userId },
      })

      if (response.ok) {
        const data = await response.json()
        setGroupInvitations(data.invitations || [])
        setGroupInvitationCount((data.invitations || []).length)
      }
    } catch (error) {
      console.error("Failed to load group invitations:", error)
    }
  }

  const loadContacts = async (userId: string) => {
    setIsLoading(true)

    try {
      const [friendsRes, groupsRes] = await Promise.all([
        fetch("/api/friends", { headers: { "x-user-id": userId } }),
        fetch("/api/groups/my-groups", { headers: { "x-user-id": userId } }),
      ])

      const friends = friendsRes.ok ? await friendsRes.json() : { friends: [] }
      const groups = groupsRes.ok ? await groupsRes.json() : { groups: [] }

      const friendItems: ContactItem[] = (friends.friends || []).map((friend: Friend) => ({
        ...friend,
        type: "friend" as const,
      }))

      const groupItems: ContactItem[] = (groups.groups || []).map((group: Group) => ({
        ...group,
        type: "group" as const,
      }))

      const allContacts = [...friendItems, ...groupItems]
      setContacts(allContacts)
    } catch (error) {
      console.error("Failed to load contacts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      const response = await fetch("/api/friends/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser?.user_id || "",
        },
        body: JSON.stringify({ friendshipId }),
      })

      if (response.ok) {
        loadFriendRequests(currentUser.user_id)
        loadContacts(currentUser.user_id)
      }
    } catch (error) {
      console.error("Failed to accept friend request:", error)
    }
  }

  const handleRejectRequest = async (friendshipId: string) => {
    try {
      const response = await fetch("/api/friends/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser?.user_id || "",
        },
        body: JSON.stringify({ friendshipId }),
      })

      if (response.ok) {
        loadFriendRequests(currentUser.user_id)
      }
    } catch (error) {
      console.error("Failed to reject friend request:", error)
    }
  }

  const handleAcceptGroupInvitation = async (invitationId: string) => {
    try {
      const response = await fetch("/api/groups/accept-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser?.user_id || "",
        },
        body: JSON.stringify({ invitationId }),
      })

      if (response.ok) {
        loadGroupInvitations(currentUser.user_id)
        loadContacts(currentUser.user_id)
      }
    } catch (error) {
      console.error("Failed to accept group invitation:", error)
    }
  }

  const handleRejectGroupInvitation = async (invitationId: string) => {
    try {
      const response = await fetch("/api/groups/reject-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser?.user_id || "",
        },
        body: JSON.stringify({ invitationId }),
      })

      if (response.ok) {
        loadGroupInvitations(currentUser.user_id)
      }
    } catch (error) {
      console.error("Failed to reject group invitation:", error)
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm("Are you sure you want to remove this friend?")) return

    try {
      const response = await fetch("/api/friends/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser?.user_id || "",
        },
        body: JSON.stringify({ friendId }),
      })

      if (response.ok) {
        loadContacts(currentUser.user_id)
        setShowMenu(null)
      }
    } catch (error) {
      console.error("Failed to remove friend:", error)
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to leave this group?")) return

    try {
      const response = await fetch(`/api/groups/${groupId}/leave`, {
        method: "POST",
        headers: {
          "x-user-id": currentUser?.user_id || "",
        },
      })

      if (response.ok) {
        loadContacts(currentUser.user_id)
        setShowMenu(null)
      }
    } catch (error) {
      console.error("Failed to leave group:", error)
    }
  }

  const displayedContacts = contacts.filter((c) => {
    if (activeTab === "friends") return c.type === "friend"
    if (activeTab === "groups") return c.type === "group"
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AppHeader />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <Sheet open={isRequestsOpen} onOpenChange={setIsRequestsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative bg-transparent">
                <UserPlus className="h-4 w-4 mr-2" />
                Requests
                {(requestCount > 0 || groupInvitationCount > 0) && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {requestCount + groupInvitationCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Requests</SheetTitle>
              </SheetHeader>

              <Tabs defaultValue="friends" className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="friends">Friends {requestCount > 0 && `(${requestCount})`}</TabsTrigger>
                  <TabsTrigger value="groups">
                    Groups {groupInvitationCount > 0 && `(${groupInvitationCount})`}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="friends" className="space-y-4 mt-4">
                  {friendRequests.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No pending friend requests</p>
                  ) : (
                    friendRequests.map((request) => (
                      <div key={request.friendship_id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <ClickableAvatar
                            userId={request.requester_id}
                            userName={request.requester_name}
                            currentUserId={currentUser?.user_id}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{request.requester_name}</h3>
                            <p className="text-sm text-gray-500 truncate">{request.bio || "No bio"}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request.friendship_id)}
                            className="flex-1"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectRequest(request.friendship_id)}
                            className="flex-1"
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="groups" className="space-y-4 mt-4">
                  {groupInvitations.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No pending group invitations</p>
                  ) : (
                    groupInvitations.map((invitation) => (
                      <div key={invitation.invitation_id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gray-600 flex items-center justify-center flex-shrink-0">
                            <Hash className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{invitation.group_name}</h3>
                            <p className="text-sm text-gray-500 truncate">Invited by {invitation.inviter_name}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptGroupInvitation(invitation.invitation_id)}
                            className="flex-1"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectGroupInvitation(invitation.invitation_id)}
                            className="flex-1"
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "friends" | "groups")} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friends">Friends ({contacts.filter((c) => c.type === "friend").length})</TabsTrigger>
            <TabsTrigger value="groups">Groups ({contacts.filter((c) => c.type === "group").length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : displayedContacts.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              No {activeTab === "friends" ? "friends" : "groups"} yet
            </h2>
            <p className="mt-2 text-gray-500">
              {activeTab === "friends"
                ? "Start discovering people to make your first friend!"
                : "Join groups to connect with communities!"}
            </p>
            <Link href="/discover">
              <Button className="mt-4">Discover</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedContacts.map((contact) => {
              const isGroup = contact.type === "group"
              const id = isGroup ? (contact as Group).group_id : (contact as Friend).user_id
              const name = isGroup ? (contact as Group).group_name : (contact as Friend).name
              const isDisbanded = isGroup && (contact as Group).is_disbanded

              return (
                <div key={id} className="rounded-xl border border-gray-200 bg-white p-4 flex gap-4">
                  {isGroup ? (
                    <div className="h-16 w-16 rounded-lg bg-gray-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                      <Hash className="h-8 w-8" />
                    </div>
                  ) : (
                    <ClickableAvatar
                      userId={id}
                      userName={name}
                      size="lg"
                      currentUserId={currentUser?.user_id}
                      className="flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
                      {isGroup && (
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {(contact as Group).member_count} members
                        </span>
                      )}
                    </div>

                    {isDisbanded && <p className="text-sm text-red-600 mt-1">Group has been disbanded</p>}

                    {/* Removed lastMessage and lastMessageTime display */}
                  </div>

                  <div className="flex flex-col gap-2">
                    {!isDisbanded && (
                      <Link
                        href={isGroup ? `/groups/${id}/chat` : `/messages/${id}`}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Chat
                      </Link>
                    )}

                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(showMenu === id ? null : id)}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {showMenu === id && (
                        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
                          {isGroup ? (
                            <button
                              onClick={() => handleLeaveGroup(id)}
                              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-orange-600 hover:bg-gray-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Leave Group
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleRemoveFriend(id)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-orange-600 hover:bg-gray-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                                Remove Friend
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
