import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Enable static export for better PWA support
  output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
