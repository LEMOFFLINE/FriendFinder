export interface Post {
  id: string
  authorId: string
  content: string
  images: string[]
  likes: string[]
  comments: Comment[]
  reposts: Repost[]
  visibility: "everyone" | "friends"
  type: "original" | "repost"
  originalPostId?: string
  parentRepostId?: string
  depth: number
  canBeReposted: boolean
  createdAt: number
  updatedAt: number
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  content: string
  images: string[]
  createdAt: number
}

export interface Repost {
  id: string
  postId: string
  authorId: string
  content: string
  images: string[]
  createdAt: number
}

export interface PostingLimits {
  maxPostCharacters: number
  maxPostImages: number
  maxCommentCharacters: number
  maxCommentImages: number
  maxRepostCharacters: number
  maxRepostImages: number
  maxRepostDepth: number
  postFoldLines: number
  commentFoldLines: number
  repostFoldLines: number
}

export interface User {
  id: string
  email: string
  name: string
  age: number
  location: string
  bio: string
  interests: string[]
  createdAt: number
}
