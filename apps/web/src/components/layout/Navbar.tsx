'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Leads', href: '/leads' },
  { name: 'Outreach', href: '/outreach' },
  { name: 'Analytics', href: '/analytics' },
]

export default function Navbar() {
  const pathname = usePathname()
  const isLanding = pathname === '/'

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-container px-4">
      <div className="glass-panel py-3 px-6 rounded-full flex items-center justify-between border-subtle backdrop-blur-xl bg-surface/80">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight text-accent-mint hover:opacity-80 transition-opacity">
            LHC
          </Link>
          {!isLanding && (
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-text-primary ${
                    pathname === link.href ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-4 py-2"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="bg-accent-mint text-bg-main text-sm font-bold px-6 py-2 rounded-full hover:shadow-[0_0_20px_-5px_rgba(184,243,107,0.5)] transition-all active:scale-95"
          >
            Start Hunting
          </Link>
        </div>
      </div>
    </nav>
  )
}
