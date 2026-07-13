'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import AppSidebar from '@/components/layout/AppSidebar'
import { useAuth } from '@/hooks/useAuth'
import { ToastProvider } from '@/components/ui/Toast'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, error } = useAuth()

  const appRoutes = ['/dashboard', '/leads', '/outreach', '/saved', '/analytics', '/settings']
  const adminRoutes = ['/admin']
  const authRoutes = ['/login', '/register']
  const onboardingRoutes = ['/onboarding', '/pending-approval', '/admin-register']
  const isPublicRoute = pathname === '/' || authRoutes.some((r) => pathname.startsWith(r)) || pathname.startsWith('/sneak-peek')
  const isOnboardingRoute = onboardingRoutes.some((r) => pathname.startsWith(r))
  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r))

  const isAppRoute = appRoutes.some((r) => pathname.startsWith(r))
  const isProtectedRoute = appRoutes.some((r) => pathname.startsWith(r))

  useEffect(() => {
    if (loading || error || !user) return

    if (isPublicRoute || isOnboardingRoute || isAdminRoute) {
      if (pathname === '/' && user) {
        if (user.status === 'ACTIVE') {
          router.push('/dashboard')
        } else if (user.status === 'PENDING') {
          router.push(user.hasCompletedOnboarding ? '/pending-approval' : '/onboarding')
        } else if (user.status === 'REJECTED' || user.status === 'SUSPENDED') {
          router.push('/pending-approval')
        }
      }
      return
    }

    if (user.status === 'PENDING' && !user.hasCompletedOnboarding) {
      router.push('/onboarding')
    } else if (user.status === 'PENDING' && user.hasCompletedOnboarding) {
      router.push('/pending-approval')
    } else if (user.status === 'REJECTED' || user.status === 'SUSPENDED') {
      router.push('/pending-approval')
    }
  }, [user, loading, error, pathname, router, isPublicRoute, isOnboardingRoute])

  useEffect(() => {
    const isLanding = !isAppRoute
    if (!isLanding) return

    let lenisInstance: any = null

    import('lenis').then(({ default: Lenis }) => {
      lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
      })

      function raf(time: number) {
        lenisInstance?.raf(time)
        requestAnimationFrame(raf)
      }

      requestAnimationFrame(raf)
    })

    return () => {
      if (lenisInstance) {
        lenisInstance.destroy()
      }
    }
  }, [isAppRoute])

  if (loading && isProtectedRoute && !isAdminRoute) {
    return (
      <div className="flex h-screen bg-bg-main items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    )
  }

  return (
    <ToastProvider>
      {!isAppRoute && !isAdminRoute && <Navbar />}
      {isAppRoute ? (
        <div className="flex h-screen bg-bg-main overflow-hidden font-sans">
          <AppSidebar />
          {children}
        </div>
      ) : (
        children
      )}
    </ToastProvider>
  )
}
