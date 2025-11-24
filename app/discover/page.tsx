"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, Search, UserPlus, Hash } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function DiscoverPage() {
  const [user, setUser] = useState<any>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"groups" | "people">("groups")

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const currentUser = JSON.parse(storedUser)
      setUser(currentUser)

      const allGroups = JSON.parse(localStorage.getItem("allGroups") || "[]")
      const blockedGroups = JSON.parse(localStorage.getItem(`blocked_groups_${currentUser.id}`) || "[]")
      const joinedGroups = JSON.parse(localStorage.getItem(`joined_groups_${currentUser.id}`) || "[]")

      const blockedGroupIds = blockedGroups.map((g: any) => g.id)
      const joinedGroupIds = joinedGroups.map((g: any) => g.id)

      const availableGroups = allGroups
        .filter((g: any) => !blockedGroupIds.includes(g.id) && !joinedGroupIds.includes(g.id))
        .sort((a: any, b: any) => b.memberCount - a.memberCount)

      setGroups(availableGroups)

      const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")
      const pendingRequests = JSON.parse(localStorage.getItem(`friend_requests_sent_${currentUser.id}`) || "[]")
      const contacts = JSON.parse(localStorage.getItem(`contacts_${currentUser.id}`) || "[]")
      const blockedUsers = JSON.parse(localStorage.getItem(`blocked_${currentUser.id}`) || "[]")

      const pendingIds = pendingRequests.map((r: any) => r.toUserId)
      const contactIds = contacts.map((c: any) => c.id)
      const blockedIds = blockedUsers.map((b: any) => b.id)

      const availablePeople = allUsers
        .filter(
          (u: any) =>
            u.id !== currentUser.id &&
            !pendingIds.includes(u.id) &&
            !contactIds.includes(u.id) &&
            !blockedIds.includes(u.id),
        )
        .map((u: any) => {
          const sharedInterests = u.interests?.filter((i: string) => currentUser.interests?.includes(i)) || []
          const matchScore =
            currentUser.interests?.length > 0
              ? Math.round((sharedInterests.length / currentUser.interests.length) * 100)
              : 0
          return { ...u, matchScore, sharedInterests }
        })
        .sort((a, b) => b.matchScore - a.matchScore)

      setPeople(availablePeople)
    }
  }, [])

  const filteredGroups = groups.filter((group) => {
    const query = searchQuery.toLowerCase()
    const nameMatch = group.name.toLowerCase().includes(query)
    const tagMatch = group.tags?.some((tag: string) => tag.toLowerCase().includes(query))
    return nameMatch || tagMatch
  })

  const filteredPeople = people.filter((person) => person.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleJoinGroup = (group: any) => {
    if (!user) return

    const joined = JSON.parse(localStorage.getItem(`joined_groups_${user.id}`) || "[]")
    joined.push(group)
    localStorage.setItem(`joined_groups_${user.id}`, JSON.stringify(joined))

    setGroups(groups.filter((g) => g.id !== group.id))
    alert(`Joined ${group.name}!`)
  }

  const handleSendRequest = (person: any) => {
    if (!user) return

    const message = prompt("Send a message with your friend request (optional):")
    if (message === null) return

    const request = {
      id: Date.now().toString(),
      fromUserId: user.id,
      fromUserName: user.name,
      toUserId: person.id,
      toUserName: person.name,
      message: message || "",
      status: "pending",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }

    const sentRequests = JSON.parse(localStorage.getItem(`friend_requests_sent_${user.id}`) || "[]")
    sentRequests.push(request)
    localStorage.setItem(`friend_requests_sent_${user.id}`, JSON.stringify(sentRequests))

    const receivedRequests = JSON.parse(localStorage.getItem(`friend_requests_received_${person.id}`) || "[]")
    receivedRequests.push(request)
    localStorage.setItem(`friend_requests_received_${person.id}`, JSON.stringify(receivedRequests))

    setPeople(people.filter((p) => p.id !== person.id))
    alert(`Friend request sent to ${person.name}!`)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">FriendFinder</span>
          </Link>
        </div>
      </header>

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
            {filteredGroups.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                <Hash className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-4 text-gray-500">No groups found</p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 rounded-lg bg-gray-600 flex items-center justify-center text-2xl font-bold text-white">
                      {getInitials(group.name)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        {group.memberCount} members
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {group.tags?.map((tag: string) => (
                          <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link href={`/groups/${group.id}`}>
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
                <div key={person.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex gap-4">
                    <div className="h-16 w-16 rounded-lg bg-gray-600 flex items-center justify-center text-2xl font-bold text-white">
                      {getInitials(person.name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {person.name}, {person.age}
                        </h3>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          {person.matchScore}% match
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{person.location}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {person.interests?.slice(0, 4).map((interest: string) => (
                          <span
                            key={interest}
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              person.sharedInterests?.includes(interest)
                                ? "bg-gray-900 text-white font-medium"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
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
