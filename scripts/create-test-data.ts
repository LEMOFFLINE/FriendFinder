// Test data generation script
// Run in browser console: copy and paste this entire script

;(() => {
  const testUsers = [
    {
      name: "Sarah Chen",
      email: "sarah@test.com",
      password: "Test123",
      age: "28",
      location: "London",
      interests: ["Photography", "Travel", "Coffee", "Art"],
      bio: "Adventure seeker and coffee enthusiast.",
    },
    {
      name: "James Wilson",
      email: "james@test.com",
      password: "Test123",
      age: "32",
      location: "Manchester",
      interests: ["Gaming", "Cooking", "Music", "Technology"],
      bio: "Software engineer by day, gamer by night.",
    },
    {
      name: "Emma Rodriguez",
      email: "emma@test.com",
      password: "Test123",
      age: "26",
      location: "Birmingham",
      interests: ["Yoga", "Reading", "Hiking", "Photography"],
      bio: "Yoga instructor and bookworm.",
    },
  ]

  const testGroups = [
    {
      name: "London Photographers",
      description: "A community for photography enthusiasts in London",
      tags: ["Photography", "Art", "Travel", "London"],
      memberCount: 156,
      isPublic: true,
    },
    {
      name: "Tech Professionals UK",
      description: "Networking group for technology professionals",
      tags: ["Technology", "Career", "Networking"],
      memberCount: 2341,
      isPublic: true,
    },
    {
      name: "Fitness Warriors",
      description: "Get fit together! Share workout routines",
      tags: ["Fitness", "Sports", "Health"],
      memberCount: 892,
      isPublic: true,
    },
  ]

  const existingUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")

  testUsers.forEach((user) => {
    const exists = existingUsers.find((u) => u.email === user.email)
    if (!exists) {
      const newUser = {
        ...user,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      }
      existingUsers.push(newUser)
      console.log("[v0] Created user: " + user.name)
    }
  })

  localStorage.setItem("allUsers", JSON.stringify(existingUsers))

  const existingGroups = JSON.parse(localStorage.getItem("allGroups") || "[]")

  testGroups.forEach((group) => {
    const exists = existingGroups.find((g) => g.name === group.name)
    if (!exists) {
      const newGroup = {
        ...group,
        id: "grp_" + Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        creatorId: existingUsers[0]?.id || "system",
      }
      existingGroups.push(newGroup)
      console.log("[v0] Created group: " + group.name)
    }
  })

  localStorage.setItem("allGroups", JSON.stringify(existingGroups))
  console.log(
    "[v0] Done! Created " + testUsers.length + " users and " + testGroups.length + " groups. Refresh page to see them.",
  )
})()
