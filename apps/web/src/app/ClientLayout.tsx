'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import AppSidebar from '@/components/layout/AppSidebar'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isAppRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/leads') ||
    pathname.startsWith('/outreach') ||
    pathname.startsWith('/saved') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/settings')

  const isProtectedRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/leads') ||
    pathname.startsWith('/outreach') ||
    pathname.startsWith('/saved') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/settings')

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

  return (
    <>
      {!isAppRoute && <Navbar />}
      {isAppRoute ? (
        <div className="flex h-screen bg-bg-main overflow-hidden font-sans">
          <AppSidebar />
          {children}
        </div>
      ) : (
        children
      )}
    </>
  )
}
