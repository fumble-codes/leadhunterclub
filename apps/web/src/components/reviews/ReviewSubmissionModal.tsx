'use client'

import { useCallback, useEffect, useState } from 'react'
import { PhotoIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { Modal } from '@/components/ui/Modal'
import { getFirebaseToken } from '@/lib/firebase'
import { compressReviewImage } from '@/lib/review-image'

interface Props {
  open: boolean
  onClose: () => void
  defaultName?: string
  onSubmitted?: () => void
}

export function ReviewSubmissionModal({ open, onClose, defaultName = '', onSubmitted }: Props) {
  const [authorName, setAuthorName] = useState(defaultName)
  const [authorRole, setAuthorRole] = useState('')
  const [quote, setQuote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (open) {
      setAuthorName(defaultName)
      setError('')
      setDone(false)
    }
  }, [open, defaultName])

  const handleFile = useCallback(async (chosen: File | null) => {
    if (!chosen) return
    setError('')
    const compressed = await compressReviewImage(chosen)
    setFile(compressed)
    const reader = new FileReader()
    reader.onload = () => setPreview(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(compressed)
  }, [])

  const canSubmit = authorName.trim().length >= 2 && quote.trim().length >= 10 && !!file && !busy

  const handleSubmit = async () => {
    if (!canSubmit || !file) return
    setBusy(true)
    setError('')
    try {
      const token = await getFirebaseToken()
      if (!token) throw new Error('Please log in to share a review.')
      const form = new FormData()
      form.append('authorName', authorName.trim())
      form.append('authorRole', authorRole.trim())
      form.append('quote', quote.trim())
      form.append('screenshot', file)
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.message || 'Could not submit your review.')
      setDone(true)
      setQuote('')
      setFile(null)
      setPreview(null)
      onSubmitted?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your review.')
    } finally {
      setBusy(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:border-accent-orange/50 focus:outline-none transition-colors'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share your review"
      actions={
        done ? (
          <button
            onClick={onClose}
            className="rounded-xl bg-accent-orange px-5 py-2.5 text-sm font-semibold text-bg-main hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        ) : (
          <>
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="rounded-xl bg-accent-orange px-5 py-2.5 text-sm font-semibold text-bg-main hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? 'Submitting…' : 'Submit for review'}
            </button>
          </>
        )
      }
    >
      {done ? (
        <div className="py-8 text-center">
          <CheckCircleIcon style={{ strokeWidth: 1.6 }} className="mx-auto mb-4 h-12 w-12 text-accent-mint" />
          <h3 className="font-display text-lg font-semibold text-text-primary">Thank you!</h3>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Your review has been sent. Once our team approves it, it will appear here and on the homepage.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-xs leading-relaxed text-text-secondary/80">
            Tell us what you found with LeadHunterClub. Add a screenshot of the reply, meeting or closed deal —
            every review needs one. We review submissions before they go live.
          </p>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Screenshot *</label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-center transition-colors hover:border-accent-orange/40">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Screenshot preview" className="max-h-48 w-auto rounded-lg object-contain" />
              ) : (
                <>
                  <PhotoIcon style={{ strokeWidth: 1.6 }} className="h-7 w-7 text-text-muted" />
                  <span className="text-xs text-text-secondary">Click to choose an image (PNG, JPG or WebP, max 3MB)</span>
                </>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {preview && <p className="mt-1 text-[11px] text-text-muted">Click the image to choose a different one.</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Your quote *</label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={4}
              maxLength={800}
              placeholder="What did LeadHunter help you find that you couldn't find before?"
              className={`${inputClass} resize-none`}
            />
            <p className="mt-1 text-right text-[11px] text-text-muted">{quote.length}/800</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">Name *</label>
              <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} maxLength={80} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">Role (optional)</label>
              <input value={authorRole} onChange={(e) => setAuthorRole(e.target.value)} maxLength={100} placeholder="e.g. Freelance designer" className={inputClass} />
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
        </div>
      )}
    </Modal>
  )
}
