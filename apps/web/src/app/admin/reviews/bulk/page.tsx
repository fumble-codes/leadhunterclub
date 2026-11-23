'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  PhotoIcon,
  FolderOpenIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { getFirebaseToken } from '@/lib/firebase'
import { useToast } from '@/components/ui/Toast'
import { compressReviewImage } from '@/lib/review-image'

const CHUNK_SIZE = 5
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp']

interface BulkItem {
  id: string
  file: File
  preview: string
  name: string
  category: string
}

interface Progress {
  done: number
  total: number
  created: number
  skipped: number
  failed: number
}

export default function AdminBulkReviewsPage() {
  const { addToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<BulkItem[]>([])
  const [dragging, setDragging] = useState(false)
  const [authorName, setAuthorName] = useState('')
  const [authorRole, setAuthorRole] = useState('')
  const [quote, setQuote] = useState('')
  const [publish, setPublish] = useState(true)
  const [feature, setFeature] = useState(false)
  const [showLanding, setShowLanding] = useState(true)
  const [showWall, setShowWall] = useState(true)
  const [position, setPosition] = useState(0)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)

  // Release object URLs on unmount / when the queue is cleared.
  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.preview))
    }
  }, [items])

  const addFiles = useCallback((fileList: FileList | File[] | null) => {
    if (!fileList) return
    const files = Array.from(fileList)
    const valid = files.filter((f) => ACCEPTED.includes(f.type) && f.size > 0)
    const ignored = files.length - valid.length
    if (ignored > 0) addToast({ type: 'info', message: `${ignored} non-image file${ignored === 1 ? '' : 's'} skipped` })

    setItems((prev) => {
      const seen = new Set(prev.map((i) => `${i.name}:${i.file.size}`))
      const additions: BulkItem[] = []
      for (const file of valid) {
        const key = `${file.name}:${file.size}`
        if (seen.has(key)) continue
        seen.add(key)
        const folder = (file as File & { webkitRelativePath?: string }).webkitRelativePath?.split('/')[0]?.trim()
        additions.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          category: folder || '',
        })
      }
      return [...prev, ...additions]
    })
    setFinished(false)
  }, [addToast])

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((i) => i.id !== id)
    })
  }

  const clearAll = () => {
    items.forEach((i) => URL.revokeObjectURL(i.preview))
    setItems([])
    setProgress(null)
    setFinished(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (folderInputRef.current) folderInputRef.current.value = ''
  }

  const totalBytes = useMemo(() => items.reduce((sum, i) => sum + i.file.size, 0), [items])
  const sizeLabel = totalBytes > 1024 * 1024 ? `${(totalBytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(totalBytes / 1024)} KB`

  const uploadChunk = async (chunk: BulkItem[], token: string) => {
    const form = new FormData()
    const categories: string[] = []
    for (const item of chunk) {
      const compressed = await compressReviewImage(item.file, 1200, 0.78)
      form.append('files', compressed, compressed.name)
      categories.push(item.category.trim())
    }
    form.append('categories', JSON.stringify(categories))
    form.append('authorName', authorName.trim())
    form.append('authorRole', authorRole.trim())
    form.append('quote', quote.trim())
    form.append('status', publish ? 'APPROVED' : 'PENDING')
    form.append('isFeatured', String(feature && publish))
    form.append('showOnLanding', String(showLanding))
    form.append('showOnWall', String(showWall))
    form.append('position', String(position))

    const res = await fetch('/api/admin/reviews/bulk', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.message || `Upload failed (${res.status})`)
    return { created: Number(json.created) || 0, skipped: Number(json.skipped) || 0 }
  }

  const startUpload = async () => {
    if (items.length === 0 || running) return
    const token = await getFirebaseToken()
    if (!token) {
      addToast({ type: 'error', message: 'Your session expired — please log in again.' })
      return
    }

    const chunks: BulkItem[][] = []
    for (let i = 0; i < items.length; i += CHUNK_SIZE) chunks.push(items.slice(i, i + CHUNK_SIZE))

    setRunning(true)
    setFinished(false)
    setProgress({ done: 0, total: items.length, created: 0, skipped: 0, failed: 0 })

    let nextChunk = 0
    const worker = async () => {
      while (nextChunk < chunks.length) {
        const chunk = chunks[nextChunk++]
        try {
          const result = await uploadChunk(chunk, token)
          setProgress((p) =>
            p ? { ...p, done: p.done + chunk.length, created: p.created + result.created, skipped: p.skipped + result.skipped } : p,
          )
        } catch {
          setProgress((p) => (p ? { ...p, done: p.done + chunk.length, failed: p.failed + chunk.length } : p))
        }
      }
    }

    await Promise.all([worker(), worker()])
    setRunning(false)
    setFinished(true)
    addToast({ type: 'success', message: 'Bulk upload finished' })
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:border-accent-mint/50 focus:outline-none transition-colors'

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/reviews" className="mb-4 inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent-mint">
          <ArrowLeftIcon style={{ strokeWidth: 1.6 }} className="h-4 w-4" />
          Back to reviews
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Bulk upload reviews</h1>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary">
          Drop a whole folder of deal or closure screenshots. The folder name becomes the label on each review.
          Text is optional — screenshots go live on their own.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
        className={`mb-6 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? 'border-accent-mint/60 bg-accent-mint/5' : 'border-white/10 bg-white/[0.02]'
        }`}
      >
        <PhotoIcon style={{ strokeWidth: 1.6 }} className="mx-auto mb-3 h-9 w-9 text-text-muted" />
        <p className="text-sm font-medium text-text-primary">Drag images or a folder here</p>
        <p className="mt-1 text-xs text-text-secondary/70">PNG, JPG or WebP · up to 3MB each · duplicates are skipped automatically</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl bg-accent-mint px-4 py-2.5 text-sm font-semibold text-surface hover:opacity-90"
          >
            Choose images
          </button>
          <button
            onClick={() => folderInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.06]"
          >
            <FolderOpenIcon style={{ strokeWidth: 1.6 }} className="h-4 w-4" />
            Choose folder
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <input
          ref={folderInputRef}
          type="file"
          multiple
          {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {items.length > 0 && (
        <>
          {/* Shared settings */}
          <div className="mb-6 rounded-2xl border border-white/[0.06] bg-surface/40 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-base font-semibold text-text-primary">
                {items.length} image{items.length === 1 ? '' : 's'} · {sizeLabel}
              </h2>
              <button onClick={clearAll} disabled={running} className="text-xs text-text-secondary hover:text-red-400 disabled:opacity-40">
                Clear all
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Author (optional, shared)</label>
                <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} maxLength={80} className={inputClass} placeholder="Leave blank for screenshot-only" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Role (optional, shared)</label>
                <input value={authorRole} onChange={(e) => setAuthorRole(e.target.value)} maxLength={100} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Quote (optional, shared)</label>
                <input value={quote} onChange={(e) => setQuote(e.target.value)} maxLength={800} className={inputClass} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-5">
              <label className="flex items-center gap-2.5 text-xs text-text-secondary">
                <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} className="h-4 w-4 accent-emerald-500" />
                Publish immediately
              </label>
              <label className="flex items-center gap-2.5 text-xs text-text-secondary">
                <input type="checkbox" checked={feature} onChange={(e) => setFeature(e.target.checked)} disabled={!publish} className="h-4 w-4 accent-orange-500 disabled:opacity-40" />
                Pin to front of landing
              </label>
              <label className="flex items-center gap-2.5 text-xs text-text-secondary">
                <input type="checkbox" checked={showLanding} onChange={(e) => setShowLanding(e.target.checked)} className="h-4 w-4 accent-orange-500" />
                Show on landing
              </label>
              <label className="flex items-center gap-2.5 text-xs text-text-secondary">
                <input type="checkbox" checked={showWall} onChange={(e) => setShowWall(e.target.checked)} className="h-4 w-4 accent-emerald-500" />
                Show on Wall of Love
              </label>
              <label className="flex items-center gap-2.5 text-xs text-text-secondary">
                Order
                <input type="number" value={position} onChange={(e) => setPosition(Number(e.target.value) || 0)} className="w-20 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-text-primary focus:border-accent-mint/40 focus:outline-none" />
              </label>
            </div>
          </div>

          {/* Thumbnail queue */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((item) => (
              <div key={item.id} className="group overflow-hidden rounded-xl border border-white/[0.06] bg-surface/40">
                <div className="relative aspect-[4/3] bg-black/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.preview} alt={item.name} className="h-full w-full object-contain" />
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={running}
                    aria-label={`Remove ${item.name}`}
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 text-white/80 opacity-0 transition-opacity hover:text-white group-hover:opacity-100 disabled:opacity-40"
                  >
                    <XMarkIcon style={{ strokeWidth: 1.6 }} className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-2">
                  <p className="truncate text-[11px] text-text-secondary" title={item.name}>{item.name}</p>
                  <input
                    value={item.category}
                    onChange={(e) => {
                      const value = e.target.value
                      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, category: value } : i)))
                    }}
                    disabled={running}
                    maxLength={60}
                    placeholder="Label…"
                    className="mt-1.5 w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1.5 text-[11px] text-text-primary placeholder:text-text-muted/60 focus:border-accent-mint/40 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Upload bar */}
          <div className="sticky bottom-4 z-10 rounded-2xl border border-white/10 bg-surface/95 p-4 shadow-elevation-4 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-text-secondary">
                {progress ? (
                  <>
                    <span className="font-semibold text-text-primary">{progress.done} / {progress.total}</span> processed
                    <span className="ml-3 text-emerald-400">{progress.created} published</span>
                    {progress.skipped > 0 && <span className="ml-3 text-amber-400">{progress.skipped} duplicates skipped</span>}
                    {progress.failed > 0 && <span className="ml-3 text-red-400">{progress.failed} failed</span>}
                  </>
                ) : (
                  'Ready to upload'
                )}
              </div>
              <button
                onClick={() => void startUpload()}
                disabled={running || items.length === 0}
                className="rounded-xl bg-accent-mint px-5 py-2.5 text-sm font-semibold text-surface hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {running ? 'Uploading…' : `Upload ${items.length} review${items.length === 1 ? '' : 's'}`}
              </button>
            </div>
            {progress && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-accent-mint transition-[width] duration-300"
                  style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
                />
              </div>
            )}
          </div>

          {finished && progress && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <CheckCircleIcon style={{ strokeWidth: 1.6 }} className="h-5 w-5 shrink-0 text-emerald-400" />
              <div className="text-xs text-text-secondary">
                <p className="font-semibold text-text-primary">Upload complete</p>
                <p className="mt-1">
                  {progress.created} new review{progress.created === 1 ? '' : 's'} added
                  {progress.skipped > 0 ? `, ${progress.skipped} duplicate${progress.skipped === 1 ? '' : 's'} skipped` : ''}
                  {progress.failed > 0 ? `, ${progress.failed} failed — check the console and retry those images.` : '.'}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {items.length === 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-text-secondary">
          <ExclamationTriangleIcon style={{ strokeWidth: 1.6 }} className="h-5 w-5 shrink-0 text-text-muted" />
          <p>
            Tip: choose a folder named <span className="font-semibold text-text-primary">Closures</span> or{' '}
            <span className="font-semibold text-text-primary">Deals</span> — that name is saved as a label on every
            screenshot inside it, and you can edit each label before uploading.
          </p>
        </div>
      )}
    </div>
  )
}
