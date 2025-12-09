"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, Search, UserPlus, Hash, Plus } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { AppHeader } from "@/components/app-header" // Import standardized header component
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function DiscoverPage() {
  const [user, setUser] = useState<any>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"groups" | "people">("groups")
  const [loading, setLoading] = useState(true)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [groupTags, setGroupTags] = useState("")

  useEffect(() => {
    const storedUser = sessionStorage.getItem("currentUser")
    if (storedUser) {
      const currentUser = JSON.parse(storedUser)
      setUser(currentUser)

      const fetchGroups = async () => {
        try {
          const response = await fetch("/api/groups/discover", {
            headers: { "x-user-id": currentUser.user_id },
          })

          if (response.ok) {
            const data = await response.json()
            setGroups(data.groups || [])
          }
        } catch (error) {
          console.error("[v0] Error fetching groups:", error)
        } finally {
          setLoading(false)
        }
      }

      const fetchPeople = async () => {
        try {
          const response = await fetch(`/api/users?excludeUserId=${currentUser.user_id}`, {
            headers: { "x-user-id": currentUser.user_id },
          })

          if (response.ok) {
            const data = await response.json()
            setPeople(data.users || [])
          }
        } catch (error) {
          console.error("[v0] Error fetching people:", error)
        }
      }

      fetchGroups()
      fetchPeople()
    }
  }, [])

  const filteredGroups = groups.filter((group) => {
    const query = searchQuery.toLowerCase()
    const nameMatch = group.group_name.toLowerCase().includes(query)
    const tagMatch = group.tags?.some((tag: string) => tag.toLowerCase().includes(query))
    return nameMatch || tagMatch
  })

  const filteredPeople = people.filter((person) => person.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleJoinGroup = async (group: any) => {
    if (!user) return

    try {
      const response = await fetch(`/api/groups/${group.group_id}/join`, {
        method: "POST",
        headers: { "x-user-id": user.user_id },
      })

      if (response.ok) {
        setGroups(groups.filter((g) => g.group_id !== group.group_id))
        alert(`Joined ${group.group_name}!`)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to join group")
      }
    } catch (error) {
      console.error("[v0] Error joining group:", error)
      alert("Failed to join group")
    }
  }

  const handleSendRequest = async (person: any) => {
    if (!user) return

    try {
      const response = await fetch(`/api/users/${person.user_id}/friend-request`, {
        method: "POST",
        headers: {
          "x-user-id": user.user_id,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setPeople(people.filter((p) => p.user_id !== person.user_id))
        alert(`Friend request sent to ${person.name}!`)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to send friend request")
      }
    } catch (error) {
      console.error("[v0] Error sending friend request:", error)
      alert("Failed to send friend request")
    }
  }

  const handleCreateGroup = async () => {
    if (!user || !groupName.trim()) {
      alert("Group name is required")
      return
    }

    try {
      const response = await fetch("/api/groups/create", {
        method: "POST",
        headers: {
          "x-user-id": user.user_id,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: groupName.trim(),
          description: groupDescription.trim() || null,
          tags: groupTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsCreateGroupOpen(false)
        setGroupName("")
        setGroupDescription("")
        setGroupTags("")
        alert("Group created successfully!")
        window.location.href = `/groups/${data.group.group_id}`
      } else {
        const data = await response.json()
        alert(data.error || "Failed to create group")
      }
    } catch (error) {
      console.error("[v0] Error creating group:", error)
      alert("Failed to create group")
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AppHeader />

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups by name or tag, or search people by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex-1 rounded-lg py-2 font-medium transition-colors ${
              activeTab === "groups"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            Groups ({filteredGroups.length})
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={`flex-1 rounded-lg py-2 font-medium transition-colors ${
              activeTab === "people"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            People ({filteredPeople.length})
          </button>
        </div>

        {activeTab === "groups" && (
          <div className="space-y-4">
            <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gray-900 hover:bg-gray-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Start a Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      maxLength={100}
                      placeholder="Enter group name"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      maxLength={500}
                      placeholder="Describe your group"
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={groupTags}
                      onChange={(e) => setGroupTags(e.target.value)}
                      placeholder="e.g. Gaming, Music, Study"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateGroup} disabled={!groupName.trim()}>
                      Create Group
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {filteredGroups.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                <Hash className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-4 text-gray-500">No groups found</p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.group_id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 rounded-lg bg-gray-600 flex items-center justify-center text-2xl font-bold text-white">
                      {getInitials(group.group_name)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{group.group_name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{group.group_description}</p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        {group.member_count} members
                      </div>
                      {group.tags && group.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {group.tags.map((tag: string) => (
                            <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link href={`/groups/${group.group_id}`}>
                        <button className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors text-gray-900">
                          View
                        </button>
                      </Link>
                      <button
                        onClick={() => handleJoinGroup(group)}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "people" && (
          <div className="space-y-4">
            {filteredPeople.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-4 text-gray-500">No people found</p>
              </div>
            ) : (
              filteredPeople.map((person) => (
                <div key={person.user_id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 rounded-lg bg-gray-600 flex items-center justify-center text-2xl font-bold text-white">
                      {getInitials(person.name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {person.name}
                          {person.age && `, ${person.age}`}
                        </h3>
                      </div>
                      {person.location && <p className="text-sm text-gray-500 mt-1">{person.location}</p>}
                      {person.interests && person.interests.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {person.interests.slice(0, 4).map((interest: string) => (
                            <span key={interest} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                              {interest}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleSendRequest(person)}
                      className="self-start rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
