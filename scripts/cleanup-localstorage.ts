// Run this in browser console to clear all old localStorage data

export function cleanupLocalStorage() {
  console.log("[Cleanup] Starting localStorage cleanup...")

  const keysToRemove: string[] = []

  // Collect all keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      keysToRemove.push(key)
    }
  }

  console.log(`[Cleanup] Found ${keysToRemove.length} keys to remove`)

  // Remove all keys
  keysToRemove.forEach((key) => {
    localStorage.removeItem(key)
    console.log(`[Cleanup] Removed: ${key}`)
  })

  console.log("[Cleanup] localStorage cleanup complete!")
  console.log("[Cleanup] Please refresh the page to use the new database system")
}

// Auto-run if in browser
if (typeof window !== "undefined") {
  ;(window as any).cleanupLocalStorage = cleanupLocalStorage
  console.log("Run cleanupLocalStorage() in console to clear old data")
}
