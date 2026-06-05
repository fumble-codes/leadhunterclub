'use client'

import { usePathname } from 'next/navigation'
import { Space_Grotesk as SpaceGrotesk, Inter } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'
import { RouteGuard } from '@/components/auth/RouteGuard'
import './globals.css'

const spaceGrotesk = SpaceGrotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600'],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Routes that should NOT show the landing page Navbar
  const isAppRoute = pathname.startsWith('/dashboard') || 
                    pathname.startsWith('/leads') || 
                    pathname.startsWith('/outreach') || 
                    pathname.startsWith('/saved') || 
                    pathname.startsWith('/analytics') || 
                    pathname.startsWith('/settings') ||
                    pathname.startsWith('/sneak-peek') ||
                    pathname.startsWith('/login') ||
                    pathname.startsWith('/register')

  // Routes that require authentication
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/leads') ||
                          pathname.startsWith('/outreach') ||
                          pathname.startsWith('/saved') ||
                          pathname.startsWith('/analytics') ||
                          pathname.startsWith('/settings')

  useEffect(() => {
    // Only use smooth scroll on the landing page, not app routes
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
    <html lang="en" className="dark" style={{ backgroundColor: '#080808' }}>
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${spaceGrotesk.variable} ${inter.variable} font-sans antialiased bg-[#080808] text-white`}
      >
        <AuthProvider>
          {!isAppRoute && <Navbar />}
          {isProtectedRoute ? <RouteGuard>{children}</RouteGuard> : children}
        </AuthProvider>
      </body>
    </html>
  )
}
