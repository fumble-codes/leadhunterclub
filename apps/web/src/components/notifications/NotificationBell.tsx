'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  BellIcon,
  CheckIcon,
  MegaphoneIcon,
  SignalIcon,
  SparklesIcon,
  UserGroupIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import type { AppLead } from '@/types/lead'
import { getFirebaseToken } from '@/lib/firebase'

type NotificationKind = 'lead' | 'community' | 'credits' | 'announcement'

interface FeedNotification {
  id: string
  kind: NotificationKind
  title: string
  body?: string
  href?: string
  meta?: string
  createdAt?: number
}

interface NotificationBellProps {
  leads?: AppLead[]
}

const STORAGE_KEY = 'notification_read_ids_v1'
const DAY_MS = 24 * 60 * 60 * 1000

const KIND_STYLES: Record<
  NotificationKind,
  { icon: typeof BellIcon; tile: string; iconColor: string; label: string }
> = {
  lead: {
    icon: SignalIcon,
    tile: 'bg-accent-cyan/10 border-accent-cyan/20',
    iconColor: 'text-accent-cyan',
    label: 'Lead signal',
  },
  community: {
    icon: UserGroupIcon,
    tile: 'bg-accent-mint/10 border-accent-mint/20',
    iconColor: 'text-accent-mint',
    label: 'Community',
  },
  credits: {
    icon: SparklesIcon,
    tile: 'bg-accent-purple/10 border-accent-purple/20',
    iconColor: 'text-accent-purple',
    label: 'Account',
  },
  announcement: {
    icon: MegaphoneIcon,
    tile: 'bg-white/[0.05] border-white/[0.1]',
    iconColor: 'text-text-primary',
    label: 'Announcement',
  },
}

const NUDGE_COPY: Record<
  string,
  { title: string; body: string; href: string }
> = {
  'out-of-credits': {
    title: "You're out of credits",
    body: 'Unlocks are paused until you top up or renew.',
    href: '/refill',
  },
  'low-credits': {
    title: 'Credits running low',
    body: 'Top up so you can keep unlocking contacts without a gap.',
    href: '/refill',
  },
  renewal: {
    title: 'Your plan renews soon',
    body: 'Renew to keep credits flowing without interruption.',
    href: '/pricing',
  },
  upgrade: {
    title: 'Unlock more pipeline',
    body: 'Paid plans get more credits, faster reveals and priority signals.',
    href: '/pricing',
  },
}

function readStoredIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}

function persistIds(ids: Set<string>) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)))
  } catch {
    // storage unavailable — read state simply won't persist
  }
}

