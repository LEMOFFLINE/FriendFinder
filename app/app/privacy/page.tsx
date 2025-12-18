"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const currentUser = JSON.parse(storedUser)
      setUser(currentUser)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">Privacy & Safety</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6">
          <h2 className="text-2xl font-bold mb-6">Privacy Notice for Academic Project</h2>

          <div className="space-y-6 text-sm">
            <div>
              <h3 className="font-semibold text-lg mb-2">Privacy Notice for Friend Finder</h3>
              <p className="text-[var(--color-foreground)]">
                Welcome to Friend Finder! This is a demo website created as a final project for Thematic Project.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">1. Information We Collect</h3>
              <p className="text-[var(--color-foreground)] mb-2">
                To provide you with the core functionalities, we may collect the minimum necessary information:
              </p>
              <ul className="list-disc list-inside text-[var(--color-foreground)] space-y-1 ml-4">
                <li>
                  <strong>Account Information:</strong> Your username, email address, and password used for
                  registration.
                </li>
                <li>
                  <strong>Profile Information:</strong> Your voluntarily provided display name, bio, and profile
                  picture.
                </li>
                <li>
                  <strong>Content Data:</strong> Messages, images, and other content you post.
                </li>
                <li>
                  <strong>Technical Data:</strong> Your IP address, browser type, and anonymous usage data collected via
                  Cookies (see below) to ensure basic website operation.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. How We Use Your Information</h3>
              <p className="text-[var(--color-foreground)] mb-2">
                We use your information solely for the following purposes:
              </p>
              <ul className="list-disc list-inside text-[var(--color-foreground)] space-y-1 ml-4">
                <li>To provide and maintain our core services (e.g., posting, following).</li>
                <li>To identify you and allow you to log in and manage your account.</li>
                <li>For debugging and optimizing website performance (the primary goal of this project).</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Sharing and Disclosure of Information</h3>
              <p className="text-[var(--color-foreground)] mb-2">
                <strong>Please Note:</strong> This is a demo project deployed on a public server.
              </p>
              <ul className="list-disc list-inside text-[var(--color-foreground)] space-y-1 ml-4">
                <li>
                  <strong>Public Information:</strong> Your username, profile information, and all content you post are
                  publicly visible to anyone who accesses this website.
                </li>
                <li>
                  <strong>No Sale:</strong> We do not and will not sell your personal information to any third party.
                </li>
                <li>
                  <strong>Project Demonstration:</strong> As part of the academic project, this website (including its
                  features and possibly interface screenshots) may be presented to the instructor and peers for grading
                  purposes. Your specific personal data will not be highlighted.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Cookies</h3>
              <p className="text-[var(--color-foreground)]">
                We use minimal, necessary cookies to keep you logged in during a single browser session. You can disable
                cookies in your browser settings, but this may prevent you from logging in and using the site.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">5. Data Security & Retention</h3>
              <ul className="list-disc list-inside text-[var(--color-foreground)] space-y-1 ml-4">
                <li>
                  <strong>Security:</strong> We have implemented basic technical measures (like hashing passwords) to
                  protect your information. However, please be aware that as a student project, we cannot guarantee the
                  same level of security as a commercial service.
                </li>
                <li>
                  <strong>Retention:</strong> Your data will be retained for the duration of the course demonstration
                  and grading period. This project and all user data may be permanently deleted after the course
                  concludes.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">6. Your Rights</h3>
              <p className="text-[var(--color-foreground)]">
                You can access and update your profile information at any time through your account settings. You may
                also delete your account by using the account deletion feature (if implemented).
              </p>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="font-semibold mb-2 text-orange-900">7. Important Disclaimer</h3>
              <p className="text-orange-800 mb-2">
                <strong>Please Read Carefully:</strong>
              </p>
              <ul className="list-disc list-inside text-orange-800 space-y-1 ml-4">
                <li>This is a non-commercial, educational demo project.</li>
                <li>
                  Please <strong>DO NOT</strong> use the same password here that you use for other important accounts
                  (e.g., email, banking).
                </li>
                <li>
                  Please <strong>DO NOT</strong> post or share any real, sensitive personal information on this website.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">8. Changes & Contact</h3>
              <p className="text-[var(--color-foreground)] mb-2">
                We may update this privacy notice as needed. If you have any questions regarding this project, please
                contact:{" "}
                <a href="mailto:21906384@stu.mmu.ac.uk" className="text-[var(--color-primary)] hover:underline">
                  21906384@stu.mmu.ac.uk
                </a>
              </p>
              <p className="text-[var(--color-muted)] text-xs mt-4">Last Updated: November 24, 2025</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
