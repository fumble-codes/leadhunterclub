import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, ForbiddenError, AuthRequiredError } from '@/lib/auth'
import { getApifyKeys, createApifyKey, ExternalApiError } from '@/lib/external-api/client'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const platformCache = new Map<string, { data: any; expiresAt: number }>()

async function getLiveApifyPlatformUsage(token: string) {
  const cached = platformCache.get(token)
  if (cached && Date.now() < cached.expiresAt) return cached.data
  try {
    const res = await fetch('https://api.apify.com/v2/users/me/limits', {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const json = await res.json()
    const used = json?.data?.current?.monthlyUsageUsd ?? null
    const limit = json?.data?.limits?.maxMonthlyUsageUsd ?? 5.0
    const remaining = used != null ? Math.max(0, limit - used) : null
    const cycle = json?.data?.monthlyUsageCycle
    const reset_date = cycle?.endAt ?? null
    const data = {
      used,
      limit,
      remaining,
      exhausted: remaining != null ? remaining <= 0.01 : false,
      reset_date,
    }
    platformCache.set(token, { data, expiresAt: Date.now() + 60000 })
    return data
  } catch {
    return null
  }
}

function parseExhaustedSpend(errorMsg?: string | null) {
  if (!errorMsg) return null
  const match = errorMsg.match(/\$([\d\.]+)\s*\/\s*\$([\d\.]+)/)
  if (match) {
    const used = parseFloat(match[1])
    const limit = parseFloat(match[2])
    return {
      used,
      limit,
      remaining: 0,
      exhausted: true,
    }
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    // Fetch from external VPS API
    let externalKeys: any[] = []
    try {
      const result = await getApifyKeys()
      externalKeys = result.data || []
    } catch (extErr: any) {
      console.warn('[Admin Apify Keys] Failed to fetch external keys, using local DB:', extErr.message)
    }

    // Fetch from database
    const dbKeys = await db.apifyKey.findMany({
      where: { is_deleted: false },
      orderBy: { created_at: 'desc' },
    })

    const extByKey = new Map(externalKeys.map((k) => [k.key, k]))
    const seenKeys = new Set<string>()

    // Fetch or parse platform balance for each key
    const platformUsageResults = await Promise.all(
      dbKeys.map(async (dbKey) => {
        const ext = extByKey.get(dbKey.key)
        let platformUsage = ext?.platform_usage || null

        if (!platformUsage) {
          platformUsage = await getLiveApifyPlatformUsage(dbKey.key)
          if (!platformUsage) {
            const parsed = parseExhaustedSpend(dbKey.error_message || ext?.error_message)
            if (parsed) {
              platformUsage = parsed
            }
          }
        }
        return { key: dbKey.key, platformUsage }
      })
    )
    const platformUsageMap = new Map(platformUsageResults.map((r) => [r.key, r.platformUsage]))

    const merged: any[] = []

    for (const dbKey of dbKeys) {
      seenKeys.add(dbKey.key)
      const ext = extByKey.get(dbKey.key)
      const platformUsage = platformUsageMap.get(dbKey.key) || ext?.platform_usage || null

      const isSpendExhausted = Boolean(
        (platformUsage && typeof platformUsage.remaining === 'number' && platformUsage.remaining <= 0.01) ||
        (platformUsage && typeof platformUsage.used === 'number' && typeof platformUsage.limit === 'number' && platformUsage.used >= platformUsage.limit) ||
        dbKey.error_message?.toLowerCase().includes('spend exhausted') ||
        ext?.error_message?.toLowerCase().includes('spend exhausted')
      )

      // Auto-exhaust strictly if balance runs out
      if (isSpendExhausted && dbKey.is_active) {
        db.apifyKey.update({
          where: { id: dbKey.id },
          data: {
            is_active: false,
            error_message: platformUsage?.used
              ? `Apify spend exhausted ($${platformUsage.used.toFixed(2)} / $${(platformUsage.limit ?? 5).toFixed(2)})`
              : 'Apify spend exhausted ($5.00 / $5.00)',
          },
        }).catch(() => {})
      }

      // Auto-reactivate if renewed (has balance > 0.05 and currently inactive)
      if (!isSpendExhausted && !dbKey.is_active && platformUsage && platformUsage.remaining > 0.05) {
        db.apifyKey.update({
          where: { id: dbKey.id },
          data: {
            is_active: true,
            error_message: null,
          },
        }).catch(() => {})
      }

      merged.push({
        _id: dbKey.id,
        id: dbKey.id,
        key: dbKey.key,
        label: dbKey.label || ext?.label || null,
        is_active: dbKey.is_active && !isSpendExhausted,
        is_exhausted: isSpendExhausted,
        error_message: dbKey.error_message || ext?.error_message || null,
        comments_used: ext?.comments_used ?? dbKey.comments_used,
        comments_limit: ext?.comments_limit ?? dbKey.comments_limit ?? 5000,
        comments_remaining: isSpendExhausted ? 0 : Math.max(0, 5000 - dbKey.comments_used),
        assigned_worker: ext?.assigned_worker || null,
        usage: ext?.usage || null,
        platform_usage: platformUsage,
        created_at: dbKey.created_at,
      })
    }

    for (const ext of externalKeys) {
      if (!seenKeys.has(ext.key)) {
        merged.push({
          ...ext,
          _id: ext.id,
          error_message: ext.error_message || null,
        })
      }
    }

    return NextResponse.json({
      success: true,
      count: merged.length,
      data: merged,
    })
  } catch (error: unknown) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    if (error instanceof AuthRequiredError) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
    }
    const msg = error instanceof Error ? error.message : 'Failed to fetch Apify keys'
    return NextResponse.json({ code: 'ERROR', message: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json()
    const rawKey = body?.key?.trim()
    if (!rawKey) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'API key is required' }, { status: 400 })
    }

    const label = body.label?.trim() || null

    // 0. Live verification against Apify API before saving
    let isValid = true
    let apifyError: string | null = null
    try {
      const apifyRes = await fetch('https://api.apify.com/v2/users/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${rawKey}`,
        },
      })
      if (!apifyRes.ok) {
        const errJson = await apifyRes.json().catch(() => ({}))
        apifyError = errJson?.error?.message || errJson?.message || `HTTP ${apifyRes.status}`
        isValid = false
      }
    } catch (networkErr: any) {
      console.warn('[Admin Apify Keys] Apify live validation network error:', networkErr)
      apifyError = networkErr?.message || 'Network error verifying key'
      isValid = false
    }

    // 1. Create on external API (VPS backend)
    try {
      await createApifyKey({ key: rawKey, label })
    } catch (extErr: any) {
      console.warn('[Admin Apify Keys] External API notice:', extErr.message)
    }

    // 2. Save to database (persists both valid and problematic tokens)
    const month = new Date().toISOString().slice(0, 7)
    const savedKey = await db.apifyKey.upsert({
      where: { key: rawKey },
      create: {
        key: rawKey,
        label,
        usage_month: month,
        comments_limit: 2500,
        is_active: isValid,
        is_deleted: false,
        error_message: isValid ? null : apifyError,
      },
      update: {
        is_active: isValid,
        is_deleted: false,
        label: label || undefined,
        error_message: isValid ? null : apifyError,
      },
    })

    return NextResponse.json({
      success: true,
      data: { ...savedKey, _id: savedKey.id },
      flagged: !isValid,
      message: isValid
        ? 'Apify key added and verified successfully'
        : `Token added with warning: ${apifyError}`,
    }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
    }
    if (error instanceof AuthRequiredError) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
    }
    if (error instanceof ExternalApiError) {
      return NextResponse.json(
        { code: 'EXTERNAL_ERROR', message: error.externalMessage || error.message },
        { status: error.status || 400 },
      )
    }
    const msg = error instanceof Error ? error.message : 'Failed to save Apify key'
    return NextResponse.json({ code: 'ERROR', message: msg }, { status: 500 })
  }
}