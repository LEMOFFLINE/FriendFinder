// Feed Test Data Generator - Run in Browser Console (F12)
// This script creates test posts with images and interactions

;(() => {
  console.log("Starting Feed Test Data Generation...")

  // Image URLs from uploaded images
  const images = [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kevin-mueller-nAR-LfzGkdc-unsplash-wG5nRpQPl4NvuMKNohXLIami9Lmqn4.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/polina-kuzovkova-S7zZpgsIyYw-unsplash-pRwUJJ5jA0vqtMtbybdoUKQchkT4Iy.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hato-0Zy8Be-M0aU-unsplash-GbXED5VxQYxwSzfQaWZfKDudPogPkg.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/frank-huang-UpUpNXsL0LA-unsplash-qNEqa3xNcaXYx3gSZHt7nw3xtAVGdu.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/06b92f26918e202a6464c25f50b3fe8f-OmHxkXlmIcR62vdPqozOQqFla5NEl5.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1441028_1200x2140-bFVKrq04VSPezscvHD3XLFeCWSrLAk.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/anna-blake-oL0mWjaLx9o-unsplash-nRZKuucJb3LvmRFs4vCZ9n7Rlss15B.jpg",
  ]

  // Get test users
  const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]")
  const sarah = allUsers.find((u) => u.email === "sarah@test.com")
  const james = allUsers.find((u) => u.email === "james@test.com")
  const emma = allUsers.find((u) => u.email === "emma@test.com")

  if (!sarah || !james || !emma) {
    console.error("Test users not found! Please run create-test-data.ts first.")
    return
  }

  console.log("Found test users:", { sarah: sarah.name, james: james.name, emma: emma.name })

  // Create posts storage if not exists
  if (!localStorage.getItem("posts")) {
    localStorage.setItem("posts", JSON.stringify([]))
  }

  const posts = []
  const postCounter = 1

  // Helper function to create post
  function createPost(authorId, content, imageUrl) {
    const post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      authorId: authorId,
      content: content,
      images: imageUrl ? [imageUrl] : [],
      likes: [],
      comments: [],
      reposts: [],
      visibility: "everyone",
      createdAt: Date.now() - Math.floor(Math.random() * 86400000 * 3),
      updatedAt: Date.now(),
    }
    return post
  }

  // Sarah's posts
  posts.push(createPost(sarah.id, "This is a test post no.1\nEnjoy the tropical vibes!", images[0]))

  posts.push(createPost(sarah.id, "This is a test post no.2\nAutumn leaves in the rain.", images[1]))

  // James's posts
  posts.push(createPost(james.id, "This is a test post no.3\nMinimalist aesthetics.", images[2]))

  posts.push(createPost(james.id, "This is a test post no.4\nRoad trip adventures!", images[3]))

  // Emma's posts
  posts.push(createPost(emma.id, "This is a test post no.5\nPainting of a winter evening.", images[4]))

  posts.push(createPost(emma.id, "This is a test post no.6\nStanding alone but strong.", images[5]))

  posts.push(createPost(emma.id, "This is a test post no.7\nSpring moments.", images[6]))

  console.log(`Created ${posts.length} posts`)

  // Add likes
  posts[0].likes = [james.id, emma.id]
  posts[1].likes = [james.id]
  posts[2].likes = [sarah.id, emma.id]
  posts[3].likes = [sarah.id]
  posts[4].likes = [sarah.id, james.id]
  posts[5].likes = [james.id]
  posts[6].likes = [sarah.id, james.id]

  console.log("Added likes to posts")

  // Add comments
  posts[0].comments = [
    {
      id: `comment_${Date.now()}_1`,
      postId: posts[0].id,
      authorId: james.id,
      content: "This is a test comment no.1\nLove the palm trees!",
      createdAt: Date.now() - 3600000,
    },
    {
      id: `comment_${Date.now()}_2`,
      postId: posts[0].id,
      authorId: emma.id,
      content: "This is a test comment no.2\nSo beautiful!",
      createdAt: Date.now() - 1800000,
    },
  ]

  posts[2].comments = [
    {
      id: `comment_${Date.now()}_3`,
      postId: posts[2].id,
      authorId: sarah.id,
      content: "This is a test comment no.3\nVery clean design!",
      createdAt: Date.now() - 7200000,
    },
  ]

  posts[4].comments = [
    {
      id: `comment_${Date.now()}_4`,
      postId: posts[4].id,
      authorId: james.id,
      content: "This is a test comment no.4\nAmazing artwork!",
      createdAt: Date.now() - 5400000,
    },
    {
      id: `comment_${Date.now()}_5`,
      postId: posts[4].id,
      authorId: sarah.id,
      content: "This is a test comment no.5\nWhere did you find this?",
      createdAt: Date.now() - 3600000,
    },
  ]

  posts[6].comments = [
    {
      id: `comment_${Date.now()}_6`,
      postId: posts[6].id,
      authorId: james.id,
      content: "This is a test comment no.6\nGorgeous photo!",
      createdAt: Date.now() - 900000,
    },
  ]

  console.log("Added comments to posts")

  // Add reposts
  posts[0].reposts = [james.id]
  posts[4].reposts = [sarah.id]

  console.log("Added reposts")

  // Save to localStorage
  localStorage.setItem("posts", JSON.stringify(posts))

  console.log("\n✅ Feed test data created successfully!")
  console.log(`- ${posts.length} posts created`)
  console.log(`- ${posts.reduce((sum, p) => sum + p.likes.length, 0)} likes added`)
  console.log(`- ${posts.reduce((sum, p) => sum + p.comments.length, 0)} comments added`)
  console.log(`- ${posts.reduce((sum, p) => sum + p.reposts.length, 0)} reposts added`)
  console.log("\nRefresh the page to see the posts in your Feed!")
})()
