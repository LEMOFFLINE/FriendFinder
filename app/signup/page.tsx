"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Users, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    location: "",
  })

  const [emailValidation, setEmailValidation] = useState<{
    isChecking: boolean
    isValid: boolean
    message: string
  }>({
    isChecking: false,
    isValid: true,
    message: "",
  })

  const [passwordValidation, setPasswordValidation] = useState({
    isValid: true,
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.email.length > 3) {
        setEmailValidation({ isChecking: true, isValid: true, message: "Checking..." })

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          setEmailValidation({ isChecking: false, isValid: false, message: "Invalid email format" })
          return
        }

        try {
          const response = await fetch('/api/auth/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email })
          })

          const data = await response.json()

          if (data.exists) {
            setEmailValidation({ isChecking: false, isValid: false, message: "Email already registered" })
          } else {
            setEmailValidation({ isChecking: false, isValid: true, message: "Email available" })
          }
        } catch (error) {
          console.error('[v0] Email check error:', error)
          setEmailValidation({ isChecking: false, isValid: true, message: "" })
        }
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.email])

  const validatePassword = useCallback((password: string, confirmPassword: string) => {
    const hasMinLength = password.length >= 8
    const hasLetter = /[A-Za-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const passwordsMatch = password === confirmPassword

    if (!hasMinLength || !hasLetter || !hasNumber) {
      setPasswordValidation({
        isValid: false,
        message: "Password must be at least 8 characters with letters and numbers",
      })
    } else if (confirmPassword && !passwordsMatch) {
      setPasswordValidation({
        isValid: false,
        message: "Passwords do not match",
      })
    } else {
      setPasswordValidation({
        isValid: true,
        message: "",
      })
    }
  }, [])

  useEffect(() => {
    if (formData.password || formData.confirmPassword) {
      validatePassword(formData.password, formData.confirmPassword)
    }
  }, [formData.password, formData.confirmPassword, validatePassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!emailValidation.isValid) {
      setError("Please use a valid, available email address")
      return
    }

    if (!passwordValidation.isValid) {
      setError("Please ensure your password meets requirements")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          age: formData.age ? Number.parseInt(formData.age) : undefined,
          location: formData.location,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        setIsSubmitting(false)
        return
      }

      // Store user session
      sessionStorage.setItem('currentUser', JSON.stringify(data.user))
      sessionStorage.setItem('isLoggedIn', 'true')

      console.log('[v0] Registration successful, redirecting to interests')
      router.push('/interests')
    } catch (error) {
      console.error('[v0] Registration error:', error)
      setError('Registration failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    emailValidation.isValid &&
    passwordValidation.isValid &&
    formData.name &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.age &&
    formData.location

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">FriendFinder</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Sign Up Form */}
      <main className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-center text-gray-900">Create Your Account</h1>
          <p className="mt-2 text-center text-sm text-gray-600">Start connecting with like-minded people</p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full rounded-lg border ${
                    formData.email.length > 3
                      ? emailValidation.isValid
                        ? "border-green-300"
                        : "border-red-300"
                      : "border-gray-300"
                  } bg-white px-4 py-2.5 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent`}
                  placeholder="john@example.com"
                />
                {formData.email.length > 3 && (
                  <div className="absolute right-3 top-3">
                    {emailValidation.isChecking ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
                    ) : emailValidation.isValid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                )}
              </div>
              {formData.email.length > 3 && emailValidation.message && (
                <p className={`mt-1 text-sm ${emailValidation.isValid ? "text-green-600" : "text-red-600"}`}>
                  {emailValidation.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full rounded-lg border ${
                  formData.password && !passwordValidation.isValid ? "border-red-300" : "border-gray-300"
                } bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent`}
                placeholder="At least 8 characters"
              />
              <p className="mt-1 text-xs text-gray-500">Must include letters and numbers</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full rounded-lg border ${
                  formData.confirmPassword && !passwordValidation.isValid ? "border-red-300" : "border-gray-300"
                } bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent`}
                placeholder="Re-enter password"
              />
              {passwordValidation.message && <p className="mt-1 text-sm text-red-600">{passwordValidation.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  required
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="25"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="London"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {isSubmitting ? "Creating Account..." : "Continue"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-gray-900 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
