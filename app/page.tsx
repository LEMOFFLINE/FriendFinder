"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, Heart, Shield, Sparkles } from "lucide-react"

export default function HomePage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[v0] Service Worker registered:", registration)
        })
        .catch((error) => {
          console.log("[v0] Service Worker registration failed:", error)
        })
    }

    // Listen for beforeinstallprompt event
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

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    console.log("[v0] User response to install prompt:", outcome)
    setDeferredPrompt(null)
    setShowInstallButton(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-background)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">FriendFinder</span>
            </div>
            <Link
              href="/login"
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="block">Find Your People</span>
            <span className="block text-[var(--color-primary)] mt-2">Connect Through Shared Interests</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-muted)] leading-relaxed">
            Meeting new friends shouldn't be hard. FriendFinder helps you connect with like-minded people based on your
            hobbies, interests, and passions.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="rounded-lg bg-[var(--color-primary)] px-8 py-3 text-base font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Get Started
            </Link>
            {showInstallButton && (
              <button
                onClick={handleInstallClick}
                className="rounded-lg border-2 border-[var(--color-primary)] px-8 py-3 text-base font-medium text-[var(--color-primary)] hover:bg-[var(--color-surface)] transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Install App
              </button>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
              <Heart className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">Interest-Based Matching</h3>
            <p className="mt-2 text-[var(--color-muted)] leading-relaxed">
              Our algorithm connects you with people who share your hobbies and passions.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-secondary)]/10">
              <Shield className="h-6 w-6 text-[var(--color-secondary)]" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">Safe & Secure</h3>
            <p className="mt-2 text-[var(--color-muted)] leading-relaxed">
              Your privacy matters. We use industry-standard security and moderation.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-8 sm:col-span-2 lg:col-span-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent)]/10">
              <Users className="h-6 w-6 text-[var(--color-accent)]" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">Real Connections</h3>
            <p className="mt-2 text-[var(--color-muted)] leading-relaxed">
              Build genuine friendships with people in your area or around the world.
            </p>
          </div>
        </div>

        {/* PWA Info Section */}
        <div className="mt-20 rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 p-8">
          <h2 className="text-2xl font-bold text-center">Works Everywhere</h2>
          <p className="mt-4 text-center text-[var(--color-muted)] max-w-2xl mx-auto leading-relaxed">
            FriendFinder is a Progressive Web App (PWA). Install it on your phone or use it in your browser - it works
            seamlessly on any device.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-primary)]">📱</div>
              <p className="mt-2 text-sm font-medium">Mobile Friendly</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-primary)]">⚡</div>
              <p className="mt-2 text-sm font-medium">Fast & Reliable</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-primary)]">🔄</div>
              <p className="mt-2 text-sm font-medium">Works Offline</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-[var(--color-muted)]">
            © 2025 FriendFinder. A university project for learning PWA development.
          </p>
        </div>
      </footer>
    </div>
  )
}
