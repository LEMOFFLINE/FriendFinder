"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageCircle, Compass, Users, User } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/feed", icon: MessageCircle, label: "Feed" },
    { href: "/discover", icon: Compass, label: "Discover" },
    { href: "/contacts", icon: Users, label: "Contacts" },
    { href: "/profile", icon: User, label: "Profile" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex justify-around py-3">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-xs ${isActive ? "font-semibold" : "font-medium"}`}>{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
