import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { oracleDb } from '@/lib/oracle-db'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/notifications/feed
 *
 * Read-only, derived notification feed for the in-app bell:
 *   1. Freshly approved leads (admin lead drops) — derived from LeadPost so it
 *      works no matter which path flipped review_status to 'approved'.
 *   2. Platform announcements — CommunityPost category ANNOUNCEMENT.
 *   3. Latest email broadcast — surfaced as a platform announcement.
 *
 * No writes, no schema change: every row already exists, this only reads it.
 */

const DAY_MS = 24 * 60 * 60 * 1000
const WINDOW_DAYS = 7
const MAX_LEADS = 10
const MAX_ANNOUNCEMENTS = 6

interface FeedItem {
  id: string
  kind: 'lead' | 'announcement'
  title: string
  body?: string
  href?: string
  meta?: string
  createdAt: string
}

function snippet(text: string | null | undefined, max: number): string {
  if (!text) return ''
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  return `${flat.slice(0, max - 1).trimEnd()}…`
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser?.uid) {
      return NextResponse.json({ items: [], authenticated: false })
    }

    // Same eligibility gate as the member popups: approved + active members only.
    const dbUser = await db.user.findUnique({
      where: { id: authUser.uid },
      select: { status: true },
    })
    if (!dbUser || dbUser.status !== 'ACTIVE') {
      return NextResponse.json({ items: [], authenticated: true, eligible: false })
    }

    const since = new Date(Date.now() - WINDOW_DAYS * DAY_MS)

    const [leadRows, announcementRows, broadcast] = await Promise.all([
      oracleDb.leadPost.findMany({
        where: {
          is_deleted: false,
          review_status: 'approved',
          intelligence: { not: null },
          source: { not: 'seed' },
          OR: [{ reviewed_at: { gte: since } }, { created_at: { gte: since } }],
        },
        select: {
          post_id: true,
          platform: true,
          url: true,
          content: true,
          title: true,
          niche: true,
          keyword: true,
          reviewed_at: true,
          created_at: true,
        },
        orderBy: [{ reviewed_at: 'desc' }, { created_at: 'desc' }],
        take: MAX_LEADS,
      }),
      db.communityPost.findMany({
        where: {
          category: 'ANNOUNCEMENT',
          status: 'PUBLISHED',
          createdAt: { gte: since },
        },
        select: { id: true, title: true, content: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: MAX_ANNOUNCEMENTS,
      }),
      db.emailLog.findFirst({
        where: { type: 'broadcast', status: 'SENT', sentAt: { gte: since } },
        select: { id: true, subject: true, sentAt: true },
        orderBy: { sentAt: 'desc' },
      }),
    ])

    const items: FeedItem[] = []

    for (const row of leadRows) {
      const ts = row.reviewed_at ?? row.created_at
      const title =
        row.title?.trim() ||
        snippet(row.content, 80) ||
        'New verified signal approved'
      items.push({
        id: `lead:${row.platform}:${row.post_id}`,
        kind: 'lead',
        title,
        body: snippet(row.content, 140) || 'Fresh signal ready to review.',
        href: '/leads',
        meta: row.niche || row.keyword || undefined,
        createdAt: ts.toISOString(),
      })
    }

    for (const row of announcementRows) {
      items.push({
        id: `ann:${row.id}`,
        kind: 'announcement',
        title: row.title,
        body: snippet(row.content, 160) || 'Platform announcement',
        href: '/community',
        createdAt: row.createdAt.toISOString(),
      })
    }

    if (broadcast?.subject) {
      items.push({
        id: `broadcast:${broadcast.id}`,
        kind: 'announcement',
        title: broadcast.subject,
        body: 'Platform announcement sent to members.',
        href: '/community',
        createdAt: broadcast.sentAt.toISOString(),
      })
    }

    items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

    return NextResponse.json(
      { items, generatedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 'private, no-cache, stale-while-revalidate=15' } },
    )
  } catch (error) {
    console.error('[Notifications Feed GET] Error:', error)
    // Fail open with an empty list — the bell keeps its local fallbacks.
    return NextResponse.json({ items: [] }, { status: 200 })
  }
}
