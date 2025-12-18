# Migration Guide: localStorage to Database Service Layer

This guide explains the migration from localStorage to the new database service layer.

## Architecture Changes

### Old Architecture (localStorage)
\`\`\`
Page → localStorage directly
\`\`\`

Problems:
- Data isolated per browser/device
- No data sharing between users
- Data lost on cache clear
- No server-side validation

### New Architecture (Database Service Layer)
\`\`\`
Page → Auth Context → Service Layer → Database Client → Storage
\`\`\`

Benefits:
- Centralized data management
- Cross-user data sharing
- Server-side validation
- Easy migration to real database

## Service Layer Structure

\`\`\`
lib/
├── database/
│   ├── schema.ts           # TypeScript types matching PostgreSQL
│   ├── client.ts           # Database client (currently uses localStorage)
│   └── services/
│       ├── user-service.ts      # User management
│       ├── post-service.ts      # Posts and comments
│       ├── friend-service.ts    # Friendships
│       └── message-service.ts   # Direct messages
├── auth/
│   └── auth-context.tsx    # Global auth state
└── utils.ts                # Shared utilities
\`\`\`

## Using the Auth Context

### 1. Wrap your app with AuthProvider

\`\`\`tsx
// app/layout.tsx
import { AuthProvider } from "@/lib/auth/auth-context"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
\`\`\`

### 2. Use auth in pages

\`\`\`tsx
"use client"
import { useAuth } from "@/lib/auth/auth-context"

export default function MyPage() {
  const { user, isLoading, login, logout } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Please login</div>
  
  return <div>Welcome {user.name}!</div>
}
\`\`\`

## Service Usage Examples

### User Service

\`\`\`typescript
import { userService } from "@/lib/database/services/user-service"

// Register
const result = await userService.register({
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
  age: 25,
  location: "New York"
})

// Login
const loginResult = await userService.login("user@example.com", "password123")
if (loginResult.success) {
  login(loginResult.user!)
}

// Update interests
await userService.updateInterests(userId, ["Photography", "Travel"])
\`\`\`

### Post Service

\`\`\`typescript
import { postService } from "@/lib/database/services/post-service"

// Create post
const result = await postService.createPost({
  author_id: user.user_id,
  content: "Hello world!",
  image_urls: [],
  visibility: "friends"
})

// Get feed
const feed = await postService.getFeed(user.user_id)

// Toggle like
const likeResult = await postService.toggleLike(user.user_id, "post", postId)
\`\`\`

### Friend Service

\`\`\`typescript
import { friendService } from "@/lib/database/services/friend-service"

// Send friend request
await friendService.sendFriendRequest({
  fromUserId: currentUser.user_id,
  toUserId: targetUser.user_id,
  message: "Hi, let's connect!"
})

// Accept request
await friendService.acceptFriendRequest(requestId)

// Get friends
const friends = await friendService.getFriends(user.user_id)
\`\`\`

### Message Service

\`\`\`typescript
import { messageService } from "@/lib/database/services/message-service"

// Send message
await messageService.sendMessage({
  fromUserId: user.user_id,
  toUserId: friendId,
  content: "Hello!"
})

// Get conversation
const messages = await messageService.getConversation(userId1, userId2)
\`\`\`

## Cleaning Up Old Data

Run this in browser console to clear all localStorage:

\`\`\`javascript
cleanupLocalStorage()
\`\`\`

Then refresh the page to start with a clean database.

## Migration Checklist

- [x] Create database schema types
- [x] Create database client with localStorage backend
- [x] Create service layer (user, post, friend, message)
- [x] Create auth context
- [ ] Update all pages to use auth context
- [ ] Remove all direct localStorage access
- [ ] Test all functionality
- [ ] Deploy to production with real PostgreSQL

## Production Deployment

To migrate to real PostgreSQL:

1. Set up PostgreSQL database
2. Run SQL migrations (create tables)
3. Replace `lib/database/client.ts` implementation:
   - Keep the same API interface
   - Replace localStorage with SQL queries
4. Update environment variables
5. Deploy

The service layer API remains unchanged!
