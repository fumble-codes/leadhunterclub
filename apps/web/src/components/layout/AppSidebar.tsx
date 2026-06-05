'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { 
  LayoutDashboard, 
  Rss, 
  Send, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  Coins,
  Bookmark
} from 'lucide-react'

const navItems = [
  { name: 'Lead Feed', href: '/leads', icon: Rss },
  { name: 'Saved Leads', href: '/saved', icon: Bookmark },
  { name: 'Outreach', href: '/outreach', icon: Send },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
]

interface AppSidebarProps {
  activePathOverride?: string
  isDemo?: boolean
  isSneakPeek?: boolean
  onNavItemClick?: (href: string) => void
}

export default function AppSidebar({
  activePathOverride,
  isDemo = false,
  isSneakPeek = false,
  onNavItemClick
}: AppSidebarProps = {}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const routerPathname = usePathname()
  const pathname = activePathOverride || routerPathname
  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '64px' : (isDemo ? '180px' : '240px') }}
      className={isDemo
        ? "h-full bg-[#12151A]/90 border-r border-white/[0.06] flex flex-col z-40 transition-colors rounded-l-[24px] overflow-hidden select-none shrink-0"
        : "h-[calc(100vh-32px)] my-4 ml-4 bg-[#171A20]/70 backdrop-blur-[20px] border border-white/[0.06] shadow-2xl flex flex-col z-40 transition-colors rounded-[24px] overflow-hidden"
      }
    >
      {/* Sidebar Header */}
      <div className="h-24 flex items-center px-6 justify-between">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3"
            >
              <img src="/logo.svg" alt="Lead Hunter Club" className="w-8 h-8 rounded-xl" />
              <span className="font-semibold text-text-primary tracking-tight">Lead Hunter Club</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors active:scale-95"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Items */}
      <div className="flex-1 py-2 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (isSneakPeek && item.name === 'Lead Feed')
          const isBlurred = isSneakPeek && item.name !== 'Lead Feed'
          
          return (
            <Link
              key={item.href}
              href={isDemo || isBlurred ? '#' : item.href}
              onClick={(e) => {
                if (isDemo || isBlurred) {
                  e.preventDefault()
                  if (isDemo && onNavItemClick) {
                    onNavItemClick(item.href)
                  }
                }
              }}
              className={`block relative ${isBlurred ? 'opacity-40 blur-[2px] cursor-not-allowed select-none' : ''}`}
            >
              <motion.div
                whileHover={{ x: isActive || isBlurred ? 0 : 4 }}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-300 relative z-10 ${
                  isActive 
                    ? 'text-accent-mint' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
                }`}
              >
                <item.icon size={18} className="stroke-[1.5]" />
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Active Pill Highlight */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-accent-mint/10 border border-accent-mint/20 rounded-xl shadow-[inset_0_0_12px_rgba(184,243,107,0.1)] z-0"
                />
              )}
            </Link>
          )
        })}
      </div>

      {/* Token Status */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-6 mb-6"
          >
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins size={14} className="text-accent-mint" />
                  <span className="text-[10px] font-bold text-text-primary uppercase tracking-widest">Credits</span>
                </div>
                <span className="text-[10px] font-bold text-text-secondary">{user?.credits ?? 0} / 1k</span>
              </div>
              
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  className="h-full bg-accent-mint shadow-[0_0_10px_rgba(184,243,107,0.5)]" 
                />
              </div>

              <button className="text-[9px] font-bold text-accent-mint uppercase tracking-[0.2em] hover:opacity-80 transition-opacity">
                Refill Pipeline →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Footer */}
      <div className="p-4 space-y-2">
        <Link
          href={isDemo || isSneakPeek ? '#' : '/settings'}
          onClick={(e) => {
            if (isDemo || isSneakPeek) {
              e.preventDefault()
              if (isDemo && onNavItemClick) {
                onNavItemClick('/settings')
              }
            }
          }}
          className={`block relative ${isSneakPeek ? 'opacity-40 blur-[2px] cursor-not-allowed select-none' : ''}`}
        >
          <motion.div
            whileHover={{ x: (pathname === '/settings' || isSneakPeek) ? 0 : 4 }}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-300 relative z-10 ${
              pathname === '/settings' 
                ? 'text-accent-mint' 
                : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
            }`}
          >
            <Settings size={18} className="stroke-[1.5]" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
          {pathname === '/settings' && !isSneakPeek && (
            <motion.div
              layoutId="sidebar-active"
              className="absolute inset-0 bg-accent-mint/10 border border-accent-mint/20 rounded-xl shadow-[inset_0_0_12px_rgba(184,243,107,0.1)] z-0"
            />
          )}
        </Link>
        <button
          className={`w-full relative ${isSneakPeek ? 'opacity-40 blur-[2px] cursor-not-allowed select-none' : ''}`}
          onClick={(e) => {
            if (isSneakPeek) { e.preventDefault(); return }
            logout()
            router.push('/login')
          }}
        >
          <motion.div
            whileHover={{ x: isSneakPeek ? 0 : 4 }}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors duration-300 relative z-10"
          >
            <LogOut size={18} className="stroke-[1.5]" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </button>
      </div>
    </motion.aside>
  )
}
