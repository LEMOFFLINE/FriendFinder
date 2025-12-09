# FriendFinder - Feature Specifications & Implementation Memo

**Document Version:** 1.0  
**Last Updated:** 2024-11-16  
**Status:** Confirmed and Ready for Implementation

---

## Document Purpose

This memo records all confirmed features, technical decisions, and implementation plans discussed during project planning. It serves as the single source of truth for development priorities and specifications.

---

## Current Status Summary

### Completed
- PostgreSQL database setup (Windows environment)
- Database schema with UUID v7 primary keys
- Basic authentication (login/signup)
- Feed page with posts from database
- Clickable avatars with profile navigation
- Friend request system (basic)
- User nicknames system (global, not group-specific)

### In Progress
- Fix feed left arrow (remove)
- Fix contacts page (show friends from PostgreSQL)
- Fix likes counter issue
- Fix comments display issue

### Next Priority
- Groups system with chat functionality
- Messages system enhancement (split text/image, local storage)

---

## Phase 1: Critical Bug Fixes (Current Sprint)

**Priority:** P0 (Immediate)  
**Estimated Time:** 1-2 days

### Tasks
1. Remove back arrow from feed page top-left
2. Fix contacts page to load friends from `friendships` table
3. Fix like counter (currently zeros out on unlike)
4. Fix comments display (shows "no comments yet" even when comments exist)

---

## Phase 2: Groups System Implementation

**Priority:** P0  
**Estimated Time:** 1 week

### Database Schema

\`\`\`sql
-- Groups table
CREATE TABLE groups (
  group_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  group_name VARCHAR(100) NOT NULL,
  group_leader_id UUID REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_disbanded BOOLEAN DEFAULT FALSE,
  disbanded_at TIMESTAMP
);

-- Group members table
CREATE TABLE group_members (
  group_id UUID REFERENCES groups(group_id),
  user_id UUID REFERENCES users(user_id),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id, user_id)
);

-- <CHANGE> Removed group_nicknames table - using only user_nicknames (global) now
\`\`\`

### Features

**Group Management:**
- Create group (creator automatically becomes leader)
- Join public group
- Leave group (leader cannot leave unless transfer or disband)
- Transfer leadership (leader only)
- Disband group (leader only)
  - Sets `is_disbanded = true`
  - All members kicked out
  - Chat history preserved locally but read-only
  - Shows "group has been disbanded" message

**Group Discovery:**
- Discover page shows only groups NOT yet joined
- All groups are public (anyone can join)
- Contact page shows friends AND joined groups mixed together
  - Example order: Friend A, Group B, Friend C, Group D
  - Sorted by most recent message timestamp

**User Nicknames (Global):**
- Each user can set a custom nickname for another user
- Nickname applies everywhere (not per-group)
- Stored in `user_nicknames` table with PK(nicknamer_id, target_user_id)
- API: `PUT /api/users/[userId]/nickname`

---

## Phase 3: Messages System Enhancement

**Priority:** P0  
**Estimated Time:** 1 week

### Message Types & Validation

**Confirmed Rules:**
1. Each message must be EITHER text OR image (not both, not neither)
2. If user sends text + image simultaneously:
   - Automatically split into TWO messages
   - Message 1: text content
   - Message 2: image content
3. Text limit: 200 characters per message
4. Time format: 12-hour with AM/PM (e.g., "3:00 PM")

### Database Schema

\`\`\`sql
-- Messages table (updated)
CREATE TABLE messages (
  message_id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
  sender_id UUID REFERENCES users(user_id),
  receiver_id UUID REFERENCES users(user_id), -- NULL for group
  group_id UUID REFERENCES groups(group_id),   -- NULL for 1-on-1
  message_type VARCHAR(10) CHECK (message_type IN ('text', 'image')),
  content TEXT NOT NULL,  -- Text content OR image URL
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CHECK (
    (receiver_id IS NOT NULL AND group_id IS NULL) OR
    (receiver_id IS NULL AND group_id IS NOT NULL)
  ),
  CHECK (
    (message_type = 'text' AND LENGTH(content) <= 200) OR
    (message_type = 'image')
  )
);

-- User nicknames table (global, not group-specific)
CREATE TABLE user_nicknames (
  nicknamer_id UUID REFERENCES users(user_id),
  target_user_id UUID REFERENCES users(user_id),
  nickname VARCHAR(50) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (nicknamer_id, target_user_id)
);
\`\`\`

// ... existing code ...

---

## API Endpoints Summary

### Groups
- `POST /api/groups/create` - Create new group
- `GET /api/groups/discover` - Get joinable groups (not member of)
- `POST /api/groups/[groupId]/join` - Join group
- `POST /api/groups/[groupId]/leave` - Leave group
- `POST /api/groups/[groupId]/transfer` - Transfer leadership
- `POST /api/groups/[groupId]/disband` - Disband group (leader only)

### User Nicknames
- `GET /api/users/[userId]/nickname` - Get nickname for a user
- `PUT /api/users/[userId]/nickname` - Set nickname for a user

### Messages
- `GET /api/messages/conversations` - Get all conversations (friends + groups)
- `GET /api/messages/[conversationId]` - Get messages (7 days)
- `POST /api/messages/send` - Send message (validates type and length)
- `POST /api/messages/upload-image` - Upload image, returns URL

// ... existing code ...

---

## Frontend Components to Create

### Groups
- `/discover` - Browse and join groups
- `/groups/[groupId]/chat` - Group chat interface
- `/groups/[groupId]/settings` - Group management (leader only)
- `components/group-card.tsx` - Group display card

### Messages
- `components/message-bubble.tsx` - Single message display
- `components/chat-interface.tsx` - Reusable chat UI
- `components/conversation-preview.tsx` - Last message preview
- `lib/local-message-store.ts` - IndexedDB wrapper

// ... existing code ...

---

## Technical Decisions

### Confirmed Choices

1. **Message Splitting:** Auto-split text+image into 2 messages (not optional)
2. **Group Visibility:** All groups are public (no private groups for now)
3. **Contacts Display:** Friends and groups mixed, sorted by recent activity
4. **Message Storage:** 7-day cloud + permanent local (IndexedDB)
5. **Time Format:** 12-hour with AM/PM consistently everywhere
6. **User Nicknames:** Global, not per-group (simplified approach)
7. **Repost Image Limit:** Hard cap at 3 images
8. **Database:** PostgreSQL with UUID v7 primary keys

// ... existing code ...
\`\`\`

\`\`\`ts file="app/api/groups/[groupId]/nickname/route.ts" isDeleted="true"
...deleted...
