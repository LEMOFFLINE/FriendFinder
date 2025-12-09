"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Camera, MapPin, User, Heart, Upload, FileText } from "lucide-react"
import { Button } from "./ui/button"

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

interface EditProfileDialogProps {
  user: any
  onClose: () => void
  onSave: (updatedUser: any) => void
}

export function EditProfileDialog({ user, onClose, onSave }: EditProfileDialogProps) {
  const [name, setName] = useState(user.name || "")
  const [location, setLocation] = useState(user.location || "")
  const [bio, setBio] = useState(user.bio || "")
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user.interests || [])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      let avatarUrl = user.avatar_url

      // Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData()
        formData.append("file", avatarFile)
        formData.append("userId", user.user_id)

        const uploadResponse = await fetch("/api/upload/avatar", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload avatar")
        }

        const uploadData = await uploadResponse.json()
        avatarUrl = uploadData.url
      }

      // Update user profile
      const profileResponse = await fetch(`/api/users/${user.user_id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          location,
          bio,
          avatar_url: avatarUrl,
        }),
      })

      if (!profileResponse.ok) {
        throw new Error("Failed to update profile")
      }

      // Update interests
      const interestsResponse = await fetch(`/api/users/${user.user_id}/interests`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: selectedInterests }),
      })

      if (!interestsResponse.ok) {
        throw new Error("Failed to update interests")
      }

      // Update session storage
      const updatedUser = {
        ...user,
        name,
        location,
        bio,
        avatar_url: avatarUrl,
        interests: selectedInterests,
      }
      sessionStorage.setItem("currentUser", JSON.stringify(updatedUser))
      onSave(updatedUser)
      onClose()
    } catch (err: any) {
      console.error("[v0] Error updating profile:", err)
      setError(err.message || "Failed to update profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Avatar */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
              <Camera className="h-4 w-4" />
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview || "/placeholder.svg"}
                    alt="Avatar preview"
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-600 text-3xl font-bold text-white">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 rounded-full bg-gray-900 p-2 text-white shadow-lg hover:bg-gray-800 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Upload a new profile picture. JPG, PNG or GIF. Max 5MB.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
              <User className="h-4 w-4" />
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
              <MapPin className="h-4 w-4" />
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your location (e.g., LA, New York)"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {/* Bio/Personal Message */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
              <FileText className="h-4 w-4" />
              Personal Message
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write something about yourself..."
              rows={3}
              maxLength={200}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{bio.length}/200 characters</p>
          </div>

          {/* Interests */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-3">
              <Heart className="h-4 w-4" />
              Interests ({selectedInterests.length} selected)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest)
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`
                      rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all
                      ${
                        isSelected
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-900"
                      }
                    `}
                  >
                    {interest}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
