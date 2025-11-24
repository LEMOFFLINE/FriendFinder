import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility functions

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function calculateMatchScore(userInterests: string[], otherInterests: string[]): number {
  const commonInterests = userInterests.filter((i) => otherInterests.includes(i))
  const totalInterests = new Set([...userInterests, ...otherInterests]).size
  return totalInterests > 0 ? Math.round((commonInterests.length / totalInterests) * 100) : 0
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
