import { type NextRequest, NextResponse } from "next/server"
import { pgPostService } from "@/lib/database/services/pg-post-service"

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const result = await pgPostService.deletePost(postId, userId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 403 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete post API error:", error)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
