"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Users, Settings, MessageCircle, Hash, UserPlus, Crown, UserMinus } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { ClickableAvatar } from "@/components/clickable-avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface GroupMember {
  user_id: string
  name: string
  avatar_url: string
  display_name: string
  joined_at: string
  is_leader: boolean
}

interface GroupDetails {
  group_id: string
  group_name: string
  group_description: string
  group_leader_id: string
  member_count: number
  tags: string[]
  is_disbanded: boolean
  is_member: boolean
  leader_name: string
}

export default function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const resolvedParams = use(params)
  const groupId = resolvedParams.groupId
  const router = useRouter()

  const [group, setGroup] = useState<GroupDetails | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [myNickname, setMyNickname] = useState("")
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [availableFriends, setAvailableFriends] = useState<any[]>([])
  const [selectedFriend, setSelectedFriend] = useState("")
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [showDisbandDialog, setShowDisbandDialog] = useState(false)
  const [showKickDialog, setShowKickDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showNameDialog, setShowNameDialog] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [selectedMembersForAction, setSelectedMembersForAction] = useState<string[]>([])

  useEffect(() => {
    const userStr = sessionStorage.getItem("currentUser")
    if (!userStr) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(userStr)
    setCurrentUser(userData)
    loadGroupDetails(userData.user_id)
  }, [groupId, router])

  const loadGroupDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        headers: { "x-user-id": userId },
      })

      if (response.ok) {
        const data = await response.json()
        setGroup(data.group)
        setMembers(data.members)

        const myMember = data.members.find((m: GroupMember) => m.user_id === userId)
        if (myMember) {
          setMyNickname(myMember.display_name)
        }
      }
    } catch (error) {
      console.error("[v0] Error loading group:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinGroup = async () => {
    if (!currentUser) return

    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST",
        headers: { "x-user-id": currentUser.user_id },
      })

      if (response.ok) {
        loadGroupDetails(currentUser.user_id)
        alert("Joined group successfully!")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to join group")
      }
    } catch (error) {
      console.error("[v0] Error joining group:", error)
      alert("Failed to join group")
    }
  }

  const handleSetNickname = async () => {
    const newNickname = prompt("Enter your nickname for this group:", myNickname)
    if (!newNickname || newNickname === myNickname) return

    try {
      const response = await fetch(`/api/groups/${groupId}/nickname`, {
        method: "PUT",
        headers: {
          "x-user-id": currentUser.user_id,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname: newNickname }),
      })

      if (response.ok) {
        setMyNickname(newNickname)
        loadGroupDetails(currentUser.user_id)
        alert("Nickname updated!")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update nickname")
      }
    } catch (error) {
      console.error("[v0] Error updating nickname:", error)
      alert("Failed to update nickname")
    }
  }

  const loadAvailableFriends = async (userId: string) => {
    try {
      const response = await fetch(`/api/friends/list?userId=${userId}`)
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

  const handleInviteFriend = async () => {
    if (!selectedFriend) {
      alert("Please select a friend to invite")
      return
    }

    try {
      const response = await fetch(`/api/groups/${groupId}/invite`, {
        method: "POST",
        headers: {
          "x-user-id": currentUser.user_id,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inviteeId: selectedFriend }),
      })

      if (response.ok) {
        setIsInviteOpen(false)
        setSelectedFriend("")
        alert("Invitation sent successfully!")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to send invitation")
      }
    } catch (error) {
      console.error("[v0] Error sending invitation:", error)
      alert("Failed to send invitation")
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
        loadGroupDetails(currentUser.user_id)
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
    if (selectedMembersForAction.length === 0) return

    try {
      const response = await fetch(`/api/groups/${groupId}/kick-members`, {
        method: "POST",
        headers: {
          "x-user-id": currentUser.user_id,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberIds: selectedMembersForAction }),
      })

      if (response.ok) {
        alert(`Kicked ${selectedMembersForAction.length} member(s)`)
        loadGroupDetails(currentUser.user_id)
        setShowKickDialog(false)
        setSelectedMembersForAction([])
      } else {
        alert("Failed to kick members")
      }
    } catch (error) {
      console.error("[v0] Error kicking members:", error)
      alert("Failed to kick members")
    }
  }

  const handleTransferLeader = async () => {
    if (selectedMembersForAction.length !== 1) {
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
        body: JSON.stringify({ newLeaderId: selectedMembersForAction[0] }),
      })

      if (response.ok) {
        alert("Leadership transferred successfully")
        loadGroupDetails(currentUser.user_id)
        setShowTransferDialog(false)
        setSelectedMembersForAction([])
      } else {
        alert("Failed to transfer leadership")
      }
    } catch (error) {
      console.error("[v0] Error transferring leadership:", error)
      alert("Failed to transfer leadership")
    }
  }

  const handleQuitGroup = async () => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Group not found</p>
          <Link href="/discover" className="text-gray-900 mt-2 inline-block">
            Back to Discover
          </Link>
        </div>
      </div>
    )
  }

  const isLeader = currentUser && group.group_leader_id === currentUser.user_id

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">FriendFinder</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-lg bg-gray-600 flex items-center justify-center text-3xl font-bold text-white">
              <Hash className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{group.group_name}</h1>
              {group.group_description && <p className="text-gray-600 mt-2">{group.group_description}</p>}
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {group.member_count} members
                </div>
                <div className="flex items-center gap-1">
                  <Crown className="h-4 w-4" />
                  {group.leader_name}
                </div>
              </div>
              {group.tags && group.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {group.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {group.is_disbanded && (
                <div className="mt-3 text-sm text-red-600 font-medium">This group has been disbanded</div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            {!group.is_member ? (
              <button
                onClick={handleJoinGroup}
                disabled={group.is_disbanded}
                className="flex-1 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Join Group
              </button>
            ) : (
              <>
                {!group.is_disbanded && (
                  <>
                    <Link
                      href={`/groups/${groupId}/chat`}
                      className="flex-1 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Group Chat
                    </Link>

                    {isLeader && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                                  loadGroupDetails(currentUser.user_id)
                                })
                              }
                            }}
                          >
                            Change Group Portrait
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setNewGroupName(group.group_name || "")
                              setShowNameDialog(true)
                            }}
                          >
                            Change Group Name
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Members</h2>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.user_id} className="flex items-center gap-3">
                <ClickableAvatar
                  userId={member.user_id}
                  userName={member.name}
                  size="md"
                  currentUserId={currentUser?.user_id}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{member.display_name}</p>
                    {member.is_leader && <Crown className="h-4 w-4 text-yellow-500" />}
                  </div>
                  {member.display_name !== member.name && <p className="text-sm text-gray-500">{member.name}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Group Name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Group Name</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter new group name"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowNameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateGroupName}>Update</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showKickDialog} onOpenChange={setShowKickDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kick Members</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">Select one or more members to remove from the group</p>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto py-4">
            {members
              .filter((m) => m.user_id !== currentUser?.user_id)
              .map((member) => (
                <div key={member.user_id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedMembersForAction.includes(member.user_id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembersForAction([...selectedMembersForAction, member.user_id])
                      } else {
                        setSelectedMembersForAction(selectedMembersForAction.filter((id) => id !== member.user_id))
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
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowKickDialog(false)
                setSelectedMembersForAction([])
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleKickMembers} disabled={selectedMembersForAction.length === 0}>
              Kick {selectedMembersForAction.length > 0 && `(${selectedMembersForAction.length})`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Leadership</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">Select exactly one member to become the new group leader</p>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto py-4">
            {members
              .filter((m) => m.user_id !== currentUser?.user_id)
              .map((member) => (
                <div key={member.user_id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <input
                    type="radio"
                    name="transfer"
                    checked={selectedMembersForAction.includes(member.user_id)}
                    onChange={() => setSelectedMembersForAction([member.user_id])}
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
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowTransferDialog(false)
                setSelectedMembersForAction([])
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleTransferLeader} disabled={selectedMembersForAction.length !== 1}>
              Transfer Leadership
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  )
}
