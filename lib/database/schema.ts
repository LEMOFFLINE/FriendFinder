// Database schema types matching the PostgreSQL database design

export type PostVisibility = "public" | "friends" | "private"
export type PostType = "original" | "repost"
export type FriendshipStatus = "pending" | "accepted" | "rejected" | "blocked"
export type NotificationType = "like" | "comment" | "repost" | "friend_request" | "mention"
export type TargetType = "post" | "comment"

export interface User {
  user_id: string
  email: string
  password_hash: string
  name: string
  age?: number
  location?: string
  bio?: string
  avatar_url?: string
  background_image_url?: string
  post_count: number
  follower_count: number
  following_count: number
  profile_visibility: PostVisibility
  post_default_visibility: PostVisibility
  allow_message_from: PostVisibility
  require_friend_confirmation: boolean
  is_active: boolean
  last_active_at: string
  created_at: string
  updated_at: string
}

export interface UserInterest {
  interest_id: string
  user_id: string
  interest: string
  created_at: string
}

export interface Friendship {
  friendship_id: string
  user_id: string
  friend_id: string
  status: FriendshipStatus
  created_at: string
  accepted_at?: string
}

export interface Post {
  post_id: string
  author_id: string
  content?: string
  image_urls: string[]
  visibility: PostVisibility
  type: PostType
  original_post_id?: string
  root_post_id?: string
  like_count: number
  repost_count: number
  comment_count: number
  hot_score: number
  is_deleted: boolean
  deleted_at?: string
  created_at: string
  updated_at: string
}

export interface Comment {
  comment_id: string
  post_id: string
  author_id: string
  parent_comment_id?: string
  content: string
  image_urls: string[]
  depth: number
  like_count: number
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Like {
  like_id: string
  user_id: string
  target_type: TargetType
  target_id: string
  created_at: string
}

export interface Repost {
  repost_id: string
  user_id: string
  original_post_id: string
  depth: number
  root_post_id: string
  content?: string
  image_urls: string[]
  created_at: string
}

export interface Notification {
  notification_id: string
  user_id: string
  type: NotificationType
  actor_id: string
  post_id?: string
  comment_id?: string
  is_read: boolean
  created_at: string
}
