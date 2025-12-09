# Feed Testing Guide

## How to Test Feed Functionality

### Step 1: Clear Old Data (Optional)
If you want a fresh start:
\`\`\`javascript
localStorage.clear()
location.reload()
\`\`\`

### Step 2: Create Test Users
1. Open browser console (F12)
2. Copy and paste the entire content of `scripts/create-test-data.ts`
3. Press Enter
4. You should see: "✅ Test data created successfully!"

This creates 3 test users:
- sarah@test.com / Test123
- james@test.com / Test123
- emma@test.com / Test123

### Step 3: Create Feed Test Data
1. Still in console (F12)
2. Copy and paste the entire content of `scripts/create-feed-test-data.ts`
3. Press Enter
4. You should see: "✅ Feed test data created successfully!"

This creates:
- 7 posts with images
- Multiple likes on each post
- Comments from different users
- Some reposts

### Step 4: Login and View Feed
1. Refresh the page
2. Login with any test account (e.g., sarah@test.com / Test123)
3. Navigate to Feed page
4. You should see posts with images, likes, and comments

### What's Been Created

**Posts with Images:**
- Post 1 (Sarah): Tropical palm trees
- Post 2 (Sarah): Autumn leaves in water
- Post 3 (James): Minimalist green shapes
- Post 4 (James): Forest road
- Post 5 (Emma): Snowy pier painting
- Post 6 (Emma): Lone tree in field
- Post 7 (Emma): Woman with flower

**Interactions:**
- Each post has 1-2 likes
- Posts have comments from other users
- Some posts are reposted

### Testing Interactions

**Test Liking:**
1. Click heart icon on any post
2. Heart should turn red and count increases
3. Click again to unlike

**Test Commenting:**
1. Click comment icon to show comment section
2. Type a comment and click send
3. Your comment appears in the list

**Test Deleting:**
1. Login as Sarah, James, or Emma
2. Find your own posts (has trash icon)
3. Click trash icon to delete

**Test Creating:**
1. Type in the "What's on your mind?" box
2. Click Post button
3. New post appears at top of feed

### Troubleshooting

**Issue: "No posts yet" message**
- Make sure you ran create-feed-test-data.ts
- Check console: `JSON.parse(localStorage.getItem("posts"))`
- Should show array of 7 posts

**Issue: Can't see images**
- Images are hosted on Vercel Blob
- Check internet connection
- Check console for image loading errors

**Issue: No users in posts**
- Make sure you ran create-test-data.ts first
- Check: `JSON.parse(localStorage.getItem("allUsers"))`
- Should show 3 test users

**Issue: Still showing loading**
- Check if logged in: `localStorage.getItem("currentUser")`
- Should not be null
- Try logging out and back in
