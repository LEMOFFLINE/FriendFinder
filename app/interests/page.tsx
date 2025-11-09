"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Check } from "lucide-react"

const INTERESTS = [
  "Photography",
  "Hiking",
  "Cooking",
  "Gaming",
  "Reading",
  "Music",
  "Fitness",
  "Travel",
  "Art",
  "Technology",
  "Sports",
  "Movies",
  "Dancing",
  "Writing",
  "Yoga",
  "Cycling",
  "Coffee",
  "Pets",
  "Fashion",
  "Gardening",
]

export default function InterestsPage() {
  const router = useRouter()
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  const handleContinue = () => {
    if (selectedInterests.length < 3) {
      alert("Please select at least 3 interests")
      return
    }
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    user.interests = selectedInterests
    localStorage.setItem("user", JSON.stringify(user))
    router.push("/discover")
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">FriendFinder</span>
          </div>
        </div>
      </header>

      {/* Interests Selection */}
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">What are your interests?</h1>
          <p className="mt-2 text-[var(--color-muted)]">
            Select at least 3 interests to help us find your perfect matches
          </p>
          <p className="mt-1 text-sm text-[var(--color-primary)] font-medium">{selectedInterests.length} selected</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {INTERESTS.map((interest) => {
            const isSelected = selectedInterests.includes(interest)
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`
                  relative rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all
                  ${
                    isSelected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "border-[var(--color-border)] bg-[var(--color-background)] hover:border-[var(--color-primary)]/50"
                  }
                `}
              >
                {interest}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)]">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={selectedInterests.length < 3}
          className="mt-8 w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Discover
        </button>
      </main>
    </div>
  )
}
