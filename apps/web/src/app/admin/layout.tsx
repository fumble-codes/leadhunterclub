'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState, useCallback } from 'react'
import { getFirebaseToken } from '@/lib/firebase'
import { CustomLoader } from '@/components/ui/CustomLoader'
import { ApifyExhaustionModal } from '@/components/admin/ApifyExhaustionModal'
import { ApifyExhaustionBanner } from '@/components/admin/ApifyExhaustionBanner'

import {
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowLeftOnRectangleIcon,
  HashtagIcon,
  EyeIcon,
  KeyIcon,
  ShieldCheckIcon,
  SparklesIcon,
  LifebuoyIcon,
  EnvelopeIcon,
  TrophyIcon,
  MegaphoneIcon,
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/solid'

const adminNav = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Review', href: '/admin/review', icon: ClockIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Contacts', href: '/admin/contacts', icon: UserGroupIcon },
  { name: 'Credits', href: '/admin/credits', icon: CurrencyDollarIcon },
  { name: 'Payments & Billing', href: '/admin/payments', icon: BanknotesIcon },
  { name: 'Plans & Pricing', href: '/admin/plans', icon: CreditCardIcon },
  { name: 'Keywords', href: '/admin/keywords', icon: HashtagIcon },
  { name: 'Watchlist', href: '/admin/targets', icon: EyeIcon },
  { name: 'Leads', href: '/admin/leads', icon: SparklesIcon },
  { name: 'Tokens', href: '/admin/tokens', icon: KeyIcon },
  { name: 'RBAC', href: '/admin/rbac', icon: ShieldCheckIcon },
  { name: 'Support', href: '/admin/support', icon: LifebuoyIcon },
  { name: 'Broadcast', href: '/admin/broadcast', icon: MegaphoneIcon },
  { name: 'Newsletter', href: '/admin/newsletter', icon: EnvelopeIcon },
  { name: 'Rewards', href: '/admin/rewards', icon: TrophyIcon },
  { name: 'Community Hub', href: '/admin/community', icon: ChatBubbleBottomCenterTextIcon },
  { name: 'Reviews', href: '/admin/reviews', icon: ChatBubbleLeftRightIcon },
  { name: 'Tasks', href: '/admin/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Products', href: '/admin/products', icon: CubeIcon },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout, firebaseUser } = useAuth()

  // Mobile sidebar drawer state (desktop keeps the permanent sidebar)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close the drawer on navigation and on Escape
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])
  useEffect(() => {
    if (!sidebarOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [sidebarOpen])

  const [apifyStatus, setApifyStatus] = useState<{
    exhausted: boolean
    totalKeys: number
    activeKeys: number
    totalRemaining: number
    totalLimit: number
    reason: string
  } | null>(null)

  const checkApifyStatus = useCallback(async () => {
    try {
      const token = (await firebaseUser?.getIdToken()) || (await getFirebaseToken())
      if (!token) return

      const res = await fetch('/api/admin/apify-keys/status', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const json = await res.json()

      if (json.success) {
        setApifyStatus(json)
        if (json.exhausted) {
          const dismissed =
            typeof window !== 'undefined'
              ? sessionStorage.getItem('apify_exhausted_modal_dismissed')
              : null
          if (!dismissed) {
            window.dispatchEvent(
              new CustomEvent('show-apify-exhaustion', {
                detail: {
                  title: 'Apify Scraper Tokens Exhausted',
                  message:
                    json.reason ||
                    'Automatic lead scraping has stopped because all configured Apify tokens have reached their monthly quota.',
                  activeKeys: json.activeKeys,
                  totalKeys: json.totalKeys,
                  totalRemaining: json.totalRemaining,
                  totalLimit: json.totalLimit,
                },
              }),
            )
          }
        }
      }
    } catch (e) {
      console.warn('[Admin Layout] Failed to check Apify token status:', e)
    }
  }, [firebaseUser])

  useEffect(() => {
    if (loading || !user) return
    if (user.status === 'SUSPENDED' || user.status === 'REJECTED') {
      router.push('/pending-approval')
      return
    }
    if (user.role !== 'admin') {
      router.push('/admin-register')
      return
    }

    checkApifyStatus()

    const handleKeyUpdate = () => {
      checkApifyStatus()
    }
    window.addEventListener('apify-keys-updated', handleKeyUpdate)
    return () => window.removeEventListener('apify-keys-updated', handleKeyUpdate)
  }, [user, loading, router, checkApifyStatus])

  if (loading) {
    return <CustomLoader page="admin" fullscreen />
  }

  if (!user || user.role !== 'admin' || user.status === 'SUSPENDED' || user.status === 'REJECTED')
    return null

  return (
    <div className="min-h-screen bg-bg-main flex flex-col">
      {apifyStatus?.exhausted && (
        <ApifyExhaustionBanner
          activeKeys={apifyStatus.activeKeys}
          totalKeys={apifyStatus.totalKeys}
          totalRemaining={apifyStatus.totalRemaining}
        />
      )}

      {/* Mobile top bar — the permanent sidebar is hidden below lg */}
      <div className="lg:hidden shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-surface/80 backdrop-blur-xl sticky top-0 z-30">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open admin menu"
          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-text-primary active:scale-95 transition-transform"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
        <Link href="/admin" className="text-base font-bold text-text-primary tracking-tight truncate">
          Admin Panel
        </Link>
      </div>

      <div className="flex-1 flex min-h-0 relative">
        {/* Backdrop (mobile only) */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm cursor-default"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-[60] w-[280px] max-w-[85vw] border-r border-white/[0.06] bg-[#0b0b0e] p-5 flex flex-col shadow-2xl transition-transform duration-300 ease-out
            lg:static lg:z-auto lg:translate-x-0 lg:w-64 lg:shrink-0 lg:bg-surface/30 lg:shadow-none lg:p-6
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center justify-between gap-2 mb-6 lg:mb-8">
            <Link href="/admin" className="text-lg font-bold text-text-primary tracking-tight">
              Admin Panel
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close admin menu"
              className="lg:hidden w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.06]"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1 flex-1 overflow-y-auto scrollbar-hide overscroll-contain">
            {adminNav.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-accent-mint/10 text-accent-mint border border-accent-mint/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 mt-4"
          >
            <ArrowLeftOnRectangleIcon className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-5 lg:p-8">{children}</main>
      </div>

      <ApifyExhaustionModal />
    </div>
  )
}
