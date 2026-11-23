/**
 * Browser-local mirror of a user's saved leads (IndexedDB).
 *
 * The server (UserLeadState + Lead/LeadPost) stays the source of truth. This is
 * a read-through cache + recovery copy: it survives the backend losing lead
 * records, API 503s, and offline sessions. It is namespaced by Firebase UID so
 * a shared browser never shows one account's leads to another.
 *
 * Every operation is best-effort — if IndexedDB is unavailable (private mode,
 * disabled storage, quota), callers simply continue with server-only behavior.
 */

import type { AppLead } from '@/types/lead'

const DB_NAME = 'lhc-offline'
const DB_VERSION = 1
const LEADS_STORE = 'leads'
const META_STORE = 'meta'

export type LeadOrigin = 'server' | 'local'

export interface CachedLeadRecord {
  uid: string
  leadId: string
  lead: AppLead
  savedAt: number
  updatedAt: number
  origin: LeadOrigin
  dirty: boolean
}

export type PendingOpType = 'save' | 'unsave' | 'status' | 'followUp' | 'reveal' | 'remove' | 'setFollowUpCount'

export interface PendingOp {
  id: string
  uid: string
  leadId: string
  type: PendingOpType
  payload: Record<string, unknown>
  at: number
}

export function isCacheSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (!isCacheSupported()) return Promise.reject(new Error('IndexedDB unavailable'))
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(LEADS_STORE)) {
        const store = db.createObjectStore(LEADS_STORE, { keyPath: ['uid', 'leadId'] })
        store.createIndex('by_uid', 'uid', { unique: false })
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: ['uid', 'key'] })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
    req.onblocked = () => reject(new Error('IndexedDB blocked'))
  })
  // Reset on failure so a later attempt can retry.
  dbPromise.catch(() => {
    dbPromise = null
  })
  return dbPromise
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

function reqDone<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** Read every cached record for a user. Never throws. */
export async function getCachedLeads(uid: string): Promise<CachedLeadRecord[]> {
  try {
    const db = await openDb()
    const tx = db.transaction(LEADS_STORE, 'readonly')
    const idx = tx.objectStore(LEADS_STORE).index('by_uid')
    return (await reqDone(idx.getAll(uid))) as CachedLeadRecord[]
  } catch {
    return []
  }
}

/** Upsert server-fetched leads. Preserves each record's original savedAt. */
export async function putServerLeads(uid: string, leads: AppLead[]): Promise<void> {
  try {
    const db = await openDb()
    const tx = db.transaction(LEADS_STORE, 'readwrite')
    const store = tx.objectStore(LEADS_STORE)
    // Read all existing records in one request, then issue all writes without
    // awaiting in between (an IDB transaction auto-commits when idle).
    const existing = (await reqDone(store.index('by_uid').getAll(uid))) as CachedLeadRecord[]
    const byId = new Map(existing.map((r) => [r.leadId, r]))
    const now = Date.now()
    for (const lead of leads) {
      const prev = byId.get(lead.id)
      store.put({
        uid,
        leadId: lead.id,
        lead,
        savedAt: prev?.savedAt ?? now,
        updatedAt: now,
        origin: 'server',
        // A row with a pending local mutation must stay dirty until replayed.
        dirty: prev?.dirty ?? false,
      } satisfies CachedLeadRecord)
    }
    await txDone(tx)
  } catch {
    // best effort
  }
}

/**
 * Persist a local change to a lead immediately (optimistic), and mark it dirty
 * so a later server fetch does not clobber it.
 */
export async function putLocalLeadPatch(
  uid: string,
  leadId: string,
  lead: AppLead,
  origin: LeadOrigin = 'server',
): Promise<void> {
  try {
    const db = await openDb()
    const tx = db.transaction(LEADS_STORE, 'readwrite')
    const store = tx.objectStore(LEADS_STORE)
    const key = [uid, leadId]
    const existing = (await reqDone(store.get(key))) as CachedLeadRecord | undefined
    const now = Date.now()
    store.put({
      uid,
      leadId,
      lead,
      savedAt: existing?.savedAt ?? now,
      updatedAt: now,
      origin: existing?.origin ?? origin,
      dirty: true,
    } satisfies CachedLeadRecord)
    await txDone(tx)
  } catch {
    // best effort
  }
}

