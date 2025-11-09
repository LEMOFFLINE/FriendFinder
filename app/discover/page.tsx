"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, Compass, MessageCircle, User, MapPin, Heart } from "lucide-react"

// Mock user data
const MOCK_USERS = [
  {
    id: 1,
    name: "Sarah Chen",
    age: 24,
    location: "London",
    bio: "Coffee enthusiast and bookworm. Always up for a good conversation!",
    interests: ["Reading", "Coffee", "Photography", "Travel"],
    matchScore: 85,
    image: "/friendly-woman-portrait.jpg",
  },
  {
    id: 2,
    name: "James Wilson",
    age: 27,
    location: "Manchester",
    bio: "Fitness junkie and tech geek. Let's grab a smoothie and talk startups!",
    interests: ["Fitness", "Technology", "Hiking", "Gaming"],
    matchScore: 78,
    image: "/friendly-man-portrait.jpg",
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    age: 23,
    location: "London",
    bio: "Artist by day, gamer by night. Looking for creative souls to collaborate with.",
    interests: ["Art", "Gaming", "Music", "Movies"],
    matchScore: 92,
    image: "/creative-woman-portrait.png",
  },
]

export default function DiscoverPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const currentUser = MOCK_USERS[currentIndex]

  const handlePass = () => {
    if (currentIndex < MOCK_USERS.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0)
    }
  }

  const handleConnect = () => {
    const connections = JSON.parse(localStorage.getItem("connections") || "[]")
    connections.push(currentUser)
    localStorage.setItem("connections", JSON.stringify(connections))

    if (currentIndex < MOCK_USERS.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0)
    }
  }

  if (!currentUser) return null

  return (
    <div className="min-h-screen bg-[var(--color-surface)] pb-20">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">FriendFinder</span>
            </div>
            <span className="text-sm text-[var(--color-muted)]">Welcome, {user?.name?.split(" ")[0]}!</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] overflow-hidden">
          {/* User Image */}
          <div className="relative aspect-[3/4] bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20">
            <img
              src={currentUser.image || "/placeholder.svg"}
              alt={currentUser.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute top-4 right-4 rounded-full bg-[var(--color-primary)] px-3 py-1 text-sm font-medium text-white">
              {currentUser.matchScore}% Match
            </div>
          </div>

          {/* User Info */}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {currentUser.name}, {currentUser.age}
                </h2>
                <div className="mt-1 flex items-center gap-1 text-sm text-[var(--color-muted)]">
                  <MapPin className="h-4 w-4" />
                  {currentUser.location}
                </div>
              </div>
            </div>

            <p className="mt-4 text-[var(--color-muted)] leading-relaxed">{currentUser.bio}</p>

            {/* Interests */}
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Shared Interests</p>
              <div className="flex flex-wrap gap-2">
                {currentUser.interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-sm text-[var(--color-primary)]"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={handlePass}
                className="flex-1 rounded-lg border-2 border-[var(--color-border)] px-4 py-3 font-medium hover:bg-[var(--color-surface)] transition-colors"
              >
                Pass
              </button>
              <button
                onClick={handleConnect}
                className="flex-1 rounded-lg bg-[var(--color-primary)] px-4 py-3 font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors flex items-center justify-center gap-2"
              >
                <Heart className="h-5 w-5" />
                Connect
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex justify-around py-3">
            <Link href="/discover" className="flex flex-col items-center gap-1 text-[var(--color-primary)]">
              <Compass className="h-6 w-6" />
              <span className="text-xs font-medium">Discover</span>
            </Link>
            <Link href="/matches" className="flex flex-col items-center gap-1 text-[var(--color-muted)]">
              <MessageCircle className="h-6 w-6" />
              <span className="text-xs font-medium">Matches</span>
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
