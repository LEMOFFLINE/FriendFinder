"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Send, Calendar, Users, MoreVertical } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Message {
  id: string
  userId: number
  userName: string
  content: string
  timestamp: number
}

interface Event {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  maxParticipants?: number
  creatorId: number
  participants: number[]
  blockedUsers: number[]
}

interface Group {
  id: string
  name: string
  description: string
  tags: string[]
  members: number[]
  creatorId: number
  createdAt: number
}

export default function GroupPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.groupId as string

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [group, setGroup] = useState<Group | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [eventForm, setEventForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    maxParticipants: "",
  })

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "null")
    if (!user) {
      router.push("/login")
      return
    }
    setCurrentUser(user)

    // Load group
    const groups = JSON.parse(localStorage.getItem("allGroups") || "[]")
    const foundGroup = groups.find((g: Group) => g.id === groupId)
    if (!foundGroup) {
      router.push("/discover")
      return
    }
    setGroup(foundGroup)

    // Load messages
    const savedMessages = JSON.parse(localStorage.getItem(`groupMessages_${groupId}`) || "[]")
    setMessages(savedMessages)

    // Load events
    const savedEvents = JSON.parse(localStorage.getItem(`groupEvents_${groupId}`) || "[]")
    setEvents(savedEvents)
  }, [groupId, router])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser) return

    const message: Message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      content: newMessage,
      timestamp: Date.now(),
    }

    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)
    localStorage.setItem(`groupMessages_${groupId}`, JSON.stringify(updatedMessages))
    setNewMessage("")
  }

  const handleCreateEvent = () => {
    if (!eventForm.name || !eventForm.startDate || !currentUser) return

    const event: Event = {
      id: Date.now().toString(),
      name: eventForm.name,
      description: eventForm.description,
      startDate: eventForm.startDate,
      endDate: eventForm.endDate || eventForm.startDate,
      maxParticipants: eventForm.maxParticipants ? Number.parseInt(eventForm.maxParticipants) : undefined,
      creatorId: currentUser.id,
      participants: [currentUser.id],
      blockedUsers: [],
    }

    const updatedEvents = [...events, event]
    setEvents(updatedEvents)
    localStorage.setItem(`groupEvents_${groupId}`, JSON.stringify(updatedEvents))
    setShowCreateEvent(false)
    setEventForm({ name: "", description: "", startDate: "", endDate: "", maxParticipants: "" })
  }

  const handleJoinEvent = (eventId: string) => {
    if (!currentUser) return

    const updatedEvents = events.map((event) => {
      if (event.id === eventId) {
        // Check if user is blocked
        if (event.blockedUsers.includes(currentUser.id)) {
          alert("You cannot join this event")
          return event
        }

        // Check if already joined
        if (event.participants.includes(currentUser.id)) {
          return event
        }

        // Check max participants
        if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
          alert("Event is full")
          return event
        }

        return { ...event, participants: [...event.participants, currentUser.id] }
      }
      return event
    })

    setEvents(updatedEvents)
    localStorage.setItem(`groupEvents_${groupId}`, JSON.stringify(updatedEvents))
  }

  const handleLeaveEvent = (eventId: string) => {
    if (!currentUser) return

    const updatedEvents = events.map((event) => {
      if (event.id === eventId && event.participants.includes(currentUser.id)) {
        return {
          ...event,
          participants: event.participants.filter((id) => id !== currentUser.id),
        }
      }
      return event
    })

    setEvents(updatedEvents)
    localStorage.setItem(`groupEvents_${groupId}`, JSON.stringify(updatedEvents))
  }

  const handleKickFromEvent = (eventId: string, userId: number) => {
    if (!currentUser) return

    const updatedEvents = events.map((event) => {
      if (event.id === eventId && event.creatorId === currentUser.id) {
        return {
          ...event,
          participants: event.participants.filter((id) => id !== userId),
        }
      }
      return event
    })

    setEvents(updatedEvents)
    localStorage.setItem(`groupEvents_${groupId}`, JSON.stringify(updatedEvents))
  }

  const handleBlockFromEvent = (eventId: string, userId: number) => {
    if (!currentUser) return

    const updatedEvents = events.map((event) => {
      if (event.id === eventId && event.creatorId === currentUser.id) {
        return {
          ...event,
          participants: event.participants.filter((id) => id !== userId),
          blockedUsers: [...event.blockedUsers, userId],
        }
      }
      return event
    })

    setEvents(updatedEvents)
    localStorage.setItem(`groupEvents_${groupId}`, JSON.stringify(updatedEvents))
  }

  if (!group || !currentUser) return null

  const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")
  const isCreator = group.creatorId === currentUser.id

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/discover">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{group.name}</h1>
              <p className="text-sm text-muted-foreground">{group.members.length} members</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6">
            <Card className="p-4">
              <div className="space-y-4 h-[500px] overflow-y-auto mb-4">
                {messages.map((message) => {
                  const isOwnMessage = message.userId === currentUser.id
                  return (
                    <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {!isOwnMessage && <p className="text-xs font-semibold mb-1">{message.userName}</p>}
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Group Events</h2>
              <Button onClick={() => setShowCreateEvent(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>

            {showCreateEvent && (
              <Card className="p-4 mb-4">
                <h3 className="font-bold mb-4">Create New Event</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Event Name"
                    value={eventForm.name}
                    onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Start Date</label>
                      <Input
                        type="datetime-local"
                        value={eventForm.startDate}
                        onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">End Date</label>
                      <Input
                        type="datetime-local"
                        value={eventForm.endDate}
                        onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <Input
                    type="number"
                    placeholder="Max Participants (optional)"
                    value={eventForm.maxParticipants}
                    onChange={(e) => setEventForm({ ...eventForm, maxParticipants: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreateEvent}>Create Event</Button>
                    <Button variant="outline" onClick={() => setShowCreateEvent(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="space-y-4">
              {events
                .filter((event) => !event.blockedUsers.includes(currentUser.id))
                .map((event) => {
                  const isEventCreator = event.creatorId === currentUser.id
                  const isParticipant = event.participants.includes(currentUser.id)
                  const isFull = event.maxParticipants && event.participants.length >= event.maxParticipants

                  return (
                    <Card key={event.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{event.name}</h3>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                        {isEventCreator && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Creator</span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(event.startDate).toLocaleString()} - {new Date(event.endDate).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {event.participants.length}
                            {event.maxParticipants ? ` / ${event.maxParticipants}` : ""} participants
                          </span>
                        </div>
                      </div>

                      {isEventCreator && event.participants.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                          <p className="text-sm font-semibold mb-2">Participants:</p>
                          <div className="space-y-2">
                            {event.participants.map((participantId) => {
                              const participant = allUsers.find((u: any) => u.id === participantId)
                              if (!participant || participantId === currentUser.id) return null

                              return (
                                <div key={participantId} className="flex items-center justify-between">
                                  <span className="text-sm">{participant.name}</span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onClick={() => handleKickFromEvent(event.id, participantId)}>
                                        Kick from Event
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleBlockFromEvent(event.id, participantId)}
                                        className="text-destructive"
                                      >
                                        Block from Event
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
                        {!isParticipant ? (
                          <Button onClick={() => handleJoinEvent(event.id)} disabled={isFull} className="w-full">
                            {isFull ? "Event Full" : "Join Event"}
                          </Button>
                        ) : (
                          <Button variant="outline" onClick={() => handleLeaveEvent(event.id)} className="w-full">
                            Leave Event
                          </Button>
                        )}
                      </div>
                    </Card>
                  )
                })}

              {events.filter((event) => !event.blockedUsers.includes(currentUser.id)).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No events yet. Create one to get started!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