/** Clear the dirty flag after a mutation was accepted by the server. */
export async function markLeadClean(uid: string, leadId: string, origin: LeadOrigin = 'server'): Promise<void> {
  try {
    const db = await openDb()
    const tx = db.transaction(LEADS_STORE, 'readwrite')
    const store = tx.objectStore(LEADS_STORE)
    const key = [uid, leadId]
    const existing = (await reqDone(store.get(key))) as CachedLeadRecord | undefined
    if (existing) {
      store.put({ ...existing, dirty: false, origin, updatedAt: Date.now() } satisfies CachedLeadRecord)
    }
    await txDone(tx)
  } catch {
    // best effort
  }
}

export async function removeCachedLead(uid: string, leadId: string): Promise<void> {
  try {
    const db = await openDb()
    const tx = db.transaction(LEADS_STORE, 'readwrite')
    tx.objectStore(LEADS_STORE).delete([uid, leadId])
    await txDone(tx)
  } catch {
    // best effort
  }
}

/** Pending server writes that failed (offline / 5xx). Replayed when back online. */
export async function getPendingOps(uid: string): Promise<PendingOp[]> {
  try {
    const db = await openDb()
    const tx = db.transaction(META_STORE, 'readonly')
    const rec = (await reqDone(tx.objectStore(META_STORE).get([uid, 'pendingOps']))) as
      | { uid: string; key: string; value: PendingOp[] }
      | undefined
    return rec?.value ?? []
  } catch {
    return []
  }
}

export async function setPendingOps(uid: string, ops: PendingOp[]): Promise<void> {
  try {
    const db = await openDb()
    const tx = db.transaction(META_STORE, 'readwrite')
    tx.objectStore(META_STORE).put({ uid, key: 'pendingOps', value: ops })
    await txDone(tx)
  } catch {
    // best effort
  }
}

export async function addPendingOp(uid: string, op: Omit<PendingOp, 'uid'>): Promise<void> {
  const ops = await getPendingOps(uid)
  // Dedupe: same lead + same type supersedes the older one for follow-ups/status.
  const filtered = ops.filter((o) => !(o.leadId === op.leadId && o.type === op.type))
  await setPendingOps(uid, [...filtered, { ...op, uid }].slice(-100))
}

export async function removePendingOp(uid: string, opId: string): Promise<void> {
  const ops = await getPendingOps(uid)
  await setPendingOps(
    uid,
    ops.filter((o) => o.id !== opId),
  )
}

export async function getMeta<T>(uid: string, key: string): Promise<T | null> {
  try {
    const db = await openDb()
    const tx = db.transaction(META_STORE, 'readonly')
    const rec = (await reqDone(tx.objectStore(META_STORE).get([uid, key]))) as
      | { uid: string; key: string; value: T }
      | undefined
    return rec?.value ?? null
  } catch {
    return null
  }
}

export async function setMeta<T>(uid: string, key: string, value: T): Promise<void> {
  try {
    const db = await openDb()
    const tx = db.transaction(META_STORE, 'readwrite')
    tx.objectStore(META_STORE).put({ uid, key, value })
    await txDone(tx)
  } catch {
    // best effort
  }
}

/** Wipe this user's offline copy (Settings / sign-out). */
export async function clearOfflineCopy(uid: string): Promise<void> {
  try {
    const db = await openDb()
    const tx = db.transaction([LEADS_STORE, META_STORE], 'readwrite')
    const store = tx.objectStore(LEADS_STORE)
    const idx = store.index('by_uid')
    const keys = (await reqDone(idx.getAllKeys(uid))) as IDBValidKey[]
    for (const key of keys) store.delete(key)
    tx.objectStore(META_STORE).delete([uid, 'pendingOps'])
    tx.objectStore(META_STORE).delete([uid, 'lastSync'])
    tx.objectStore(META_STORE).delete([uid, 'offlineEnabled'])
    await txDone(tx)
  } catch {
    // best effort
  }
}
