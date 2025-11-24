"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share2, Send, ArrowLeft, Trash2 } from "lucide-react"
import { PostService } from "@/lib/post-service"
import type { Post } from "@/lib/types/post-types"
import { BottomNav } from "@/components/bottom-nav"

export default function FeedPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostContent, setNewPostContent] = useState("")
  const [commentContent, setCommentContent] = useState<{ [key: string]: string }>({})
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({})
  const [postService] = useState(() => new PostService())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] Feed page mounted")
    const user = localStorage.getItem("user")
    console.log("[v0] Current user from localStorage:", user ? "exists" : "null")

    if (!user) {
      console.log("[v0] No user found, redirecting to login")
      router.push("/login")
      return
    }

    const userData = JSON.parse(user)
    console.log("[v0] User data:", userData)
    setCurrentUser(userData)
    loadPosts(userData.id)
    setIsLoading(false)
  }, [router])

  const loadPosts = (userId: string) => {
    console.log("[v0] Loading posts for user:", userId)
    const feed = postService.getFeed(userId)
    console.log("[v0] Loaded posts:", feed.length, feed)
    setPosts(feed)
  }

  const handleCreatePost = () => {
    if (!newPostContent.trim() || !currentUser) return

    const result = postService.createPost(currentUser.id, newPostContent)

    if (result.success) {
      setNewPostContent("")
      loadPosts(currentUser.id)
    } else {
      alert(result.error)
    }
  }

  const handleLike = (postId: string) => {
    if (!currentUser) return
    postService.toggleLike(postId, currentUser.id)
    loadPosts(currentUser.id)
  }

  const handleComment = (postId: string) => {
    if (!currentUser || !commentContent[postId]?.trim()) return

    const result = postService.addComment(postId, currentUser.id, commentContent[postId])

    if (result.success) {
      setCommentContent({ ...commentContent, [postId]: "" })
      loadPosts(currentUser.id)
    } else {
      alert(result.error)
    }
  }

  const handleDeletePost = (postId: string) => {
    if (!currentUser) return
    if (!confirm("确定要删除这条帖子吗？")) return

    const result = postService.deletePost(postId, currentUser.id)

    if (result.success) {
      loadPosts(currentUser.id)
    } else {
      alert(result.error)
    }
  }

  const getUserName = (userId: string) => {
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")
    const user = allUsers.find((u: any) => u.id === userId)
    return user ? user.name : "Unknown User"
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp
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

  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/discover" className="flex items-center gap-2 text-gray-900">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Feed</span>
          </Link>
          <Link href="/profile">
            <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm">
              {getInitials(currentUser.name)}
            </div>
          </Link>
        </div>
      </header>

      <div
        className="relative h-48 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-matthardy-1533720-phMMZWYUjOTnhJOhDZURVQ9oBHFNF4.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Share Your Moments</h1>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Create Post */}
        <Card className="p-4 bg-white border-gray-200">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {getInitials(currentUser.name)}
            </div>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[100px] resize-none border-gray-200"
                maxLength={1000}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{newPostContent.length}/1000</span>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim()}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Posts Feed */}
        {posts.length === 0 ? (
          <Card className="p-12 text-center bg-white border-gray-200">
            <p className="text-gray-500">No posts yet. Create your first post or connect with friends!</p>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="p-6 space-y-4 bg-white border-gray-200">
              {/* Post Header */}
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="h-12 w-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
                    {getInitials(getUserName(post.authorId))}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{getUserName(post.authorId)}</h3>
                    <p className="text-sm text-gray-500">{formatTime(post.createdAt)}</p>
                  </div>
                </div>
                {post.authorId === currentUser.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Post Content */}
              <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>

              {post.images && post.images.length > 0 && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={post.images[0] || "/placeholder.svg"}
                    alt="Post image"
                    className="w-full h-auto object-cover max-h-[500px]"
                  />
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center gap-6 pt-2 border-t border-gray-200">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Heart
                    className={`h-5 w-5 ${post.likes.includes(currentUser.id) ? "fill-red-600 text-red-600" : ""}`}
                  />
                  <span className="text-sm">{post.likes.length}</span>
                </button>
                <button
                  onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm">{post.comments.length}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                  <Share2 className="h-5 w-5" />
                  <span className="text-sm">{post.reposts.length}</span>
                </button>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  {/* Comment Input */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Write a comment..."
                      value={commentContent[post.id] || ""}
                      onChange={(e) => setCommentContent({ ...commentContent, [post.id]: e.target.value })}
                      className="min-h-[60px] resize-none border-gray-200"
                      maxLength={500}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleComment(post.id)}
                      disabled={!commentContent[post.id]?.trim()}
                      className="bg-gray-900 hover:bg-gray-800"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Comments List */}
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 pl-4">
                      <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                        {getInitials(getUserName(comment.authorId))}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <p className="font-semibold text-sm text-gray-900">{getUserName(comment.authorId)}</p>
                        <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatTime(comment.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  )
}
