import { describe, it, expect } from 'vitest'
import { mergeSavedLeads } from '@/lib/lead-merge'
import type { AppLead } from '@/types/lead'
import type { CachedLeadRecord, PendingOp } from '@/lib/saved-leads-cache'

const UID = 'user-1'

function lead(id: string, overrides: Partial<AppLead> = {}): AppLead {
  return {
    id,
    name: `Lead ${id}`,
    email: `${id}@example.com`,
    company: 'Acme',
    source: 'Lead Signal',
    category: 'SaaS',
    title: 'Need help',
    signalContext: 'Buying signal',
    role: 'Buyer',
    taskScope: 'Scope',
    mustHave: 'Must',
    nicheBonus: 'Win',
    buyerType: '',
    urgency: 'medium',
    winProb: 'medium',
    nicheTags: [],
    hashtags: [],
    replyProbability: 70,
    status: 'saved',
    timestamp: 'just now',
    niches: ['SaaS'],
    isSaved: true,
    isRevealed: true,
    ...overrides,
  }
}

function rec(id: string, overrides: Partial<CachedLeadRecord> = {}): CachedLeadRecord {
  return {
    uid: UID,
    leadId: id,
    lead: lead(id),
    savedAt: 1000,
    updatedAt: 2000,
    origin: 'server',
    dirty: false,
    ...overrides,
  }
}

function op(leadId: string, type: PendingOp['type']): PendingOp {
  return { id: `${leadId}-${type}`, uid: UID, leadId, type, payload: {}, at: 1 }
}

describe('mergeSavedLeads', () => {
  it('uses server data for leads present on both sides', () => {
    const result = mergeSavedLeads([rec('a')], [lead('a', { name: 'Server name' })], [])
    expect(result.leads).toHaveLength(1)
    expect(result.leads[0].name).toBe('Server name')
    expect(result.recoveredIds.size).toBe(0)
  })

  it('keeps cached leads the server no longer returns (orphaned / data loss)', () => {
    const result = mergeSavedLeads([rec('orphan')], [lead('a')], [])
    expect(result.leads.map((l) => l.id).sort()).toEqual(['a', 'orphan'])
    expect(result.recoveredIds.has('orphan')).toBe(true)
  })

  it('does not clobber a dirty local change with a stale server value', () => {
    const result = mergeSavedLeads(
      [rec('a', { dirty: true, lead: lead('a', { status: 'sent' }) })],
      [lead('a', { status: 'saved' })],
      [],
    )
    expect(result.leads[0].status).toBe('sent')
    expect(result.dirtyIds.has('a')).toBe(true)
    expect(result.recoveredIds.has('a')).toBe(false)
  })

  it('excludes leads the user unsaved while offline', () => {
    const result = mergeSavedLeads([rec('a')], [lead('a')], [op('a', 'unsave')])
    expect(result.leads).toHaveLength(0)
  })

  it('includes a locally saved lead that never reached the server', () => {
    const result = mergeSavedLeads(
      [rec('local-1', { origin: 'local', dirty: true })],
      [],
      [op('local-1', 'save')],
    )
    expect(result.leads).toHaveLength(1)
    expect(result.recoveredIds.has('local-1')).toBe(true)
    expect(result.dirtyIds.has('local-1')).toBe(true)
  })

  it('never emits duplicate ids', () => {
    const result = mergeSavedLeads([rec('a'), rec('b')], [lead('a'), lead('b')], [])
    expect(new Set(result.leads.map((l) => l.id)).size).toBe(result.leads.length)
  })

  it('sorts by most recent action, recovered rows included', () => {
    const result = mergeSavedLeads(
      [
        rec('old', { origin: 'local', lead: lead('old'), savedAt: 1, updatedAt: 100 }),
        rec('new', { origin: 'local', lead: lead('new'), savedAt: 2, updatedAt: 300 }),
      ],
      [lead('mid', { lastActionDate: new Date(200).toISOString() })],
      [],
    )
    expect(result.leads.map((l) => l.id)).toEqual(['new', 'mid', 'old'])
  })
})
