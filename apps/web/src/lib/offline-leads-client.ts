/**
 * Client-side orchestration for the saved-leads offline mirror.
 * Pages call these instead of talking to IndexedDB directly.
 */

import type { AppLead } from '@/types/lead'
import { auth, getFirebaseToken } from '@/lib/firebase'
import { mergeSavedLeads, type MergedSavedLeads } from '@/lib/lead-merge'
import {
  addPendingOp,
  getCachedLeads,
  getPendingOps,
  markLeadClean,
  putLocalLeadPatch,
  putServerLeads,
  removeCachedLead,
  removePendingOp,
  setMeta,
  type PendingOpType,
} from '@/lib/saved-leads-cache'

export interface LoadedSavedLeads extends MergedSavedLeads {
  uid: string | null
  usedCache: boolean
  serverReachable: boolean
}

export function currentUid(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return auth.currentUser?.uid ?? null
  } catch {
    return null
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getFirebaseToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

/**
 * Hydrate from the local mirror first, then refresh from the server and merge.
 * If the server is unreachable, returns the cached list (offline mode).
 */
export async function loadSavedLeads(): Promise<LoadedSavedLeads> {
  const uid = currentUid()
  const empty: LoadedSavedLeads = {
    leads: [],
    recoveredIds: new Set(),
    dirtyIds: new Set(),
    uid,
    usedCache: false,
    serverReachable: false,
  }
  if (!uid) return empty

  const [cached, pendingOps] = await Promise.all([getCachedLeads(uid), getPendingOps(uid)])
  const usedCache = cached.length > 0

  let server: AppLead[] | null = null
  try {
    const res = await fetch('/api/leads?saved=true', {
      headers: await authHeaders(),
      credentials: 'same-origin',
    })
    if (res.ok) {
      const json = await res.json()
      if (Array.isArray(json.data)) server = json.data as AppLead[]
    }
  } catch {
    // offline — fall through to cache
  }

  if (!server) {
    const removed = new Set(
      pendingOps.filter((op) => op.type === 'unsave' || op.type === 'remove').map((op) => op.leadId),
    )
    const leads = cached.filter((rec) => !removed.has(rec.leadId)).map((rec) => rec.lead)
    return {
      ...empty,
      leads,
      recoveredIds: new Set(cached.map((rec) => rec.leadId)),
      dirtyIds: new Set(cached.filter((rec) => rec.dirty).map((rec) => rec.leadId)),
      usedCache,
    }
  }

  const merged = mergeSavedLeads(cached, server, pendingOps)
  // Persist the merge: server rows refresh, recovered rows stay untouched.
  await putServerLeads(uid, server)
  await setMeta(uid, 'lastSync', Date.now())
  return { ...merged, uid, usedCache, serverReachable: true }
}

/** Write an optimistic change to the mirror and queue it for the server. */
export async function persistLeadMutation(
  leadId: string,
  leadAfter: AppLead,
  type: PendingOpType,
  payload: Record<string, unknown> = {},
  origin: 'server' | 'local' = 'server',
): Promise<string | null> {
  const uid = currentUid()
  if (!uid) return null
  const opId = `${uid}:${leadId}:${type}:${Date.now()}:${Math.random().toString(36).slice(2, 7)}`
  await putLocalLeadPatch(uid, leadId, leadAfter, origin)
  // 'reveal' is server-authoritative (credits are spent there) — no safe replay.
  if (type !== 'reveal') {
    await addPendingOp(uid, { id: opId, leadId, type, payload, at: Date.now() })
  }
  return opId
}

/** A mutation was accepted — clear its dirty flag and pending op. */
export async function confirmLeadMutation(
  leadId: string,
  opId?: string | null,
  origin: 'server' | 'local' = 'server',
): Promise<void> {
  const uid = currentUid()
  if (!uid) return
  await markLeadClean(uid, leadId, origin)
  if (opId) await removePendingOp(uid, opId)
}

/** A mutation failed — keep the local change and its queued op (no rollback). */
export async function dropCachedLead(leadId: string): Promise<void> {
  const uid = currentUid()
  if (uid) await removeCachedLead(uid, leadId)
}

const OP_BODIES: Record<Exclude<PendingOpType, 'reveal'>, (p: Record<string, unknown>) => Record<string, unknown>> = {
  save: () => ({ isSaved: true, status: 'saved' }),
  unsave: () => ({ isSaved: false, status: 'dismissed' }),
  remove: () => ({ isSaved: false, status: 'dismissed' }),
  status: (p) => ({ status: p.status }),
  followUp: () => ({ logFollowUp: true }),
  setFollowUpCount: (p) => ({ followUpCount: p.count }),
}

/** Replay queued writes once the API is reachable again. */
export async function flushPendingOps(): Promise<number> {
  const uid = currentUid()
  if (!uid) return 0
  const ops = await getPendingOps(uid)
  let flushed = 0
  for (const op of ops) {
    if (op.type === 'reveal') {
      await removePendingOp(uid, op.id)
      continue
    }
    try {
      const res = await fetch(`/api/leads/${op.leadId}`, {
        method: 'PATCH',
        headers: await authHeaders(),
        body: JSON.stringify(OP_BODIES[op.type](op.payload)),
      })
      // 4xx means the request will never succeed (e.g. lead gone) — drop it.
      if (res.ok || (res.status >= 400 && res.status < 500)) {
        await removePendingOp(uid, op.id)
        if (res.ok) {
          await markLeadClean(uid, op.leadId)
          flushed++
        }
      } else {
        break // 5xx — retry on the next flush
      }
    } catch {
      break // offline — retry on the next flush
    }
  }
  return flushed
}

export async function pendingCount(): Promise<number> {
  const uid = currentUid()
  return uid ? (await getPendingOps(uid)).length : 0
}
