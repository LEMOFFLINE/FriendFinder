"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { ClickableAvatar } from "@/components/clickable-avatar"

export function AppHeader() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const userStr = sessionStorage.getItem("currentUser")
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }
  }, [pathname])

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (currentUser) {
      router.push('/feed')
    } else {
      router.push('/')
    }
  }

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">FriendFinder</span>
          </Link>

          {/* Username - Right */}
          {currentUser && (
            <div className="flex items-center gap-3">
              {/* Added ClickableAvatar and made name clickable */}
              <ClickableAvatar
                userId={currentUser.user_id}
                userName={currentUser.name}
                size="sm"
                currentUserId={currentUser.user_id}
              />
              <Link 
                href={`/users/${currentUser.user_id}`}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:underline"
              >
                {currentUser.name}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
