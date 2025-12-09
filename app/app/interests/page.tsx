"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Users, Check } from 'lucide-react'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  const handleContinue = async () => {
    if (selectedInterests.length < 3) {
      alert("Please select at least 3 interests")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Get current user from session
      const userStr = sessionStorage.getItem('currentUser')
      if (!userStr) {
        setError('No user session found')
        setIsSubmitting(false)
        return
      }

      const user = JSON.parse(userStr)

      // Update interests via API
      const response = await fetch('/api/auth/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.user_id,
          interests: selectedInterests
        })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to update interests')
        setIsSubmitting(false)
        return
      }

      console.log('[v0] Interests updated successfully')
      router.push('/discover')
    } catch (error) {
      console.error('[v0] Error updating interests:', error)
      setError('Failed to update interests. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">FriendFinder</span>
          </div>
        </div>
      </header>

      {/* Interests Selection */}
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">What are your interests?</h1>
          <p className="mt-2 text-gray-600">Select at least 3 interests to help us find your perfect match</p>
          <p className="mt-1 text-sm text-gray-900 font-medium">{selectedInterests.length} selected</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

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
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-900 hover:shadow-md"
                  }
                `}
              >
                {interest}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg">
                    <Check className="h-4 w-4 text-gray-900" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={selectedInterests.length < 3 || isSubmitting}
          className="mt-8 w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isSubmitting ? 'Saving...' : 'Continue to Explore'}
        </button>
      </main>
    </div>
  )
}
