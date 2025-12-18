// Test data generation script
// Run in browser console: copy and paste this entire script

import { userService } from "../lib/database/services/user-service"
import { db } from "../lib/database/client"

export async function createTestData() {
  console.log("Starting test data generation...")

  const testUsers = [
    {
      name: "Sarah Chen",
      email: "sarah@test.com",
      password: "Test123",
      age: 28,
      location: "London",
      interests: ["Photography", "Travel", "Coffee", "Art"],
      bio: "Adventure seeker and coffee enthusiast.",
    },
    {
      name: "James Wilson",
      email: "james@test.com",
      password: "Test123",
      age: 32,
      location: "Manchester",
      interests: ["Gaming", "Cooking", "Music", "Technology"],
      bio: "Software engineer by day, gamer by night.",
    },
    {
      name: "Emma Rodriguez",
      email: "emma@test.com",
      password: "Test123",
      age: 26,
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

  // Create users
  for (const userData of testUsers) {
    const result = await userService.register({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      age: userData.age,
      location: userData.location,
    })

    if (result.success && result.user) {
      console.log(`Created user: ${userData.name}`)

      await userService.setUserInterests(result.user.user_id, userData.interests)

      // Update bio
      await db.updateUser(result.user.user_id, { bio: userData.bio })
    } else {
      console.log(`User ${userData.name} already exists or failed to create`)
    }
  }

  const existingGroups = await db.getGroups()

  // Create groups
  for (const groupData of testGroups) {
    const exists = existingGroups.find((g) => g.name === groupData.name)
    if (!exists) {
      const newGroup = {
        ...groupData,
        id: "grp_" + Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        creatorId: existingGroups.length > 0 ? existingGroups[0].creatorId : "system",
      }
      await db.createGroup(newGroup)
      console.log(`Created group: ${groupData.name}`)
    }
  }

  console.log("✅ Test data created successfully!")
}

// Run if executed directly
if (typeof window !== "undefined") {
  createTestData()
}
