"use client"

import { useState } from "react"
import { Users, MousePointer2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth-modal"

const column1 = [
  { src: "/landing/bridge.jpg", alt: "Modern bridge architecture" },
  { src: "/landing/truck.jpg", alt: "Friends on pickup truck" },
  { src: "/landing/building.jpg", alt: "Modern architecture" },
  { src: "/landing/flower.jpg", alt: "Yellow flower" },
]

const column2 = [
  { src: "/landing/cherry.jpg", alt: "Cherry blossoms and tower" },
  { src: "/landing/sailing.jpg", alt: "Sailing boat view" },
  { src: "/landing/plane.jpg", alt: "View from airplane window" },
]

const column3 = [
  { src: "/landing/paris.jpg", alt: "Eiffel tower view" },
  { src: "/landing/friends-grass.jpg", alt: "Friends in grass" },
  { src: "/landing/friends-lake.jpg", alt: "Friends by the lake" },
  { src: "/landing/road.jpg", alt: "Mountain road" },
]

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup")

  const openSignup = () => {
    setAuthMode("signup")
    setAuthModalOpen(true)
  }

  const openLogin = () => {
    setAuthMode("login")
    setAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-200">
      <div className="container mx-auto px-4 h-screen flex flex-col lg:flex-row">
        {/* Left Content Section */}
        <div className="w-full lg:w-[40%] flex flex-col justify-between py-8 lg:py-12 z-10 relative">
          {/* Header */}
          <header>
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              FriendFinder
            </div>
          </header>

          {/* Main Heading */}
          <main className="space-y-6">
            <h1 className="text-6xl lg:text-8xl font-semibold tracking-tighter leading-[0.9]">
              Friend
              <br />
              Finder
              <span className="inline-block ml-4 text-2xl lg:text-3xl font-normal tracking-normal text-gray-500 border border-gray-300 rounded-full px-4 py-1 align-middle mt-2">
                Playground
              </span>
            </h1>
            <p className="text-2xl lg:text-3xl text-gray-500 max-w-md leading-normal">
              Connect with friends, share your moments, and discover the world together.
            </p>
            <div className="flex items-center gap-6 pt-4">
              <Button
                onClick={openSignup}
                className="rounded-full text-base px-8 py-2 h-12 bg-black text-white hover:bg-gray-800 transition-all hover:scale-105"
              >
                Sign up
                <MousePointer2 className="ml-2 w-4 h-4" />
              </Button>
              <Button
                onClick={openLogin}
                variant="ghost"
                className="text-base font-medium hover:bg-transparent hover:text-gray-900 px-0 h-12 transition-all hover:scale-105"
              >
                Log in
              </Button>
            </div>
          </main>

          <div />
        </div>

        {/* Right Masonry Grid Section */}
        <div className="hidden lg:flex w-[60%] h-full pl-8 py-4 gap-4 overflow-hidden">
          {/* Column 1 */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src="/landing/bridge.jpg"
                alt="Modern bridge architecture"
                className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src="/landing/truck.jpg"
                alt="Friends on pickup truck"
                className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src="/landing/building.jpg"
                alt="Modern architecture"
                className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src="/landing/flower.jpg"
                alt="Yellow flower"
                className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src="/landing/cherry.jpg"
                alt="Cherry blossoms and tower"
                className="w-full aspect-[3/5] object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src="/landing/sailing.jpg"
                alt="Sailing boat view"
                className="w-full aspect-[3/5] object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src="/landing/plane.jpg"
                alt="View from airplane window"
                className="w-full aspect-[3/5] object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          </div>

          {/* Column 3 */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src="/landing/paris.jpg"
                alt="Eiffel tower view"
                className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src="/landing/friends-grass.jpg"
                alt="Friends in grass"
                className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src="/landing/friends-lake.jpg"
                alt="Friends by the lake"
                className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src="/landing/road.jpg"
                alt="Mountain road"
                className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
          </div>
        </div>

        {/* Mobile Grid (shown only on small screens) */}
        <div className="lg:hidden grid grid-cols-2 gap-3 pb-8 mt-8">
          {[...column1, ...column2, ...column3].slice(0, 6).map((img, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden aspect-[3/4]">
              <img src={img.src || "/placeholder.svg"} alt={img.alt} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode={authMode} />
    </div>
  )
}
