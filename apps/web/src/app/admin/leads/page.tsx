'use client'

import { useState, useEffect, useCallback } from 'react'
import { getFirebaseToken } from '@/lib/firebase'
import {
  CheckCircleIcon, XCircleIcon, ArrowPathIcon, TrashIcon, SparklesIcon,
  MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon,
  ShieldCheckIcon, ClockIcon, NoSymbolIcon,
} from '@heroicons/react/24/solid'
import type { ExternalPost } from '@/lib/external-api/client'
import { useToast } from '@/components/ui/Toast'

interface LeadStats {
  stats: Record<string, number>
  aiMetrics: { status: string; model_ready?: boolean; samples?: number; accuracy?: number; message?: string }
  intelSettings: { is_configured: boolean; model: string }
}

const REVIEW_TABS = [
  { key: '', label: 'All', icon: ShieldCheckIcon },
  { key: 'pending', label: 'Pending', icon: ClockIcon },
  { key: 'approved', label: 'Approved', icon: CheckCircleIcon },
  { key: 'rejected', label: 'Rejected', icon: NoSymbolIcon },
]

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<ExternalPost[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [stats, setStats] = useState<LeadStats | null>(null)
  const [fallbackCounts, setFallbackCounts] = useState<Record<string, number> | null>(null)
  const [reviewTab, setReviewTab] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)
  const { addToast } = useToast()
  const perPage = 20

  const fetchLeads = useCallback(async () => {
    const token = await getFirebaseToken()
    if (!token) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), perPage: String(perPage) })
      if (reviewTab) params.set('status', reviewTab)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/leads?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      setLeads(json.data || [])
      setTotalPages(Math.max(1, json.pages || 1))
      if (json.counts) setFallbackCounts(json.counts)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, reviewTab, search])

  const fetchStats = useCallback(async () => {
    const token = await getFirebaseToken()
    if (!token) return
    try {
      const res = await fetch('/api/admin/leads/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) setStats(json.data)
      else console.warn('[AdminLeads] Stats fetch returned error:', json.message)
    } catch (e) {
      console.warn('[AdminLeads] Stats fetch failed:', e)
    }
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])
  useEffect(() => { fetchStats() }, [fetchStats])

  const doAction = async (id: string, action: string) => {
    setActionLoading(`${id}-${action}`)
    const token = await getFirebaseToken()
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        addToast({ type: 'error', message: json?.message || `Action "${action}" failed` })
      } else {
        addToast({ type: 'success', message: `✓ Lead ${action}d successfully` })
      }
    } catch {
      addToast({ type: 'error', message: `Network error during "${action}"` })
    }
    setActionLoading(null)
    fetchLeads()
    fetchStats()
  }

  const doBulkAction = async (action: string, ids?: string[]) => {
    setBulkLoading(true)
    const token = await getFirebaseToken()
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids, filters: { status: reviewTab || undefined, search: search || undefined } }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        addToast({ type: 'error', message: json?.message || `Bulk action "${action}" failed` })
      } else {
        addToast({ type: 'success', message: `✓ Bulk ${action} completed` })
      }
    } catch {
      addToast({ type: 'error', message: `Network error during bulk "${action}"` })
    }
    setBulkLoading(false)
    setSelectedIds([])
    fetchLeads()
    fetchStats()
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const isLoading = (id: string, action: string) => actionLoading === `${id}-${action}`

  const statValue = (key: string): number => {
    if (stats?.stats?.[key] && stats.stats[key] > 0) return stats.stats[key]
    if (fallbackCounts?.[key] && fallbackCounts[key] > 0) return fallbackCounts[key]
    return 0
  }
  const safeStat = (keys: string[]) => {
    for (const key of keys) {
      const v = statValue(key)
      if (v > 0) return v
    }
    return statValue(keys[0]) || 0
  }
  const counts = {
    pending: safeStat(['pending', 'pending_review', 'needs_review']),
    approved: safeStat(['approved', 'Approved']),
    rejected: safeStat(['rejected', 'Rejected']),
    total: safeStat(['total', 'Total', 'all', 'All']) || leads.length,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-accent-mint" />
            Lead Intelligence
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Review, approve, and manage AI-qualified leads
          </p>
        </div>
        <div className="flex items-center gap-3">
          {stats?.intelSettings && (
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              stats.intelSettings.is_configured
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
            }`}>
              Intel: {stats.intelSettings.is_configured ? stats.intelSettings.model : 'Not configured'}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: counts.total, color: 'text-text-primary', bg: 'bg-white/5' },
          { label: 'Pending', value: counts.pending, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Approved', value: counts.approved, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Rejected', value: counts.rejected, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5`}>
            <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color} mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {REVIEW_TABS.map(tab => {
          const Icon = tab.icon
          const isActive = reviewTab === tab.key
          const count = tab.key ? counts[tab.key as keyof typeof counts] ?? null : null
          return (
            <button key={tab.key} onClick={() => { setReviewTab(tab.key); setPage(1) }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive ? 'bg-accent-mint/10 text-accent-mint border border-accent-mint/20' : 'bg-white/5 text-text-secondary border border-white/[0.06] hover:bg-white/10'
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {count !== null && <span className="opacity-60">({count})</span>}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/40" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search leads..."
            className="w-full bg-surface-elevated border border-white/5 text-white rounded-xl outline-none focus:ring-1 focus:ring-accent-mint/50 transition-all pl-10 pr-4 py-2.5 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => doBulkAction('bulk-approve')} disabled={bulkLoading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-all disabled:opacity-50">
            <CheckCircleIcon className="w-3.5 h-3.5" />Approve All
          </button>
          <button onClick={() => doBulkAction('bulk-reject')} disabled={bulkLoading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all disabled:opacity-50">
            <XCircleIcon className="w-3.5 h-3.5" />Reject All
          </button>
          {selectedIds.length > 0 && (
            <>
              <span className="text-xs text-text-secondary">{selectedIds.length} selected</span>
              <button onClick={() => doBulkAction('bulk-approve', selectedIds)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent-mint/10 border border-accent-mint/20 text-accent-mint text-xs font-medium hover:bg-accent-mint/20 transition-all">
                <CheckCircleIcon className="w-3.5 h-3.5" />Approve Selected
              </button>
              <button onClick={() => doBulkAction('bulk-delete', selectedIds)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all">
                <TrashIcon className="w-3.5 h-3.5" />Delete Selected
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <ArrowPathIcon className="w-6 h-6 animate-spin text-accent-mint" />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-surface/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-12 text-center">
          <SparklesIcon className="w-12 h-12 text-text-secondary/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-1">No leads found</h3>
          <p className="text-sm text-text-secondary">Leads will appear here once they are scraped and qualified.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map(lead => (
            <div key={lead.id} className="bg-surface/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="flex items-center mt-1">
                  <input type="checkbox" checked={selectedIds.includes(lead.id)} onChange={() => toggleSelect(lead.id)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 accent-accent-mint"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-text-primary truncate">
                      {lead.author?.name || 'Unknown'}
                    </h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      lead.review_status === 'approved' ? 'bg-green-500/10 text-green-400' :
                      lead.review_status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {lead.review_status || 'pending'}
                    </span>
                    {lead.ai_score > 0 && (
                      <span className="text-[10px] font-semibold text-accent-mint bg-accent-mint/10 px-2 py-0.5 rounded-full">
                        AI: {lead.ai_score}%
                      </span>
                    )}
                    <span className="text-[10px] text-text-secondary/50 uppercase">{lead.platform}</span>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2 mb-2">
                    {lead.content?.substring(0, 300)}
                  </p>

                  <div className="flex items-center gap-3 text-[10px] text-text-secondary/60">
                    {lead.keyword && <span>Keyword: {lead.keyword}</span>}
                    {lead.enrichment_status && (
                      <span className={lead.enrichment_status === 'enriched' ? 'text-green-400/60' : 'text-yellow-400/60'}>
                        Enrichment: {lead.enrichment_status}
                      </span>
                    )}
                    {lead.claimed_count > 0 && <span>Claims: {lead.claimed_count}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {lead.review_status !== 'approved' && (
                    <button onClick={() => doAction(lead.id, 'approve')} disabled={isLoading(lead.id, 'approve')}
                      className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all disabled:opacity-50"
                      title="Approve">
                      {isLoading(lead.id, 'approve') ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
                    </button>
                  )}
                  {lead.review_status !== 'rejected' && (
                    <button onClick={() => doAction(lead.id, 'reject')} disabled={isLoading(lead.id, 'reject')}
                      className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                      title="Reject">
                      {isLoading(lead.id, 'reject') ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <XCircleIcon className="w-4 h-4" />}
                    </button>
                  )}
                  <button onClick={() => doAction(lead.id, 'regenerate-intel')} disabled={isLoading(lead.id, 'regenerate-intel')}
                    className="p-2 rounded-lg bg-accent-mint/10 border border-accent-mint/20 text-accent-mint hover:bg-accent-mint/20 transition-all disabled:opacity-50"
                    title="Regenerate Intelligence">
                    {isLoading(lead.id, 'regenerate-intel') ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10 transition-all disabled:opacity-30">
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <span className="text-sm text-text-secondary">
            Page {page} of {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10 transition-all disabled:opacity-30">
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}