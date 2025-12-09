// Feed Test Data Generator - Run in Browser Console (F12)
// This script creates test posts with images and interactions

import { postService } from "../lib/database/services/post-service"
import { userService } from "../lib/database/services/user-service"

export async function createFeedTestData() {
  console.log("Starting Feed Test Data Generation...")

  const images = [
    "/images/kevin-mueller-nar-lfzgkdc-unsplash.jpg",
    "/images/polina-kuzovkova-s7zzpgsiyyw-unsplash.jpg",
    "/images/hato-0zy8be-m0au-unsplash.jpg",
    "/images/frank-huang-upupnxsl0la-unsplash.jpg",
    "/images/06b92f26918e202a6464c25f50b3fe8f.jpg",
    "/images/1441028-1200x2140.jpg",
    "/images/anna-blake-ol0mwjalx9o-unsplash.jpg",
  ]

  // Get test users
  const allUsers = await userService.getAllUsers()
  const sarah = allUsers.find((u) => u.email === "sarah@test.com")
  const james = allUsers.find((u) => u.email === "james@test.com")
  const emma = allUsers.find((u) => u.email === "emma@test.com")

  if (!sarah || !james || !emma) {
    console.error("Test users not found! Please run create-test-data.ts first.")
    return
  }

  console.log("Found test users:", { sarah: sarah.name, james: james.name, emma: emma.name })

  // Create posts
  const postContents = [
    { author: sarah.user_id, text: "This is a test post no.1\nEnjoy the tropical vibes!", image: images[0] },
    { author: sarah.user_id, text: "This is a test post no.2\nAutumn leaves in the rain.", image: images[1] },
    { author: james.user_id, text: "This is a test post no.3\nMinimalist aesthetics.", image: images[2] },
    { author: james.user_id, text: "This is a test post no.4\nRoad trip adventures!", image: images[3] },
    { author: emma.user_id, text: "This is a test post no.5\nPainting of a winter evening.", image: images[4] },
    { author: emma.user_id, text: "This is a test post no.6\nStanding alone but strong.", image: images[5] },
    { author: emma.user_id, text: "This is a test post no.7\nSpring moments.", image: images[6] },
  ]

  const createdPosts = []
  for (const postData of postContents) {
    const post = await postService.createPost({
      authorId: postData.author,
      content: postData.text,
      images: [postData.image],
      visibility: "everyone",
    })
    createdPosts.push(post)
  }

  console.log(`Created ${createdPosts.length} posts`)

  // Add likes
  await postService.likePost(createdPosts[0].post_id, james.user_id)
  await postService.likePost(createdPosts[0].post_id, emma.user_id)
  await postService.likePost(createdPosts[1].post_id, james.user_id)
  await postService.likePost(createdPosts[2].post_id, sarah.user_id)
  await postService.likePost(createdPosts[2].post_id, emma.user_id)
  await postService.likePost(createdPosts[3].post_id, sarah.user_id)
  await postService.likePost(createdPosts[4].post_id, sarah.user_id)
  await postService.likePost(createdPosts[4].post_id, james.user_id)
  await postService.likePost(createdPosts[5].post_id, james.user_id)
  await postService.likePost(createdPosts[6].post_id, sarah.user_id)
  await postService.likePost(createdPosts[6].post_id, james.user_id)

  console.log("Added likes to posts")

  // Add comments
  await postService.addComment({
    postId: createdPosts[0].post_id,
    authorId: james.user_id,
    content: "This is a test comment no.1\nLove the palm trees!",
  })

  await postService.addComment({
    postId: createdPosts[0].post_id,
    authorId: emma.user_id,
    content: "This is a test comment no.2\nSo beautiful!",
  })

  await postService.addComment({
    postId: createdPosts[2].post_id,
    authorId: sarah.user_id,
    content: "This is a test comment no.3\nVery clean design!",
  })

  await postService.addComment({
    postId: createdPosts[4].post_id,
    authorId: james.user_id,
    content: "This is a test comment no.4\nAmazing artwork!",
  })

  await postService.addComment({
    postId: createdPosts[4].post_id,
    authorId: sarah.user_id,
    content: "This is a test comment no.5\nWhere did you find this?",
  })

  await postService.addComment({
    postId: createdPosts[6].post_id,
    authorId: james.user_id,
    content: "This is a test comment no.6\nGorgeous photo!",
  })

  console.log("Added comments to posts")

  // Add reposts
  await postService.repostPost(createdPosts[0].post_id, james.user_id)
  await postService.repostPost(createdPosts[4].post_id, sarah.user_id)

  console.log("Added reposts")

  console.log("✅ Feed test data created successfully!")
  console.log("Refresh the page to see the posts in your Feed!")
}

// Run if executed directly
if (typeof window !== "undefined") {
  createFeedTestData()
}
