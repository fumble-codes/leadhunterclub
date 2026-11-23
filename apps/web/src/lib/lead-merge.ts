/**
 * Pure merge of the server's saved-lead list with the browser-local mirror.
 * Kept free of browser/DB imports so it can be unit-tested directly.
 */

import type { AppLead } from '@/types/lead'
import type { CachedLeadRecord, PendingOp } from '@/lib/saved-leads-cache'

export interface MergedSavedLeads {
  leads: AppLead[]
  /** Leads present only in the local mirror — surface these as "on this device". */
  recoveredIds: Set<string>
  /** Leads with an un-replayed local change. */
  dirtyIds: Set<string>
}

function actionTime(lead: AppLead, rec?: CachedLeadRecord): number {
  const raw =
    lead.lastActionDate ||
    rec?.updatedAt ||
    lead.approvedAt ||
    lead.scrapedAt ||
    rec?.savedAt ||
    0
  const t = typeof raw === 'number' ? raw : Date.parse(raw)
  return Number.isFinite(t) ? t : 0
}

/**
 * Merge rules:
 *  - Server is authoritative for leads it returns.
 *  - A cached record with a pending local mutation (dirty) keeps its local
 *    fields until the mutation is replayed, so a re-fetch cannot lose it.
 *  - Cached leads the server no longer returns (orphaned lead records) are
 *    kept as "recovered" — this is the data-loss case the mirror exists for.
 *  - Locally unsaved/removed leads stay out until the op is replayed.
 */
export function mergeSavedLeads(
  cached: CachedLeadRecord[],
  server: AppLead[],
  pendingOps: PendingOp[],
): MergedSavedLeads {
  const removedLocally = new Set(
    pendingOps
      .filter((op) => op.type === 'unsave' || op.type === 'remove')
      .map((op) => op.leadId),
  )
  const cachedById = new Map(cached.map((rec) => [rec.leadId, rec]))
  const serverIds = new Set(server.map((lead) => lead.id))
  const recoveredIds = new Set<string>()
  const dirtyIds = new Set<string>()
  const seen = new Set<string>()
  const leads: AppLead[] = []

  for (const lead of server) {
    if (removedLocally.has(lead.id)) continue
    const rec = cachedById.get(lead.id)
    const resolved = rec?.dirty ? { ...lead, ...rec.lead } : lead
    leads.push(resolved)
    seen.add(lead.id)
    if (rec?.dirty) dirtyIds.add(lead.id)
  }

  for (const rec of cached) {
    if (seen.has(rec.leadId) || removedLocally.has(rec.leadId)) continue
    leads.push(rec.lead)
    seen.add(rec.leadId)
    recoveredIds.add(rec.leadId)
    if (rec.dirty) dirtyIds.add(rec.leadId)
  }

  leads.sort((a, b) => {
    const ta = actionTime(a, cachedById.get(a.id))
    const tb = actionTime(b, cachedById.get(b.id))
    return tb - ta
  })

  return { leads, recoveredIds, dirtyIds }
}