function relativeTime(ts?: number): string | null {
  if (!ts || !Number.isFinite(ts)) return null
  const diff = Date.now() - ts
  if (diff < 60_000) return 'Just now'
  if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < DAY_MS) return `${Math.floor(diff / (60 * 60_000))}h ago`
  if (diff < 7 * DAY_MS) return `${Math.floor(diff / DAY_MS)}d ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function NotificationBell({ leads = [] }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const [readIds, setReadIds] = useState<Set<string>>(() => readStoredIds())
  const [remote, setRemote] = useState<FeedNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [feedFailed, setFeedFailed] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const lastFetchRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  // Fetch account + community notifications (read-only endpoints, no mutations)
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const results: FeedNotification[] = []
      try {
        const token = await getFirebaseToken()
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}

        try {
          const res = await fetch('/api/notifications/popup-status', {
            headers,
            cache: 'no-store',
          })
          if (res.ok) {
            const data = await res.json()
            const variant = typeof data?.variant === 'string' ? data.variant : ''
            const copy = NUDGE_COPY[variant]
            if (data?.show && copy) {
              results.push({
                id: `credits-${variant}`,
                kind: 'credits',
                title: copy.title,
                body:
                  variant === 'low-credits' && typeof data.creditsRemaining === 'number'
                    ? `${data.creditsRemaining} left on ${String(data.plan || 'your plan')}. Top up before you run dry.`
                    : copy.body,
                href: copy.href,
                createdAt: Date.now(),
              })
            }
          }
        } catch {
          // endpoint unavailable — skip silently
        }

        try {
          const res = await fetch('/api/community/unread-popup', {
            headers,
            cache: 'no-store',
          })
          if (res.ok) {
            const data = await res.json()
            const post = data?.post
            if (data?.show && post?.id) {
              results.push({
                id: `community-${post.id}`,
                kind: 'community',
                title: String(post.title || 'New win in the Community Hub'),
                body: post.dealSize
                  ? `${String(post.dealSize)} closed${post.clientNiche ? ` · ${String(post.clientNiche)}` : ''}`
                  : `${String(post.authorName || 'A member')} shared a win`,
                href: '/community',
                createdAt: post.createdAt ? new Date(post.createdAt).getTime() : Date.now(),
              })
            }
          }
        } catch {
          // endpoint unavailable — skip silently
        }

        // Server-derived feed: fresh admin lead drops + platform announcements
        let feedOk = false
        try {
          const res = await fetch('/api/notifications/feed', {
            headers,
            cache: 'no-store',
          })
          if (res.ok) {
            const data = await res.json()
            feedOk = true
            const rows: unknown[] = Array.isArray(data?.items) ? data.items : []
            for (const raw of rows) {
              const row = raw as Record<string, unknown>
              if (!row || typeof row.id !== 'string') continue
              const kind =
                row.kind === 'lead' || row.kind === 'announcement' ? row.kind : null
              if (!kind) continue
              results.push({
                id: row.id,
                kind,
                title: String(row.title || '').slice(0, 140),
                body: typeof row.body === 'string' ? row.body : undefined,
                href: typeof row.href === 'string' ? row.href : undefined,
                meta: typeof row.meta === 'string' ? row.meta : undefined,
                createdAt: row.createdAt
                  ? new Date(String(row.createdAt)).getTime()
                  : Date.now(),
              })
            }
          }
        } catch {
          // endpoint unavailable — fall back to the prop-derived lead summary
        } finally {
          if (!cancelled) setFeedFailed(!feedOk)
        }
      } finally {
        if (!cancelled) {
          // The same post can arrive as both a community win and an
          // announcement — keep only the announcement copy.
          const announcementIds = new Set(
            results
              .filter((r) => r.kind === 'announcement' && r.id.startsWith('ann:'))
              .map((r) => r.id.slice(4)),
          )
          setRemote(
            results.filter(
              (r) =>
                !(
                  r.kind === 'community' &&
                  r.id.startsWith('community-') &&
                  announcementIds.has(r.id.slice(9))
                ),
            ),
          )
          lastFetchRef.current = Date.now()
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  // Refresh quietly when the panel is opened against stale data
  useEffect(() => {
    if (!open) return
    if (Date.now() - lastFetchRef.current < 60_000) return
    setRefreshKey((key) => key + 1)
  }, [open])

  // Fallback only: used when /api/notifications/feed is unreachable, so the
  // panel still shows something from the leads already loaded on the page.
  const leadNotifications = useMemo<FeedNotification[]>(() => {
    if (!feedFailed) return []
    const cutoff = Date.now() - DAY_MS
    const fresh = leads
      .map((lead) => ({
        lead,
        ts: new Date(lead.approvedAt || lead.reviewedAt || lead.scrapedAt || lead.timestamp || 0).getTime(),
      }))
      .filter((entry) => Number.isFinite(entry.ts) && entry.ts >= cutoff)
      .sort((a, b) => b.ts - a.ts)

    if (fresh.length === 0) return []

    const newest = fresh[0]
    const niche =
      newest.lead.niches?.[0] || newest.lead.niche || newest.lead.category || 'your feed'
    const companies = fresh
      .slice(0, 3)
      .map((entry) => entry.lead.company)
      .filter(Boolean)
      .join(' · ')

    return [
      {
        id: `lead-${newest.lead.id}`,
        kind: 'lead',
        title: `${fresh.length} fresh ${niche} signal${fresh.length === 1 ? '' : 's'}`,
        body: companies || 'New verified opportunities are ready to review.',
        createdAt: newest.ts,
      },
    ]
  }, [leads, feedFailed])

  const notifications = useMemo(() => {
    return [...leadNotifications, ...remote].sort(
      (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
    )
  }, [leadNotifications, remote])

  const unread = useMemo(
    () => notifications.filter((n) => !readIds.has(n.id)),
    [notifications, readIds],
  )

  const visible = tab === 'unread' ? unread : notifications
  const unreadCount = unread.length

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      persistIds(next)
      return next
    })
  }, [])

  const markAllRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev)
      notifications.forEach((n) => next.add(n.id))
      persistIds(next)
      return next
    })
  }, [notifications])

  // Dismiss on outside click + Escape
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount)

  return (
    <div ref={containerRef} className="static shrink-0 md:relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={
          unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`relative z-[86] flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl bg-code-bg/80 backdrop-blur-xl border shadow-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/60 focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg ${
          open
            ? 'border-accent-purple/30 text-text-primary bg-white/[0.06]'
            : 'border-white/[0.08] text-text-secondary hover:bg-white/5 hover:border-white/15 hover:text-text-primary'
        }`}
      >
        <BellIcon className="w-[18px] h-[18px]" strokeWidth={1.6} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-accent-purple text-text-on-accent text-[9px] font-bold leading-[17px] text-center tabular-nums shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            {badgeLabel}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="scrim"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[84] bg-black/45 backdrop-blur-[2px] md:hidden"
          />
        )}
        {open && (
          <motion.div
            key="panel"
            role="dialog"
            aria-label="Notifications"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.7 }}
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 top-[calc(100%+10px)] z-[85] w-[min(384px,calc(100vw-2rem))] overflow-hidden rounded-[24px] bg-[#0b0b0e]/[0.97] backdrop-blur-2xl backdrop-saturate-150 border border-white/[0.11] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_32px_80px_-20px_rgba(0,0,0,0.95),0_2px_12px_rgba(0,0,0,0.5)]"
          >
            {/* ambient depth: top sheen + soft corner glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/[0.05] via-white/[0.012] to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 right-0 h-40 w-40 rounded-full bg-accent-purple/[0.06] blur-3xl"
            />
            <div aria-hidden className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-accent-cyan/[0.05] blur-3xl" />

            <div className="relative px-4 pt-3.5 pb-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-[13.5px] font-semibold tracking-tight text-text-primary">
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-px rounded-full bg-accent-purple/[0.12] border border-accent-purple/20 text-[10px] font-semibold text-accent-purple tabular-nums">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  className="flex items-center gap-1 text-[11px] font-medium text-text-secondary hover:text-text-primary disabled:opacity-0 disabled:pointer-events-none transition-all px-2 py-1 -mr-1 rounded-lg hover:bg-white/[0.05]"
                >
                  <CheckIcon className="w-3 h-3" strokeWidth={2} />
                  Mark all read
                </button>
              </div>

              {notifications.length > 0 && (
                <div className="mt-2.5 flex w-fit items-center gap-0.5 p-[3px] rounded-[10px] bg-white/[0.035] border border-white/[0.05]">
                  {(['all', 'unread'] as const).map((value) => {
                    const active = tab === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setTab(value)}
                        className={`relative h-[26px] px-3 rounded-[7px] text-[10.5px] font-medium capitalize transition-colors ${
                          active ? 'text-accent-purple' : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="notification-tab-pill"
                            transition={{ type: 'spring', stiffness: 520, damping: 42 }}
                            className="absolute inset-0 rounded-[7px] bg-accent-purple/[0.14] border border-accent-purple/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.35)]"
                          />
                        )}
                        <span className="relative">
                          {value === 'unread' && unreadCount > 0 ? `Unread · ${unreadCount}` : value}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="relative mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

            <div className="relative max-h-[min(420px,60vh)] overflow-y-auto overscroll-contain scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {loading ? (
                <div className="px-4 py-3 space-y-2" aria-hidden>
                  {[0, 1].map((i) => (
                    <div key={i} className="flex items-start gap-3 py-2.5">
                      <div className="w-9 h-9 rounded-[10px] bg-white/[0.05] animate-pulse" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-2.5 w-3/5 rounded bg-white/[0.06] animate-pulse" />
                        <div className="h-2 w-4/5 rounded bg-white/[0.04] animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-9 text-center">
                  <div className="relative mb-3 flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/[0.045] border border-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_6px_18px_-8px_rgba(0,0,0,0.7)]">
                    <BellIcon className="w-[18px] h-[18px] text-text-secondary/70" strokeWidth={1.5} />
                  </div>
                  <p className="text-[12.5px] font-semibold text-text-primary">
                    {tab === 'unread' ? 'Nothing unread' : "You're all caught up"}
                  </p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-text-secondary/65 max-w-[236px]">
                    {tab === 'unread'
                      ? 'New signals and account updates will show up here.'
                      : 'Fresh signals, announcements and account updates land here.'}
                  </p>
                </div>
              ) : (
                <ul className="p-1.5">
                  {visible.map((item, index) => {
                    const isUnread = !readIds.has(item.id)
                    const style = KIND_STYLES[item.kind]
                    const Icon = style.icon
                    const time = relativeTime(item.createdAt)
                    const content = (
                      <>
                        <span
                          className={`shrink-0 mt-0.5 w-9 h-9 rounded-[10px] border flex items-center justify-center ${style.tile}`}
                        >
                          <Icon className={`w-[15px] h-[15px] ${style.iconColor}`} strokeWidth={1.7} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start gap-2">
                            <span
                              className={`text-[12.5px] leading-snug line-clamp-2 ${
                                isUnread
                                  ? 'font-semibold text-text-primary'
                                  : 'font-medium text-text-primary/85'
                              }`}
                            >
                              {item.title}
                            </span>
                            {isUnread && (
                              <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-purple" />
                            )}
                          </span>
                          {item.body && (
                            <span className="mt-0.5 block text-[11.5px] leading-relaxed text-text-secondary/75 line-clamp-2">
                              {item.body}
                            </span>
                          )}
                          <span className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-text-secondary/55">
                            <span className="uppercase tracking-[0.08em]">{style.label}</span>
                            {item.meta && (
                              <>
                                <span className="w-0.5 h-0.5 rounded-full bg-current opacity-60" />
                                <span className="truncate max-w-[130px]">{item.meta}</span>
                              </>
                            )}
                            {time && (
                              <>
                                <span className="w-0.5 h-0.5 rounded-full bg-current opacity-60" />
                                <span>{time}</span>
                              </>
                            )}
                          </span>
                        </span>
                        {item.href && (
                          <ArrowRightIcon
                            className="shrink-0 mt-1.5 w-3.5 h-3.5 text-text-secondary/40"
                            strokeWidth={1.8}
                          />
                        )}
                        {!item.href && <span className="shrink-0 w-3.5" aria-hidden />}
                      </>
                    )

                    const itemClass = `flex w-full items-start gap-3 rounded-[13px] px-2.5 py-2.5 text-left transition-colors duration-150 hover:bg-white/[0.05] active:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-purple/50`

                    return (
                      <motion.li
                        key={item.id}
                        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.22,
                          delay: reduceMotion ? 0 : Math.min(index, 5) * 0.03,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        {item.href ? (
                          <a
                            href={item.href}
                            className={itemClass}
                            onClick={() => {
                              markRead(item.id)
                              setOpen(false)
                            }}
                          >
                            {content}
                          </a>
                        ) : (
                          <button
                            type="button"
                            className={itemClass}
                            onClick={() => markRead(item.id)}
                          >
                            {content}
                          </button>
                        )}
                      </motion.li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div className="relative flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06] bg-white/[0.02]">
              <span className="flex items-center gap-1.5 text-[10px] text-text-secondary/55">
                <span className="h-1 w-1 rounded-full bg-accent-mint/80" />
                Signals refresh automatically
              </span>
              <a
                href="/community"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-1 text-[11px] font-medium text-text-secondary hover:text-accent-mint transition-colors"
              >
                Community hub
                <ArrowRightIcon className="h-3 w-3 opacity-50 transition-transform duration-200 group-hover:translate-x-px" strokeWidth={1.8} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
