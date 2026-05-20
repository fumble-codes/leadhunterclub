'use client'

import { usePathname } from 'next/navigation'
import { Space_Grotesk as SpaceGrotesk, Inter } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import Navbar from '@/components/layout/Navbar'
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
                    pathname.startsWith('/sneak-peek')

  return (
    <html lang="en" className="dark" style={{ backgroundColor: '#0F1115' }}>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${spaceGrotesk.variable} ${inter.variable} font-sans antialiased bg-[#0F1115] text-white`}
      >
        {!isAppRoute && <Navbar />}
        {children}
      </body>
    </html>
  )
}
