"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Users, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      localStorage.setItem("isLoggedIn", "true")
      router.push("/discover")
    } else {
      alert("No account found. Please sign up first.")
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <ArrowLeft className="h-5 w-5" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">FriendFinder</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <main className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-8">
          <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
          <p className="mt-2 text-center text-sm text-[var(--color-muted)]">Log in to continue connecting</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Log In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-[var(--color-primary)] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
