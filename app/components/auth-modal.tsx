"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, AlertCircle, CheckCircle2 } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode: "login" | "signup"
}

export function AuthModal({ isOpen, onClose, initialMode }: AuthModalProps) {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "signup">(initialMode)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [loginError, setLoginError] = useState("")
  const [isLoginLoading, setIsLoginLoading] = useState(false)

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    location: "",
  })
  const [signupError, setSignupError] = useState("")
  const [isSignupLoading, setIsSignupLoading] = useState(false)

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

  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
    } else {
      setIsAnimating(false)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Update mode when initialMode changes
  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  // Email validation for signup
  useEffect(() => {
    if (mode !== "signup") return

    const timer = setTimeout(async () => {
      if (signupData.email.length > 3) {
        setEmailValidation({ isChecking: true, isValid: true, message: "Checking..." })

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(signupData.email)) {
          setEmailValidation({ isChecking: false, isValid: false, message: "Invalid email format" })
          return
        }

        try {
          const response = await fetch("/api/auth/check-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: signupData.email }),
          })

          const data = await response.json()

          if (data.exists) {
            setEmailValidation({ isChecking: false, isValid: false, message: "Email already registered" })
          } else {
            setEmailValidation({ isChecking: false, isValid: true, message: "Email available" })
          }
        } catch (error) {
          console.error("[v0] Email check error:", error)
          setEmailValidation({ isChecking: false, isValid: true, message: "" })
        }
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [signupData.email, mode])

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
    if (signupData.password || signupData.confirmPassword) {
      validatePassword(signupData.password, signupData.confirmPassword)
    }
  }, [signupData.password, signupData.confirmPassword, validatePassword])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    setIsLoginLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()

      if (!response.ok) {
        setLoginError(data.error || "Login failed")
        setIsLoginLoading(false)
        return
      }

      sessionStorage.setItem("currentUser", JSON.stringify(data.user))
      sessionStorage.setItem("isLoggedIn", "true")

      onClose()
      router.push("/discover")
    } catch (error) {
      console.error("[v0] Login error:", error)
      setLoginError("Login failed. Please try again.")
      setIsLoginLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError("")

    if (!emailValidation.isValid) {
      setSignupError("Please use a valid, available email address")
      return
    }

    if (!passwordValidation.isValid) {
      setSignupError("Please ensure your password meets requirements")
      return
    }

    setIsSignupLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
          age: signupData.age ? Number.parseInt(signupData.age) : undefined,
          location: signupData.location,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSignupError(data.error || "Registration failed")
        setIsSignupLoading(false)
        return
      }

      sessionStorage.setItem("currentUser", JSON.stringify(data.user))
      sessionStorage.setItem("isLoggedIn", "true")

      onClose()
      router.push("/interests")
    } catch (error) {
      console.error("[v0] Registration error:", error)
      setSignupError("Registration failed. Please try again.")
      setIsSignupLoading(false)
    }
  }

  const switchMode = (newMode: "login" | "signup") => {
    setMode(newMode)
    // Clear errors when switching
    setLoginError("")
    setSignupError("")
  }

  const isSignupFormValid =
    emailValidation.isValid &&
    passwordValidation.isValid &&
    signupData.name &&
    signupData.email &&
    signupData.password &&
    signupData.confirmPassword &&
    signupData.age &&
    signupData.location

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isAnimating ? "bg-black/50" : "bg-black/0"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`w-full max-w-md bg-white rounded-2xl shadow-2xl transition-all duration-300 ease-out max-h-[85vh] overflow-y-auto mx-4 ${
          isAnimating ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* Header with close button */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 pb-4 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === "login" ? "Welcome Back" : "Create Your Account"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Close">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 pt-4">
          <p className="text-center text-sm text-gray-600 mb-6">
            {mode === "login" ? "Sign in to continue connecting" : "Start connecting with like-minded people"}
          </p>

          {/* Login Form */}
          {mode === "login" && (
            <div className="animate-fadeIn">
              {loginError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{loginError}</p>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="login-password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                  {isLoginLoading ? "Logging in..." : "Log In"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <button onClick={() => switchMode("signup")} className="font-medium text-gray-900 hover:underline">
                  Sign up
                </button>
              </p>
            </div>
          )}

          {/* Signup Form */}
          {mode === "signup" && (
            <div className="animate-fadeIn">
              {signupError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{signupError}</p>
                </div>
              )}

              <form onSubmit={handleSignupSubmit} className="space-y-5">
                <div>
                  <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="signup-name"
                    required
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="signup-email"
                      required
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className={`w-full rounded-lg border ${
                        signupData.email.length > 3
                          ? emailValidation.isValid
                            ? "border-green-300"
                            : "border-red-300"
                          : "border-gray-300"
                      } bg-white px-4 py-2.5 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent`}
                      placeholder="john@example.com"
                    />
                    {signupData.email.length > 3 && (
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
                  {signupData.email.length > 3 && emailValidation.message && (
                    <p className={`mt-1 text-sm ${emailValidation.isValid ? "text-green-600" : "text-red-600"}`}>
                      {emailValidation.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="signup-password"
                    required
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    className={`w-full rounded-lg border ${
                      signupData.password && !passwordValidation.isValid ? "border-red-300" : "border-gray-300"
                    } bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent`}
                    placeholder="At least 8 characters"
                  />
                  <p className="mt-1 text-xs text-gray-500">Must include letters and numbers</p>
                </div>

                <div>
                  <label htmlFor="signup-confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="signup-confirmPassword"
                    required
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    className={`w-full rounded-lg border ${
                      signupData.confirmPassword && !passwordValidation.isValid ? "border-red-300" : "border-gray-300"
                    } bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent`}
                    placeholder="Re-enter password"
                  />
                  {passwordValidation.message && (
                    <p className="mt-1 text-sm text-red-600">{passwordValidation.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="signup-age" className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      id="signup-age"
                      required
                      min="18"
                      max="100"
                      value={signupData.age}
                      onChange={(e) => setSignupData({ ...signupData, age: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="25"
                    />
                  </div>

                  <div>
                    <label htmlFor="signup-location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      id="signup-location"
                      required
                      value={signupData.location}
                      onChange={(e) => setSignupData({ ...signupData, location: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="London"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isSignupFormValid || isSignupLoading}
                  className="w-full rounded-lg bg-gray-900 px-4 py-3 font-medium text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                  {isSignupLoading ? "Creating Account..." : "Continue"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button onClick={() => switchMode("login")} className="font-medium text-gray-900 hover:underline">
                  Log in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
