"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share2, Send, Trash2, X } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { ClickableAvatar } from "@/components/clickable-avatar"
import { RepostDialog } from "@/components/repost-dialog"
import { AppHeader } from "@/components/app-header"
import { CreatePostDialog } from "@/components/create-post-dialog"
import { PostImageGrid } from "@/components/post-image-grid"

interface PostWithAuthor {
  post_id: string
  author_id: string
  author_name: string
  author_email: string
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

interface CommentWithAuthor {
  comment_id: string
  post_id: string
  author_id: string
  author_name: string
  content: string
  created_at: string
}

export default function FeedPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [comments, setComments] = useState<{ [key: string]: CommentWithAuthor[] }>({})
  const [newPostContent, setNewPostContent] = useState("")
  const [commentContent, setCommentContent] = useState<{ [key: string]: string }>({})
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [repostDialog, setRepostDialog] = useState<{ open: boolean; post: PostWithAuthor | null }>({
    open: false,
    post: null,
  })

  useEffect(() => {
    console.log("[v0] Feed page mounted")
    const userStr = sessionStorage.getItem("currentUser")
    console.log("[v0] Current user from sessionStorage:", userStr ? "exists" : "null")

    if (!userStr) {
      console.log("[v0] No user found, redirecting to login")
      router.push("/login")
      return
    }

    const userData = JSON.parse(userStr)
    console.log("[v0] User data:", userData)
    setCurrentUser(userData)
    loadPosts(userData.user_id)
    setIsLoading(false)
  }, [router])

  const loadPosts = async (userId: string) => {
    console.log("[v0] Loading posts for user:", userId)
    try {
      const response = await fetch(`/api/posts/feed?userId=${userId}`)
      const data = await response.json()

      if (response.ok) {
        console.log("[v0] Loaded posts:", data.posts.length)
        setPosts(data.posts)
      } else {
        console.error("[v0] Failed to load posts:", data.error)
      }
    } catch (error) {
      console.error("[v0] Error loading posts:", error)
    }
  }

  const loadComments = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      const data = await response.json()

      if (response.ok) {
        setComments((prev) => ({ ...prev, [postId]: data.comments }))
      }
    } catch (error) {
      console.error("[v0] Error loading comments:", error)
    }
  }

  const handleCreatePost = async () => {
    if (!currentUser) return
    loadPosts(currentUser.user_id)
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
        console.log("[v0] Like toggled:", data.liked ? "liked" : "unliked")
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

  const handleComment = async (postId: string) => {
    if (!currentUser || !commentContent[postId]?.trim()) return

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.user_id,
          content: commentContent[postId],
        }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("[v0] Comment added")
        setCommentContent({ ...commentContent, [postId]: "" })
        setPosts((prev) => prev.map((p) => (p.post_id === postId ? { ...p, comment_count: p.comment_count + 1 } : p)))
        loadComments(postId)
      } else {
        alert(data.error || "Failed to add comment")
      }
    } catch (error) {
      console.error("[v0] Error adding comment:", error)
      alert("Failed to add comment")
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!currentUser) return
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const response = await fetch(`/api/posts/${postId}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.user_id }),
      })

      if (response.ok) {
        console.log("[v0] Post deleted")
        loadPosts(currentUser.user_id)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete post")
      }
    } catch (error) {
      console.error("[v0] Error deleting post:", error)
      alert("Failed to delete post")
    }
  }

  const handleRepost = async (content: string, images: string[]) => {
    if (!currentUser || !repostDialog.post) return

    try {
      const response = await fetch(`/api/posts/${repostDialog.post.post_id}/repost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.user_id,
          content,
          imageUrls: images,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("[v0] Post reposted")
        setPosts((prev) =>
          prev.map((p) => (p.post_id === repostDialog.post!.post_id ? { ...p, repost_count: p.repost_count + 1 } : p)),
        )
        loadPosts(currentUser.user_id)
      } else {
        alert(data.error || "Failed to repost")
      }
    } catch (error) {
      console.error("[v0] Error reposting:", error)
      alert("Failed to repost")
    }
  }

  const toggleComments = async (postId: string) => {
    const newShowState = !showComments[postId]
    setShowComments({ ...showComments, [postId]: newShowState })

    if (newShowState && !comments[postId]) {
      await loadComments(postId)
    }
  }

  const getInitials = (name: string) => {
    if (!name || typeof name !== "string") {
      return "?"
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
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

  if (!currentUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AppHeader />

      <div
        className="relative h-48 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/pexels-matthardy-1533720.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Share Your Moments</h1>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <CreatePostDialog currentUser={currentUser} onPostCreated={() => loadPosts(currentUser.user_id)} />

        {posts.length === 0 ? (
          <Card className="p-12 text-center bg-white border-gray-200">
            <p className="text-gray-500">No posts yet. Create your first post or connect with friends!</p>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.post_id} className="p-6 space-y-4 bg-white border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <ClickableAvatar
                    userId={post.author_id}
                    userName={post.author_name}
                    size="md"
                    currentUserId={currentUser.user_id}
                  />
                  <div>
                    <Link href={`/users/${post.author_id}`} className="font-semibold text-gray-900 hover:underline">
                      {post.author_name}
                    </Link>
                    <p className="text-sm text-gray-500">{formatTime(post.created_at)}</p>
                  </div>
                </div>
                {post.author_id === currentUser.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePost(post.post_id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

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
                  {post.original_post_image_urls && post.original_post_image_urls.length > 0 && (
                    <PostImageGrid
                      images={post.original_post_image_urls}
                      onImageClick={(url) => {
                        setLightboxImage(url)
                        // Prevent navigation to user profile when clicking image
                      }}
                    />
                  )}
                </div>
              )}

              <PostImageGrid images={post.image_urls} onImageClick={setLightboxImage} />

              <div className="flex items-center gap-6 pt-2 border-t border-gray-200">
                <button
                  onClick={() => handleLike(post.post_id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Heart className={`h-5 w-5 ${post.liked_by_current_user ? "fill-red-600 text-red-600" : ""}`} />
                  <span className="text-sm">{post.like_count}</span>
                </button>
                <button
                  onClick={() => toggleComments(post.post_id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm">{post.comment_count}</span>
                </button>
                <button
                  onClick={() => setRepostDialog({ open: true, post })}
                  className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="text-sm">{post.repost_count}</span>
                </button>
              </div>

              {showComments[post.post_id] && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Write a comment..."
                      value={commentContent[post.post_id] || ""}
                      onChange={(e) => setCommentContent({ ...commentContent, [post.post_id]: e.target.value })}
                      className="min-h-[60px] resize-none border-gray-200"
                      maxLength={500}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleComment(post.post_id)}
                      disabled={!commentContent[post.post_id]?.trim()}
                      className="bg-gray-900 hover:bg-gray-800"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {comments[post.post_id] && comments[post.post_id].length > 0 ? (
                    comments[post.post_id].map((comment) => (
                      <div key={comment.comment_id} className="flex gap-3 pl-4">
                        <ClickableAvatar
                          userId={comment.author_id}
                          userName={comment.author_name}
                          size="sm"
                          currentUserId={currentUser.user_id}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 bg-gray-50 rounded-lg p-3">
                          <p className="font-semibold text-sm text-gray-900">{comment.author_name}</p>
                          <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatTime(comment.created_at)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </main>

      {repostDialog.post && (
        <RepostDialog
          open={repostDialog.open}
          onClose={() => setRepostDialog({ open: false, post: null })}
          onSubmit={handleRepost}
          originalPost={{
            author_name: repostDialog.post.author_name,
            content: repostDialog.post.content,
          }}
        />
      )}

      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200"
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
