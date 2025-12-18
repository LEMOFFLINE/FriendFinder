# New Features Guide - FriendFinder

## Summary of All New Features

This guide explains all the new features that have been implemented in FriendFinder.

## 1. Group System (Discord-style)

### What are Groups?
Groups are community spaces where multiple users can chat and organize events together, similar to Discord servers.

### Features:
- Join and leave groups
- Group chat with all members
- Create and participate in group events
- Block groups (they won't appear in Discover anymore)

### How to Use:
1. Go to **Discover** page
2. Switch to **Groups** tab
3. Browse groups sorted by member count
4. Click **View** to preview or **Join** to become a member
5. Access your groups from **Contacts** page under "My Groups"
6. Click **Open** to enter the group chat and events

## 2. Group Events

### What are Events?
Events are scheduled activities within groups that members can join.

### Features:
- Set event name, description, start/end dates
- Optional participant limit
- Join/leave events
- Event creators can kick participants
- Event creators can block users from specific events
- Blocked users cannot see or join events

### How to Create an Event:
1. Open a group you've joined
2. Go to **Events** tab
3. Click **Create Event**
4. Fill in details:
   - Event Name (required)
   - Description (optional)
   - Start Date & Time (required)
   - End Date & Time (optional)
   - Max Participants (optional)
5. Click **Create Event**

### As Event Creator:
- View all participants
- Click the menu (⋮) next to participants to:
  - Kick them from the event
  - Block them from the event permanently

## 3. Friend Request System

### Old System:
- Users could directly connect (instant friends)

### New System:
- Send friend request with optional message
- Recipient can accept, reject, or block
- Requests expire after 7 days
- Cannot send duplicate requests

### How to Send a Friend Request:
1. Go to **Discover** → **People** tab
2. Find someone you want to connect with
3. Click **Add** button
4. (Optional) Type a message to introduce yourself
5. Click OK to send

### How to Manage Requests:
1. Go to **Notifications** page (Requests icon in bottom nav)
2. View incoming friend requests
3. For each request, you can:
   - **Accept** - They become your contact
   - **Reject** - Request is deleted
   - **Block** - You won't receive future requests from them

## 4. Search Functionality

### Search for People:
- Type name in search bar
- Shows people sorted by match score
- Match score based on shared interests

### Search for Groups:
- Search by group name
- Search by tags (e.g., #gaming, #photography)
- Results sorted by member count

## 5. Privacy & Safety

### Block Users:
- From Contacts page: Click ⋮ menu → Block User
- From Notifications: Click Block on friend request
- Blocked users cannot:
  - Send you friend requests
  - See you in Discover
  - Contact you

### Block Groups:
- From Contacts page: Click ⋮ on group → Block Group
- Blocked groups won't appear in Discover

### Delete Contacts:
- From Contacts page: Click ⋮ menu → Delete Contact
- Deletes all message history
- Can re-add them later

## 6. Unread Message Indicators

### Red Badge System:
- Red circle with number appears on Message button
- Shows count of unread messages from that contact
- Badge disappears when you open the conversation

## 7. Database Management

### Clear All Data:
If you encounter issues or want to start fresh:

1. Open browser console (F12)
2. Copy and paste this script:

\`\`\`javascript
(function() {
  console.log('🗑️ Clearing all local database...');
  const keys = [
    'allUsers', 'currentUser', 'allGroups', 'friendRequests',
    'blockedUsers', 'connections', 'groupMessages', 'user_messages'
  ];
  keys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✓ Cleared: ${key}`);
  });
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('messages_') || key.startsWith('friend_requests_') || 
        key.startsWith('contacts_') || key.startsWith('blocked_') ||
        key.startsWith('joined_groups_') || key.startsWith('blocked_groups_')) {
      localStorage.removeItem(key);
      console.log(`✓ Cleared: ${key}`);
    }
  });
  console.log('✅ Database cleared successfully!');
  console.log('🔄 Please refresh the page to start fresh.');
})();
\`\`\`

3. Press Enter
4. Refresh the page

### Create Test Data:
To quickly set up test users and groups:

1. Open browser console (F12)
2. Copy and paste the entire contents of `scripts/create-test-data.ts`
3. Press Enter
4. You'll get 3 test users and 3 test groups

**Test Accounts:**
- Email: sarah@test.com | Password: Test123
- Email: james@test.com | Password: Test123
- Email: emma@test.com | Password: Test123

## Navigation

### Bottom Navigation Bar:
- **Discover** - Find new people and groups
- **Contacts** - View your friends and joined groups
- **Requests** - Manage friend requests
- **Profile** - Edit your profile and settings

## Tips for Testing

1. **Multi-Account Testing:**
   - Open multiple browser windows (or use incognito)
   - Log in with different test accounts
   - Test friend requests, messaging, group chat

2. **Friend Request Flow:**
   - User A sends request to User B
   - User B goes to Notifications
   - User B accepts
   - Both can now message each other in Contacts

3. **Group Testing:**
   - Join a group with multiple accounts
   - Test group chat (messages visible to all)
   - Create event with one account
   - Join event with another account
   - Test kick/block features

4. **Block Testing:**
   - Block a user or group
   - Verify they don't appear in Discover
   - Check Privacy & Safety page to see blocked list

## Data Storage

All data is stored in browser localStorage:
- `allUsers` - All registered users
- `allGroups` - All groups
- `currentUser` - Currently logged-in user
- `contacts_{userId}` - User's friend list
- `friend_requests_sent_{userId}` - Sent requests
- `friend_requests_received_{userId}` - Incoming requests
- `blocked_{userId}` - Blocked users
- `joined_groups_{userId}` - Groups user has joined
- `blocked_groups_{userId}` - Blocked groups
- `messages_{userId1}_{userId2}` - Private messages
- `groupMessages_{groupId}` - Group chat messages
- `groupEvents_{groupId}` - Group events

## Future Enhancements (Not Yet Implemented)

When deploying to production server:
- Real-time messaging with WebSocket
- Push notifications for friend requests
- Image/file sharing in chats
- Voice/video calls
- User online status
- Read receipts
- More advanced matching algorithm
