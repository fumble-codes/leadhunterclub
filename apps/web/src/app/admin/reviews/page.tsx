'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  PlusIcon,
  PhotoIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import { getFirebaseToken } from '@/lib/firebase'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { compressReviewImage } from '@/lib/review-image'
import type { ReviewDTO } from '@/lib/reviews'

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

const TABS: StatusFilter[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']

const statusStyles: Record<string, string> = {
  PENDING: 'border-amber-500/25 bg-amber-500/10 text-amber-400',
  APPROVED: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
  REJECTED: 'border-red-500/25 bg-red-500/10 text-red-400',
}

export default function AdminReviewsPage() {
  const { addToast } = useToast()
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [page, setPage] = useState(1)
  const [reviews, setReviews] = useState<ReviewDTO[]>([])
  const [byStatus, setByStatus] = useState<Record<string, number>>({ PENDING: 0, APPROVED: 0, REJECTED: 0 })
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [addOpen, setAddOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formRole, setFormRole] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formQuote, setFormQuote] = useState('')
  const [formFile, setFormFile] = useState<File | null>(null)
  const [formPreview, setFormPreview] = useState<string | null>(null)
  const [formPublish, setFormPublish] = useState(true)
  const [formFeature, setFormFeature] = useState(false)
  const [formLanding, setFormLanding] = useState(true)
  const [formWall, setFormWall] = useState(true)
  const [formPosition, setFormPosition] = useState(0)
  const [formBusy, setFormBusy] = useState(false)
  const [formError, setFormError] = useState('')
  const [lightbox, setLightbox] = useState<string | null>(null)

  const fetchReviews = useCallback(async () => {
    const token = await getFirebaseToken()
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reviews?status=${status}&page=${page}&pageSize=12`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || 'Failed to load reviews')
      setReviews(json.data || [])
      setByStatus(json.byStatus || {})
      setTotalPages(json.pagination?.totalPages || 1)
    } catch (e) {
      addToast({ type: 'error', message: e instanceof Error ? e.message : 'Failed to load reviews' })
    } finally {
      setLoading(false)
    }
  }, [status, page, addToast])

  useEffect(() => {
    void fetchReviews()
  }, [fetchReviews])

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'feature', current?: ReviewDTO) => {
    const payload =
      action === 'approve'
        ? { status: 'APPROVED' }
        : action === 'reject'
          ? { status: 'REJECTED' }
          : { isFeatured: !current?.isFeatured }
    setActionLoading(`${id}-${action}`)
    try {
      const token = await getFirebaseToken()
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || 'Action failed')
      addToast({
        type: 'success',
        message: action === 'approve' ? 'Review approved — it is now live' : action === 'reject' ? 'Review rejected' : `Review ${current?.isFeatured ? 'removed from' : 'added to'} the homepage`,
      })
      await fetchReviews()
    } catch (e) {
      addToast({ type: 'error', message: e instanceof Error ? e.message : 'Action failed' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this review permanently?')) return
    setActionLoading(`${id}-delete`)
    try {
      const token = await getFirebaseToken()
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Delete failed')
      addToast({ type: 'success', message: 'Review deleted' })
      await fetchReviews()
    } catch (e) {
      addToast({ type: 'error', message: e instanceof Error ? e.message : 'Delete failed' })
    } finally {
      setActionLoading(null)
    }
  }

  const patchReview = async (id: string, patch: Record<string, unknown>, message: string) => {
    setActionLoading(`${id}-placement`)
    try {
      const token = await getFirebaseToken()
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || 'Update failed')
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...json.data } : r)))
      addToast({ type: 'success', message })
    } catch (e) {
      addToast({ type: 'error', message: e instanceof Error ? e.message : 'Update failed' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddFile = async (chosen: File | null) => {
    if (!chosen) return
    setFormError('')
    const compressed = await compressReviewImage(chosen)
    setFormFile(compressed)
    const reader = new FileReader()
    reader.onload = () => setFormPreview(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(compressed)
  }

  const resetForm = () => {
    setFormName('')
    setFormRole('')
    setFormCategory('')
    setFormQuote('')
    setFormFile(null)
    setFormPreview(null)
    setFormPublish(true)
    setFormFeature(false)
    setFormLanding(true)
    setFormWall(true)
    setFormPosition(0)
    setFormError('')
  }

  const handleCreate = async () => {
    if (!formFile) {
      setFormError('A screenshot is required.')
      return
    }
    setFormBusy(true)
    setFormError('')
    try {
      const token = await getFirebaseToken()
      const form = new FormData()
      form.append('authorName', formName.trim())
      form.append('authorRole', formRole.trim())
      form.append('category', formCategory.trim())
      form.append('quote', formQuote.trim())
      form.append('screenshot', formFile)
      form.append('status', formPublish ? 'APPROVED' : 'PENDING')
      form.append('isFeatured', String(formFeature && formPublish))
      form.append('showOnLanding', String(formLanding))
      form.append('showOnWall', String(formWall))
      form.append('position', String(formPosition))
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || 'Failed to add review')
      addToast({ type: 'success', message: formPublish ? 'Review published' : 'Review saved as pending' })
      setAddOpen(false)
      resetForm()
      await fetchReviews()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to add review')
    } finally {
      setFormBusy(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:border-accent-mint/50 focus:outline-none transition-colors'

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Reviews</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Moderate member submissions and upload reviews. Approved reviews appear on the reviews page and homepage.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/reviews/bulk"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary hover:bg-white/[0.06]"
          >
            <PhotoIcon style={{ strokeWidth: 1.6 }} className="h-4 w-4" />
            Bulk upload
          </Link>
          <button
            onClick={() => {
              resetForm()
              setAddOpen(true)
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-mint px-4 py-2.5 text-sm font-semibold text-surface transition-opacity hover:opacity-90"
          >
            <PlusIcon style={{ strokeWidth: 1.6 }} className="h-4 w-4" />
            Add review
          </button>
        </div>
      </div>

      {/* Count cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Pending', value: byStatus.PENDING || 0, tone: 'text-amber-400' },
          { label: 'Approved', value: byStatus.APPROVED || 0, tone: 'text-emerald-400' },
          { label: 'Rejected', value: byStatus.REJECTED || 0, tone: 'text-red-400' },
          { label: 'All', value: (byStatus.PENDING || 0) + (byStatus.APPROVED || 0) + (byStatus.REJECTED || 0), tone: 'text-text-primary' },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/[0.06] bg-surface/40 p-4">
            <p className="text-[11px] uppercase tracking-wider text-text-muted">{card.label}</p>
            <p className={`mt-1 font-display text-2xl font-semibold ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setStatus(tab)
              setPage(1)
            }}
            className={`shrink-0 rounded-xl border px-4 py-2 text-xs font-medium transition-all ${
              status === tab
                ? 'border-accent-mint/30 bg-accent-mint/10 text-accent-mint'
                : 'border-white/[0.06] bg-white/[0.02] text-text-secondary hover:text-text-primary hover:bg-white/[0.05]'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
            {tab !== 'ALL' && <span className="ml-1.5 text-text-muted">{byStatus[tab] || 0}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-surface/40 p-12 text-center">
          <ChatBubbleLeftRightIcon style={{ strokeWidth: 1.6 }} className="mx-auto mb-4 h-10 w-10 text-text-muted" />
          <h3 className="font-display text-lg font-semibold text-text-primary">No reviews here</h3>
          <p className="mt-1 text-sm text-text-secondary">
            {status === 'PENDING' ? 'No submissions waiting for approval.' : 'Try another filter or add a review.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {reviews.map((review) => {
            const busy = actionLoading?.startsWith(`${review.id}-`)
            return (
              <div key={review.id} className="overflow-hidden rounded-2xl border border-white/[0.06] bg-surface/40">
                <div className="flex gap-4 p-4">
                  <button
                    onClick={() => setLightbox(review.imageUrl)}
                    className="h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-white/[0.06] bg-black/30"
                    title="View full screenshot"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={review.imageUrl} alt="Review screenshot" className="h-full w-full object-contain" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">{review.authorName || 'Screenshot review'}</span>
                      {review.category && (
                        <span className="rounded-full border border-accent-purple/25 bg-accent-purple/10 px-2 py-0.5 text-[10px] font-semibold text-accent-purple">
                          {review.category}
                        </span>
                      )}
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusStyles[review.status] || statusStyles.PENDING}`}>
                        {review.status.charAt(0) + review.status.slice(1).toLowerCase()}
                      </span>
                      {review.isFeatured && (
                        <span className="rounded-full border border-accent-orange/25 bg-accent-orange/10 px-2 py-0.5 text-[10px] font-semibold text-accent-orange">
                          Featured
                        </span>
                      )}
                      <span className="ml-auto text-[11px] text-text-muted">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.authorRole && <p className="mb-2 text-[11px] text-text-muted">{review.authorRole}</p>}
                    {review.quote ? (
                      <p className="line-clamp-4 text-xs leading-relaxed text-text-secondary/90">“{review.quote}”</p>
                    ) : (
                      <p className="text-[11px] text-text-muted">Screenshot only — no caption</p>
                    )}
                  </div>
                </div>
                {/* Placement controls — decide where an approved review appears */}
                <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] px-3 py-2.5">
                  <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Show on</span>
                  <button
                    onClick={() => void patchReview(review.id, { showOnLanding: !review.showOnLanding }, review.showOnLanding ? 'Removed from landing' : 'Added to landing')}
                    disabled={busy}
                    className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium disabled:opacity-40 ${
                      review.showOnLanding
                        ? 'border-accent-orange/30 bg-accent-orange/10 text-accent-orange'
                        : 'border-white/10 bg-white/[0.02] text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    Landing {review.showOnLanding ? '✓' : '○'}
                  </button>
                  <button
                    onClick={() => void patchReview(review.id, { showOnWall: !review.showOnWall }, review.showOnWall ? 'Removed from Wall of Love' : 'Added to Wall of Love')}
                    disabled={busy}
                    className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium disabled:opacity-40 ${
                      review.showOnWall
                        ? 'border-accent-mint/30 bg-accent-mint/10 text-accent-mint'
                        : 'border-white/10 bg-white/[0.02] text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    Wall of Love {review.showOnWall ? '✓' : '○'}
                  </button>
                  <label className="ml-auto flex items-center gap-1.5 text-[11px] text-text-muted">
                    Order
                    <input
                      key={review.id}
                      type="number"
                      defaultValue={review.position}
                      onBlur={(e) => {
                        const value = Number(e.target.value)
                        if (Number.isFinite(value) && value !== review.position) {
                          void patchReview(review.id, { position: value }, 'Order updated')
                        }
                      }}
                      className="w-16 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-center text-[11px] text-text-primary focus:border-accent-mint/40 focus:outline-none"
                    />
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] bg-white/[0.02] p-3">
                  {review.status !== 'APPROVED' && (
                    <button
                      onClick={() => void handleAction(review.id, 'approve', review)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40"
                    >
                      <CheckCircleIcon style={{ strokeWidth: 1.6 }} className="h-4 w-4" />
                      {actionLoading === `${review.id}-approve` ? 'Working…' : 'Approve'}
                    </button>
                  )}
                  {review.status !== 'REJECTED' && (
                    <button
                      onClick={() => void handleAction(review.id, 'reject', review)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.06] disabled:opacity-40"
                    >
                      <XCircleIcon style={{ strokeWidth: 1.6 }} className="h-4 w-4" />
                      Reject
                    </button>
                  )}
                  {review.status === 'APPROVED' && (
                    <button
                      onClick={() => void handleAction(review.id, 'feature', review)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-accent-orange/20 bg-accent-orange/10 px-3 py-2 text-xs font-medium text-accent-orange hover:bg-accent-orange/20 disabled:opacity-40"
                    >
                      {review.isFeatured ? <EyeSlashIcon style={{ strokeWidth: 1.6 }} className="h-4 w-4" /> : <EyeIcon style={{ strokeWidth: 1.6 }} className="h-4 w-4" />}
                      {review.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                  )}
                  <button
                    onClick={() => void handleDelete(review.id)}
                    disabled={busy}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/15 disabled:opacity-40"
                  >
                    <TrashIcon style={{ strokeWidth: 1.6 }} className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-xl border border-white/[0.06] px-3.5 py-1.5 text-xs text-text-secondary hover:text-text-primary disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-xs text-text-muted">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-xl border border-white/[0.06] px-3.5 py-1.5 text-xs text-text-secondary hover:text-text-primary disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}

      {/* Add review modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add a review"
        actions={
          <>
            <button
              onClick={() => setAddOpen(false)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              onClick={() => void handleCreate()}
              disabled={formBusy}
              className="rounded-xl bg-accent-mint px-5 py-2.5 text-sm font-semibold text-surface hover:opacity-90 disabled:opacity-40"
            >
              {formBusy ? 'Saving…' : 'Save review'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Screenshot *</label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-5 text-center hover:border-accent-mint/40">
              {formPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={formPreview} alt="Preview" className="max-h-40 w-auto rounded-lg object-contain" />
              ) : (
                <>
                  <PhotoIcon style={{ strokeWidth: 1.6 }} className="h-7 w-7 text-text-muted" />
                  <span className="text-xs text-text-secondary">Click to choose an image (PNG, JPG or WebP, max 3MB)</span>
                </>
              )}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => void handleAddFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Quote (optional)</label>
            <textarea value={formQuote} onChange={(e) => setFormQuote(e.target.value)} rows={3} maxLength={800} className={`${inputClass} resize-none`} placeholder="What did they find with LeadHunterClub?" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">Author (optional)</label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} maxLength={80} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">Role (optional)</label>
              <input value={formRole} onChange={(e) => setFormRole(e.target.value)} maxLength={100} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">Label (optional)</label>
              <input value={formCategory} onChange={(e) => setFormCategory(e.target.value)} maxLength={60} placeholder="e.g. Closures" className={inputClass} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 text-xs text-text-secondary">
              <input type="checkbox" checked={formPublish} onChange={(e) => setFormPublish(e.target.checked)} className="h-4 w-4 accent-emerald-500" />
              Publish immediately (otherwise saved as pending)
            </label>
            <label className="flex items-center gap-2.5 text-xs text-text-secondary">
              <input type="checkbox" checked={formFeature} onChange={(e) => setFormFeature(e.target.checked)} disabled={!formPublish} className="h-4 w-4 accent-orange-500 disabled:opacity-40" />
              Pin to the front of the landing page
            </label>
            <label className="flex items-center gap-2.5 text-xs text-text-secondary">
              <input type="checkbox" checked={formLanding} onChange={(e) => setFormLanding(e.target.checked)} className="h-4 w-4 accent-orange-500" />
              Show on landing page
            </label>
            <label className="flex items-center gap-2.5 text-xs text-text-secondary">
              <input type="checkbox" checked={formWall} onChange={(e) => setFormWall(e.target.checked)} className="h-4 w-4 accent-emerald-500" />
              Show on Wall of Love
            </label>
            <label className="flex items-center gap-2.5 text-xs text-text-secondary">
              Order (lower shows first)
              <input type="number" value={formPosition} onChange={(e) => setFormPosition(Number(e.target.value) || 0)} className="w-20 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-text-primary focus:border-accent-mint/40 focus:outline-none" />
            </label>
          </div>
          {formError && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{formError}</p>}
        </div>
      </Modal>

      {/* Screenshot lightbox */}
      <Modal open={!!lightbox} onClose={() => setLightbox(null)} title="Review screenshot">
        {lightbox && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={lightbox} alt="Full review screenshot" className="mx-auto max-h-[70vh] w-auto rounded-lg object-contain" />
        )}
      </Modal>
    </div>
  )
}
