import { type NextRequest, NextResponse } from "next/server"
import fs from "node:fs/promises"
import path from "node:path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 2MB" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), "public/uploads/avatars")
    await fs.mkdir(uploadDir, { recursive: true })

    const fileName = `${userId}-${Date.now()}${path.extname(file.name)}`
    const filePath = path.join(uploadDir, fileName)

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    const url = `/uploads/avatars/${fileName}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Error uploading avatar:", error)
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 })
  }
}
