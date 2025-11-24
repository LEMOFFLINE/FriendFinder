"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, Heart, Shield, Sparkles, Smartphone, Zap, RefreshCw } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const carouselImages = [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-zvolskiy-1830937-yr2z0bE3V8CNsCl764b3Kaov6T3P9s.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-vjapratama-935835-BjKUUh80dTXnobNKj9mTur1jOzmXA1.jpg",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-johnpaultyrone-450301-DRbSLrVh297lHXfxr5JZn6Jgk4CWYk.jpg",
  ]

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    setDeferredPrompt(null)
    setShowInstallButton(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - 改为白灰色调 */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FriendFinder</span>
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - 添加海洋背景图 */}
      <main className="relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pexels-matthardy-1533720-phMMZWYUjOTnhJOhDZURVQ9oBHFNF4.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Find Your People</span>
              <span className="block text-gray-700 mt-2">Connect Through Shared Interests</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 leading-relaxed">
              Meeting new friends shouldn't be hard. FriendFinder helps you connect with like-minded people based on
              your hobbies, interests, and passions.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="rounded-lg bg-gray-900 px-8 py-3 text-base font-medium text-white hover:bg-gray-800 transition-colors"
              >
                Get Started
              </Link>
              {showInstallButton && (
                <button
                  onClick={handleInstallClick}
                  className="rounded-lg border-2 border-gray-900 px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-5 w-5" />
                  Install App
                </button>
              )}
            </div>
          </div>

          <div className="mt-16 relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
              <div className="relative h-96">
                {carouselImages.map((img, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentImageIndex ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`Feature showcase ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              {/* 轮播指示器 */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      index === currentImageIndex ? "bg-white w-8" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Features - 改为白灰色调 */}
          <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <Heart className="h-6 w-6 text-gray-900" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Interest-Based Matching</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Our algorithm connects you with people who share your hobbies and passions.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <Shield className="h-6 w-6 text-gray-700" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Safe & Secure</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Your privacy matters. We use industry-standard security and moderation.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <Users className="h-6 w-6 text-gray-700" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Real Connections</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Build genuine friendships with people in your area or around the world.
              </p>
            </div>
          </div>

          {/* PWA Features - 改为白灰色调 */}
          <div className="mt-20 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-center text-gray-900">Works Everywhere</h2>
            <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto leading-relaxed">
              FriendFinder is a Progressive Web App (PWA). Install it on your phone or use it in your browser - it works
              seamlessly on any device.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-gray-200">
                    <Smartphone className="h-6 w-6 text-gray-900" />
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium text-gray-900">Mobile Friendly</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-gray-200">
                    <Zap className="h-6 w-6 text-gray-900" />
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium text-gray-900">Fast & Reliable</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-gray-200">
                    <RefreshCw className="h-6 w-6 text-gray-900" />
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium text-gray-900">Works Offline</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - 改为白灰色调 */}
      <footer className="mt-20 border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            © 2025 FriendFinder. A university project for learning PWA development.
          </p>
        </div>
      </footer>
    </div>
  )
}
