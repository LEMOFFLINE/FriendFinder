"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, MapPin, MoreVertical, Trash2, Ban, Hash, LogOut } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

export default function ContactsPage() {
  const [user, setUser] = useState<any>(null)
  const [contacts, setContacts] = useState<any[]>([])
  const [joinedGroups, setJoinedGroups] = useState<any[]>([])
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({})
  const [showMenu, setShowMenu] = useState<string | null>(null)
  const [showGroupMenu, setShowGroupMenu] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const currentUser = JSON.parse(storedUser)
      setUser(currentUser)

      const storedContacts = JSON.parse(localStorage.getItem(`contacts_${currentUser.id}`) || "[]")
      setContacts(storedContacts)

      const joined = JSON.parse(localStorage.getItem(`joined_groups_${currentUser.id}`) || "[]")
      setJoinedGroups(joined)

      const counts: { [key: string]: number } = {}
      storedContacts.forEach((contact: any) => {
        const chatKey = `messages_${currentUser.id}_${contact.id}`
        const messages = JSON.parse(localStorage.getItem(chatKey) || "[]")
        const lastReadKey = `lastRead_${currentUser.id}_${contact.id}`
        const lastReadTime = localStorage.getItem(lastReadKey) || "0"

        const unreadMessages = messages.filter(
          (msg: any) => msg.senderId === contact.id && msg.timestamp > lastReadTime,
        )
        counts[contact.id] = unreadMessages.length
      })

      setUnreadCounts(counts)
    }
  }, [])

  const handleBlock = (contact: any) => {
    if (!user) return

    const blocked = JSON.parse(localStorage.getItem(`blocked_${user.id}`) || "[]")
    blocked.push(contact)
    localStorage.setItem(`blocked_${user.id}`, JSON.stringify(blocked))

    const updatedContacts = contacts.filter((c) => c.id !== contact.id)
    setContacts(updatedContacts)
    localStorage.setItem(`contacts_${user.id}`, JSON.stringify(updatedContacts))

    setShowMenu(null)
    alert(`Blocked ${contact.name}`)
  }

  const handleDelete = (contact: any) => {
    if (!user) return

    const confirmed = confirm(`Delete ${contact.name} from contacts? All messages will be removed.`)
    if (!confirmed) return

    const updatedContacts = contacts.filter((c) => c.id !== contact.id)
    setContacts(updatedContacts)
    localStorage.setItem(`contacts_${user.id}`, JSON.stringify(updatedContacts))

    const chatKey1 = `messages_${user.id}_${contact.id}`
    const chatKey2 = `messages_${contact.id}_${user.id}`
    localStorage.removeItem(chatKey1)
    localStorage.removeItem(chatKey2)
    localStorage.removeItem(`lastRead_${user.id}_${contact.id}`)

    setShowMenu(null)
  }

  const handleLeaveGroup = (group: any) => {
    if (!user) return

    const confirmed = confirm(`Leave ${group.name}? You can rejoin later from Discover.`)
    if (!confirmed) return

    const updated = joinedGroups.filter((g) => g.id !== group.id)
    setJoinedGroups(updated)
    localStorage.setItem(`joined_groups_${user.id}`, JSON.stringify(updated))

    setShowGroupMenu(null)
  }

  const handleBlockGroup = (group: any) => {
    if (!user) return

    const blocked = JSON.parse(localStorage.getItem(`blocked_groups_${user.id}`) || "[]")
    blocked.push(group)
    localStorage.setItem(`blocked_groups_${user.id}`, JSON.stringify(blocked))

    const updated = joinedGroups.filter((g) => g.id !== group.id)
    setJoinedGroups(updated)
    localStorage.setItem(`joined_groups_${user.id}`, JSON.stringify(updated))

    setShowGroupMenu(null)
    alert(`Blocked ${group.name}. You won't see it in Discover.`)
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

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">My Groups</h2>
          {joinedGroups.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <Hash className="h-10 w-10 mx-auto text-gray-400" />
              <p className="mt-3 text-sm text-gray-500">No groups yet. Join groups from Discover!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {joinedGroups.map((group) => (
                <div key={group.id} className="rounded-xl border border-gray-200 bg-white p-4 flex gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gray-600 flex items-center justify-center text-lg font-bold text-white">
                    {getInitials(group.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-gray-900">{group.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {group.memberCount} members
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/groups/${group.id}`}>
                      <button className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
                        Open
                      </button>
                    </Link>
                    <div className="relative">
                      <button
                        onClick={() => setShowGroupMenu(showGroupMenu === group.id ? null : group.id)}
                        className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {showGroupMenu === group.id && (
                        <div className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
                          <button
                            onClick={() => handleLeaveGroup(group)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-gray-900"
                          >
                            <LogOut className="h-4 w-4" />
                            Leave Group
                          </button>
                          <button
                            onClick={() => handleBlockGroup(group)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 transition-colors border-t border-gray-200"
                          >
                            <Ban className="h-4 w-4" />
                            Block Group
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold mb-4 text-gray-900">My Contacts</h2>

        {contacts.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No contacts yet</h3>
            <p className="mt-2 text-sm text-gray-500">Send friend requests to start connecting!</p>
            <Link
              href="/discover"
              className="mt-6 inline-block rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              Discover People
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="rounded-xl border border-gray-200 bg-white p-4 flex gap-4">
                <div className="h-20 w-20 rounded-lg bg-gray-600 flex items-center justify-center text-2xl font-bold text-white">
                  {getInitials(contact.name)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {contact.name}, {contact.age}
                  </h3>
                  <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {contact.location}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {contact.interests?.slice(0, 3).map((interest: string) => (
                      <span key={interest} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/messages/${contact.id}`}
                    className="relative rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                  >
                    Message
                    {unreadCounts[contact.id] > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadCounts[contact.id]}
                      </span>
                    )}
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(showMenu === contact.id ? null : contact.id)}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {showMenu === contact.id && (
                      <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
                        <button
                          onClick={() => handleBlock(contact)}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-orange-600 hover:bg-gray-50 transition-colors"
                        >
                          <Ban className="h-4 w-4" />
                          Block User
                        </button>
                        <button
                          onClick={() => handleDelete(contact)}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-gray-50 transition-colors border-t border-gray-200"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Contact
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

      <BottomNav />
    </div>
  )
}
