"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
import { ClickableAvatar } from "@/components/clickable-avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, UserPlus, Heart, MessageCircle, Share2, Flag, Ban, MessageSquare, X } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { AppHeader } from "@/components/app-header"
import { PostImageGrid } from "@/components/post-image-grid"

interface PostWithAuthor {
  post_id: string
  author_id: string
  content?: string
  image_urls: string[]
  original_post_id?: string
  original_post_content?: string
  original_post_image_urls?: string[]
  original_post_author_name?: string
  original_post_author_id?: string
  like_count: number
  comment_count: number
  repost_count: number
  liked_by_current_user: boolean
  created_at: string
}

interface UserProfile {
  user_id: string
  name: string
  email: string
  age?: number
  location?: string
  bio?: string
  interests: string[]
  created_at: string
}

export default function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [friendshipStatus, setFriendshipStatus] = useState<string>("none")
  const [isLoading, setIsLoading] = useState(true)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  useEffect(() => {
    const userStr = sessionStorage.getItem("currentUser")
    if (!userStr) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(userStr)
    setCurrentUser(userData)
    loadUserProfile(userData.user_id)
  }, [resolvedParams.userId])

  const loadUserProfile = async (currentUserId: string) => {
    try {
      const response = await fetch(`/api/users/${resolvedParams.userId}?currentUserId=${currentUserId}`)
      const data = await response.json()

      if (response.ok) {
        setProfileUser(data.user)
        setPosts(data.posts)
        setFriendshipStatus(data.friendshipStatus)
      } else {
        console.error("[v0] Failed to load user profile:", data.error)
      }
    } catch (error) {
      console.error("[v0] Error loading user profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendFriendRequest = async () => {
    if (!currentUser) return

    try {
      const requestBody = { currentUserId: currentUser.user_id }
      console.log("[v0] Frontend: Sending friend request with body:", requestBody)
      console.log("[v0] Frontend: Request URL:", `/api/users/${resolvedParams.userId}/friend-request`)

      const requestUrl = `/api/users/${resolvedParams.userId}/friend-request`
      const requestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }

      console.log("[v0] Frontend: Request init:", requestInit)
      console.log("[v0] Frontend: Body string:", requestInit.body)
      console.log("[v0] Frontend: Body length:", requestInit.body.length)

      const response = await fetch(requestUrl, requestInit)

      console.log("[v0] Frontend: Response status:", response.status)
      console.log("[v0] Frontend: Response headers:", Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log("[v0] Frontend: Response data:", data)

      if (response.ok) {
        setFriendshipStatus(data.status)
        alert("Friend request sent!")
      } else {
        alert(data.error || "Failed to send friend request")
      }
    } catch (error) {
      console.error("[v0] Error sending friend request:", error)
      alert("Failed to send friend request")
    }
  }

  const handleCopyProfileLink = () => {
    const link = window.location.href
    navigator.clipboard.writeText(link)
    alert("Profile link copied to clipboard!")
  }

  const handleSetNickname = async () => {
    const nickname = prompt("Enter a nickname for this user:", profileUser?.name)
    if (nickname !== null) {
      try {
        const currentUserId = currentUser?.user_id
        if (!currentUserId) return

        const response = await fetch(`/api/users/${resolvedParams.userId}/nickname`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUserId,
          },
          body: JSON.stringify({ nickname }),
        })

        if (response.ok) {
          // Reload user profile to show new nickname
          loadUserProfile(currentUserId)
          alert(`Nickname set to: ${nickname}`)
        } else {
          alert("Failed to set nickname")
        }
      } catch (error) {
        console.error("Error setting nickname:", error)
        alert("Error setting nickname")
      }
    }
  }

  const handleBlockUser = () => {
    if (confirm(`Are you sure you want to block ${profileUser?.name}?`)) {
      // TODO: Implement API call to block user
      alert("User blocked")
    }
  }

  const handleReportUser = () => {
    // TODO: Implement report dialog
    alert("User reported")
  }

  const handleChat = () => {
    if (profileUser) {
      router.push(`/messages/${profileUser.user_id}`)
    }
  }

  const handleLike = async (postId: string) => {
    if (!currentUser) return

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.user_id }),
      })

      const data = await response.json()

      if (response.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.post_id === postId ? { ...p, liked_by_current_user: data.liked, like_count: data.newCount } : p,
          ),
        )
      }
    } catch (error) {
      console.error("[v0] Error toggling like:", error)
    }
  }

  const formatTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!profileUser || !currentUser) {
    return null
  }

  const isOwnProfile = currentUser.user_id === resolvedParams.userId

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <AppHeader />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card className="p-6 bg-white border-gray-200 relative">
          {/* Added settings menu dropdown in top-right */}
          <div className="absolute top-4 right-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSetNickname}>Set Nickname</DropdownMenuItem>
                <DropdownMenuItem onClick={handleBlockUser} className="text-red-600">
                  <Ban className="h-4 w-4 mr-2" />
                  Block
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleReportUser} className="text-red-600">
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-start justify-between pr-8">
            <div className="flex items-center gap-4">
              <ClickableAvatar
                userId={profileUser.user_id}
                userName={profileUser.name}
                size="lg"
                currentUserId={currentUser.user_id}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profileUser.name}</h1>
                <p className="text-gray-500">{profileUser.email}</p>
                <p className="text-sm text-gray-500">
                  {profileUser.age ? `${profileUser.age} years old` : "Age not specified"}
                  {profileUser.location && ` • ${profileUser.location}`}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {!isOwnProfile && friendshipStatus === "none" && (
                <Button onClick={handleSendFriendRequest} className="bg-gray-900 hover:bg-gray-800">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Friend
                </Button>
              )}
              {friendshipStatus === "pending_sent" && (
                <Button disabled variant="outline">
                  Request Sent
                </Button>
              )}
              {friendshipStatus === "friends" && (
                <>
                  <Button disabled variant="outline" className="w-full bg-transparent">
                    Friends
                  </Button>
                  {/* Added Chat button for friends */}
                  <Button onClick={handleChat} variant="secondary" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Bio */}
          {profileUser.bio && (
            <div className="mt-4">
              <p className="text-gray-700">{profileUser.bio}</p>
            </div>
          )}

          {/* Interests */}
          {profileUser.interests && profileUser.interests.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2 text-gray-900">Interests</p>
              <div className="flex flex-wrap gap-2">
                {profileUser.interests.map((interest) => (
                  <span key={interest} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Posts Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isOwnProfile ? "Your Posts" : `${profileUser.name}'s Posts`}
          </h2>

          {posts.length === 0 ? (
            <Card className="p-12 text-center bg-white border-gray-200">
              <p className="text-gray-500">
                {isOwnProfile ? "You haven't posted yet." : "This person haven't posted yet"}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.post_id} className="p-6 space-y-4 bg-white border-gray-200">
                  {/* Post Header */}
                  <div className="flex items-start gap-3">
                    <ClickableAvatar
                      userId={post.author_id}
                      userName={profileUser.name}
                      size="md"
                      currentUserId={currentUser.user_id}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{profileUser.name}</h3>
                      <p className="text-sm text-gray-500">{formatTime(post.created_at)}</p>
                    </div>
                  </div>

                  {/* Post Content */}
                  {post.content && <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>}

                  {post.original_post_id && (
                    <div
                      className="border border-gray-200 rounded-lg p-3 mt-2 mb-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => router.push(`/users/${post.original_post_author_id}`)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm">{post.original_post_author_name}</span>
                        <span className="text-xs text-gray-500">Original Post</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3 mb-2">{post.original_post_content}</p>
                      <PostImageGrid
                        images={post.original_post_image_urls}
                        onImageClick={(url) => {
                          setLightboxImage(url)
                        }}
                      />
                    </div>
                  )}

                  <PostImageGrid images={post.image_urls} onImageClick={setLightboxImage} />

                  {/* Post Actions */}
                  <div className="flex items-center gap-6 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => handleLike(post.post_id)}
                      className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <Heart className={`h-5 w-5 ${post.liked_by_current_user ? "fill-red-600 text-red-600" : ""}`} />
                      <span className="text-sm">{post.like_count}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm">{post.comment_count}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                      <Share2 className="h-5 w-5" />
                      <span className="text-sm">{post.repost_count}</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white p-2"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={lightboxImage || "/placeholder.svg"}
              alt="Full size view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
