// Copy and paste this entire script into your browser console (F12)
// This will clear all local database data

;(() => {
  console.log("🗑️ Clearing all local database...")

  // List all keys to be cleared
  const keys = [
    "allUsers",
    "currentUser",
    "allGroups",
    "friendRequests",
    "blockedUsers",
    "connections",
    "groupMessages",
    "user_messages",
  ]

  keys.forEach((key) => {
    localStorage.removeItem(key)
    console.log(`✓ Cleared: ${key}`)
  })

  // Also clear any message keys (they follow pattern: messages_userId1_userId2)
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("messages_")) {
      localStorage.removeItem(key)
      console.log(`✓ Cleared: ${key}`)
    }
  })

  console.log("✅ Database cleared successfully!")
  console.log("🔄 Please refresh the page to start fresh.")
})()
