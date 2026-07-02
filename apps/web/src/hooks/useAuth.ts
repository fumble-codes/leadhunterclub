import { useState, useEffect, useCallback } from 'react'
import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/nextjs'
import type { User } from '@/lib/types'

export function useAuth() {
  const { isLoaded: isClerkLoaded, isSignedIn, signOut } = useClerkAuth()
  const { user: clerkUser } = useClerkUser()

  const [dbUser, setDbUser] = useState<User | null>(null)
  const [dbLoading, setDbLoading] = useState(true)

  useEffect(() => {
    if (!isClerkLoaded) return

    if (!isSignedIn) {
      setDbUser(null)
      setDbLoading(false)
      return
    }

    // Build a fallback user from Clerk data immediately so the UI never blocks
    const fallbackUser: User = {
      id: clerkUser?.id || '',
      email: clerkUser?.emailAddresses?.[0]?.emailAddress || '',
      name: clerkUser?.fullName || clerkUser?.firstName || 'User',
      role: 'user',
      credits: 200,
      provider: 'email',
      emailVerified: new Date().toISOString(),
      plan: 'FREE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Set fallback immediately so the UI can render right away
    setDbUser(fallbackUser)
    setDbLoading(false)

    // Then try to fetch the real DB user in the background (for credits, etc.)
    let isMounted = true

    const fetchDbUser = () => {
      fetch('/api/auth/me')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch user profile')
          return res.json()
        })
        .then((json) => {
          if (isMounted && json.data) {
            setDbUser(json.data)
          }
        })
        .catch((err) => {
          console.warn('Could not sync DB user (using Clerk fallback):', err.message)
        })
    }

    fetchDbUser()

    if (typeof window !== 'undefined') {
      window.addEventListener('user-refetch', fetchDbUser)
    }

    return () => {
      isMounted = false
      if (typeof window !== 'undefined') {
        window.removeEventListener('user-refetch', fetchDbUser)
      }
    }
  }, [isClerkLoaded, isSignedIn, clerkUser])

  const handleLogout = useCallback(() => {
    signOut({ redirectUrl: '/login' })
  }, [signOut])

  return {
    user: dbUser,
    loading: !isClerkLoaded,
    isAuthenticated: !!isSignedIn,
    login: async () => {}, // Handled by Clerk components
    register: async () => {}, // Handled by Clerk components
    logout: handleLogout,
  }
}
export type AuthContextValue = ReturnType<typeof useAuth>
