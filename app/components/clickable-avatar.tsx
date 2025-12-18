"use client"

import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ClickableAvatarProps {
  userId: string
  userName: string
  avatarUrl?: string
  size?: "sm" | "md" | "lg"
  currentUserId?: string
  className?: string
}

export function ClickableAvatar({
  userId,
  userName,
  avatarUrl,
  size = "md",
  currentUserId,
  className,
}: ClickableAvatarProps) {
  const router = useRouter()

  const getInitials = (name: string) => {
    if (!name || typeof name !== "string") return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const sizeClasses = {
    sm: "size-8",
    md: "size-10",
    lg: "size-16",
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-xl",
  }

  const handleClick = () => {
    // Don't navigate if clicking on own avatar on profile page
    if (userId === currentUserId && window.location.pathname.includes("/users/")) {
      return
    }
    router.push(`/users/${userId}`)
  }

  const isOwnProfile = userId === currentUserId && window.location.pathname.includes("/users/")

  return (
    <Avatar
      className={cn(
        sizeClasses[size],
        !isOwnProfile && "cursor-pointer hover:opacity-80 transition-opacity",
        className,
      )}
      onClick={!isOwnProfile ? handleClick : undefined}
    >
      <AvatarImage src={avatarUrl || ""} alt={userName} />
      <AvatarFallback className={cn("bg-gray-600 text-white font-semibold", textSizeClasses[size])}>
        {getInitials(userName)}
      </AvatarFallback>
    </Avatar>
  )
}
