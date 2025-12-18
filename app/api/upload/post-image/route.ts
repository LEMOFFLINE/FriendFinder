import { type NextRequest, NextResponse } from "next/server"
import fs from "node:fs/promises"
import path from "node:path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Limit to 2MB for better server performance
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 2MB" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), "public/uploads/posts")
    await fs.mkdir(uploadDir, { recursive: true })

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.name)}`
    const filePath = path.join(uploadDir, fileName)

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    const url = `/uploads/posts/${fileName}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Error uploading post image:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}
