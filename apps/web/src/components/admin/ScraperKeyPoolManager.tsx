'use client'

import { useState, useMemo } from 'react'
import {
  KeyIcon, PlusIcon, TrashIcon, ShieldCheckIcon,
  ArrowPathIcon, ExclamationTriangleIcon, XCircleIcon, ClockIcon,
} from '@heroicons/react/24/solid'
import { parseScraperTokens } from '@/lib/apify-token-parser'
import { formatScrapeTiming } from '@/lib/scraper-tool'

export interface ScraperPoolKey {
  id: string
  key: string
  label: string | null
  is_active: boolean
  is_exhausted: boolean
  error_message?: string | null
  created_at: string
}

interface ScraperKeyPoolManagerProps {
  engine: 'scrapedog' | 'crawlbase'
  title: string
  subtitle: string
  iconEmoji: string
  placeholder: string
  keys: ScraperPoolKey[]
  loading: boolean
  lastScrapedAt?: string | null
  isPaused?: boolean
  onTogglePause?: (paused: boolean) => Promise<void>
  onRefresh: () => Promise<void>
  apiCall: (path: string, init?: RequestInit) => Promise<any>
  addToast: (toast: { type: 'success' | 'error' | 'warning' | 'info'; message: string }) => void
}

export function ScraperKeyPoolManager({
  engine,
  title,
  subtitle,
  iconEmoji,
  placeholder,
  keys,
  loading,
  lastScrapedAt,
  isPaused = false,
  onTogglePause,
  onRefresh,
  apiCall,
  addToast,
}: ScraperKeyPoolManagerProps) {
  const [newKey, setNewKey] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [isAddingKey, setIsAddingKey] = useState(false)
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [isBulkAdding, setIsBulkAdding] = useState(false)
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [testingKey, setTestingKey] = useState<string | null>(null)
  const [isTogglingPause, setIsTogglingPause] = useState(false)

  const handleTogglePause = async () => {
    if (!onTogglePause) return
    setIsTogglingPause(true)
    try {
      await onTogglePause(!isPaused)
    } finally {
      setIsTogglingPause(false)
    }
  }

  const testKey = async (keyString: string) => {
    setTestingKey(keyString)
    try {
      const res = await apiCall(`/api/admin/scraper-keys/${engine}/test`, {
        method: 'POST',
        body: JSON.stringify({ key: keyString }),
      })
      if (res?.valid) {
        addToast({ type: 'success', message: `${title}: ${res.message}` })
      } else {
        addToast({ type: 'error', message: `${title}: ${res?.message || 'Token verification failed'}` })
      }
    } catch (err: any) {
      addToast({ type: 'error', message: err?.message || 'Verification call failed' })
    } finally {
      setTestingKey(null)
    }
  }

  const defaultPrefix = engine === 'scrapedog' ? 'DogKey' : 'CrawlKey'
  const parsedPreview = useMemo(() => {
    return parseScraperTokens(bulkText, defaultPrefix)
  }, [bulkText, defaultPrefix])

  const addKey = async () => {
    const keyTrimmed = newKey.trim()
    if (!keyTrimmed) {
      addToast({ type: 'error', message: `Please enter a valid ${title} credential` })
      return
    }

    setIsAddingKey(true)
    try {
      await apiCall(`/api/admin/scraper-keys/${engine}`, {
        method: 'POST',
        body: JSON.stringify({ key: keyTrimmed, label: newLabel.trim() || undefined }),
      })

      setNewKey('')
      setNewLabel('')
      await onRefresh()
      addToast({ type: 'success', message: `${title} added successfully` })
    } catch (err: any) {
      addToast({ type: 'error', message: err?.message || `Failed to add key to ${title}` })
    } finally {
      setIsAddingKey(false)
    }
  }

  const handleKeyPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text')
    const detected = parseScraperTokens(pasted, defaultPrefix)
    if (detected.length > 1 || pasted.includes('\n')) {
      e.preventDefault()
      setBulkText(pasted)
      setIsBulkMode(true)
      addToast({
        type: 'info',
        message: `Detected ${detected.length > 0 ? detected.length : 'multiple'} tokens. Switched to Bulk Add!`,
      })
    }
  }

  const handleBulkAdd = async () => {
    if (!bulkText.trim() || parsedPreview.length === 0) {
      addToast({ type: 'error', message: 'No valid tokens detected in the pasted text' })
      return
    }

    setIsBulkAdding(true)
    try {
      const res = await apiCall(`/api/admin/scraper-keys/${engine}/bulk`, {
        method: 'POST',
        body: JSON.stringify({ items: parsedPreview }),
      })

      setBulkText('')
      setIsBulkMode(false)
      await onRefresh()
      addToast({
        type: 'success',
        message: `Successfully added ${res?.addedCount || parsedPreview.length} ${title}!`,
      })
    } catch (err: any) {
      addToast({ type: 'error', message: err?.message || 'Failed to bulk import tokens' })
    } finally {
      setIsBulkAdding(false)
    }
  }

  const deleteKey = async (id: string) => {
    setDeletingKeyId(id)
    try {
      await apiCall(`/api/admin/scraper-keys/${engine}/${id}`, {
        method: 'DELETE',
      })
      await onRefresh()
      addToast({ type: 'success', message: 'Key removed successfully' })
    } catch (err: any) {
      addToast({ type: 'error', message: err?.message || 'Failed to delete key' })
    } finally {
      setDeletingKeyId(null)
    }
  }

  const handleBulkDelete = async (deleteAll = false) => {
    const idsToDelete = deleteAll ? keys.map((k) => k.id).filter(Boolean) : selectedIds
    if (idsToDelete.length === 0) return

    const count = idsToDelete.length
    const confirmMsg = deleteAll
      ? `Are you sure you want to delete ALL ${count} ${title}? This cannot be undone.`
      : `Are you sure you want to delete ${count} selected ${title}?`

    if (!window.confirm(confirmMsg)) return

    setIsBulkDeleting(true)
    try {
      await apiCall(`/api/admin/scraper-keys/${engine}/bulk`, {
        method: 'DELETE',
        body: JSON.stringify(deleteAll ? { all: true } : { ids: idsToDelete }),
      })

      setSelectedIds([])
      await onRefresh()
      addToast({ type: 'success', message: `Successfully deleted ${count} keys` })
    } catch (err: any) {
      addToast({ type: 'error', message: err?.message || 'Failed to bulk delete keys' })
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const activeCount = keys.filter(k => k.is_active && !k.is_exhausted && !k.error_message).length
  const exhaustedCount = keys.filter(k => k.is_exhausted || (!k.is_active && !k.error_message)).length
  const invalidCount = keys.filter(k => Boolean(k.error_message)).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <span className="text-base">{iconEmoji}</span>
              <span>{title}</span>
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-text-secondary border border-white/5">
              {activeCount} Active
            </span>
            {isPaused ? (
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                PAUSED
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Running
              </span>
            )}
            {lastScrapedAt && (() => {
              const scrapeTiming = formatScrapeTiming(lastScrapedAt)
              return (
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-text-secondary border border-white/5 flex items-center gap-1"
                  title={`Last scrape performed: ${scrapeTiming.formatted}`}
                >
                  <ClockIcon className="w-3 h-3 text-accent-mint" />
                  <span>Last scrape: <strong className="text-white font-semibold">{scrapeTiming.relative}</strong></span>
                </span>
              )
            })()}
          </div>
          <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {onTogglePause && (
            <button
              type="button"
              disabled={isTogglingPause}
              onClick={handleTogglePause}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                isPaused
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/40'
              }`}
            >
              <span>{isPaused ? '▶️' : '⏸️'}</span>
              <span>{isPaused ? `Resume ${title}` : `Pause ${title}`}</span>
            </button>
          )}

          <button
            onClick={() => setIsBulkMode(!isBulkMode)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
              isBulkMode
                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                : 'bg-accent-mint text-black hover:bg-accent-mint/90'
            }`}
          >
            {isBulkMode ? (
              <>
                <KeyIcon className="w-3.5 h-3.5" />
                <span>Single Key</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Bulk Add Keys</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isPaused && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 flex items-center gap-2.5">
          <span className="text-base">⏸️</span>
          <div>
            <span className="font-bold">{title} is currently paused.</span>
            <span className="text-amber-300/80 ml-1.5">
              Scraping jobs will bypass this provider and route to active fallback engines until resumed.
            </span>
          </div>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 p-1 bg-surface-elevated/70 border border-white/5 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setIsBulkMode(false)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all ${
            !isBulkMode
              ? 'bg-accent-mint text-black font-bold shadow-sm'
              : 'text-text-secondary hover:text-white font-medium'
          }`}
        >
          <KeyIcon className="w-3.5 h-3.5" />
          <span>Single Key</span>
        </button>
        <button
          type="button"
          onClick={() => setIsBulkMode(true)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all ${
            isBulkMode
              ? 'bg-accent-mint text-black font-bold shadow-sm'
              : 'text-text-secondary hover:text-white font-medium'
          }`}
        >
          <span>⚡</span>
          <span>Bulk Add (Paste List / Message)</span>
        </button>
      </div>

      {isBulkMode ? (
        <div className="p-4 rounded-xl bg-surface-elevated/60 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-primary flex items-center gap-2">
              <span>Paste Tokens / Message</span>
              <span className="text-[10px] text-text-secondary font-normal">
                (Format: <code className="text-accent-mint">T1: token...</code> or one token per line)
              </span>
            </label>
            {parsedPreview.length > 0 && (
              <span className="text-[11px] font-semibold text-accent-mint bg-accent-mint/10 border border-accent-mint/20 px-2.5 py-0.5 rounded-full">
                {parsedPreview.length} token{parsedPreview.length > 1 ? 's' : ''} detected
              </span>
            )}
          </div>

          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={`Account 1: ${placeholder}\nAccount 2: ${placeholder}`}
            rows={5}
            className="w-full bg-surface border border-white/10 text-white font-mono text-xs rounded-xl outline-none focus:ring-1 focus:ring-accent-mint/50 transition-all p-3 resize-y placeholder:text-zinc-600"
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-text-secondary">
              {parsedPreview.length > 0 ? (
                <span>
                  Labels detected:{' '}
                  <span className="text-white font-medium">
                    {parsedPreview.map((p) => p.label).slice(0, 4).join(', ')}
                    {parsedPreview.length > 4 ? ` (+${parsedPreview.length - 4} more)` : ''}
                  </span>
                </span>
              ) : (
                <span>Paste your token list or message above to preview</span>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => {
                  setBulkText('')
                  setIsBulkMode(false)
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAdd}
                disabled={isBulkAdding || parsedPreview.length === 0}
                className="px-5 py-2 rounded-xl bg-accent-mint text-black text-xs font-bold hover:bg-accent-mint/90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-accent-mint/10"
              >
                {isBulkAdding ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    <span>Add All {parsedPreview.length > 0 ? `(${parsedPreview.length})` : ''} Tokens</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1 block">
                API Key / Token
              </label>
              <input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                onPaste={handleKeyPaste}
                placeholder={placeholder}
                className="w-full bg-surface-elevated border border-white/5 text-white rounded-xl outline-none focus:ring-1 focus:ring-accent-mint/50 transition-all px-4 py-2.5 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1 block">
                Label
              </label>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Account 1 (Primary)"
                className="w-full bg-surface-elevated border border-white/5 text-white rounded-xl outline-none focus:ring-1 focus:ring-accent-mint/50 transition-all px-4 py-2.5 text-sm"
              />
            </div>
            <button
              onClick={addKey}
              disabled={!newKey.trim() || isAddingKey}
              className="px-5 py-2.5 rounded-xl bg-accent-mint text-black text-sm font-bold hover:bg-accent-mint/90 transition-all disabled:opacity-50 flex items-center justify-center min-w-[48px]"
              title={`Add ${title}`}
            >
              {isAddingKey ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                <PlusIcon className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setIsBulkMode(true)}
              className="text-[11px] text-text-secondary hover:text-accent-mint transition-colors flex items-center gap-1.5"
            >
              <span>⚡ Have multiple tokens? Click to Bulk Add</span>
            </button>
          </div>
        </div>
      )}

      {/* Action / Selection Bar */}
      {keys.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 bg-surface-elevated/40 border border-white/[0.06] rounded-xl mb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-text-secondary hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={selectedIds.length === keys.length && keys.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds(keys.map((k) => k.id).filter(Boolean))
                  } else {
                    setSelectedIds([])
                  }
                }}
                className="w-4 h-4 rounded border-white/20 bg-surface text-accent-mint focus:ring-accent-mint/30 focus:ring-offset-0 cursor-pointer accent-emerald-500"
              />
              <span>Select All ({keys.length})</span>
            </label>

            {/* Badges */}
            <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                {activeCount} Active
              </span>
              {exhaustedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-3 h-3" />
                  {exhaustedCount} Quota Exhausted
                </span>
              )}
              {invalidCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-semibold flex items-center gap-1">
                  <XCircleIcon className="w-3 h-3" />
                  {invalidCount} Invalid / 401
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {invalidCount > 0 && selectedIds.length === 0 && (
              <button
                type="button"
                onClick={() => {
                  const invalidIds = keys.filter((k) => Boolean(k.error_message)).map((k) => k.id)
                  setSelectedIds(invalidIds)
                }}
                className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-semibold transition-all"
              >
                Select Invalid Only ({invalidCount})
              </button>
            )}
            {exhaustedCount > 0 && selectedIds.length === 0 && (
              <button
                type="button"
                onClick={() => {
                  const exhaustedIds = keys.filter((k) => k.is_exhausted || !k.is_active).map((k) => k.id)
                  setSelectedIds(exhaustedIds)
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[11px] font-semibold transition-all"
              >
                Select Exhausted Only
              </button>
            )}
            {selectedIds.length > 0 ? (
              <>
                <span className="text-xs text-text-secondary font-medium mr-1">
                  {selectedIds.length} of {keys.length} selected
                </span>
                <button
                  type="button"
                  onClick={() => handleBulkDelete(false)}
                  disabled={isBulkDeleting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isBulkDeleting ? (
                    <>
                      <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-3.5 h-3.5" />
                      <span>Delete Selected ({selectedIds.length})</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleBulkDelete(true)}
                disabled={isBulkDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-text-secondary hover:text-red-400 border border-white/5 hover:border-red-500/20 text-xs font-medium transition-all disabled:opacity-50"
                title="Delete all keys at once"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span>Delete All Keys</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Keys List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="py-8 text-center text-text-secondary flex items-center justify-center gap-2">
            <ArrowPathIcon className="w-4 h-4 animate-spin text-accent-mint" />
            <span>Loading {title}...</span>
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-8 bg-surface-elevated/20 border border-white/[0.04] rounded-xl text-text-secondary">
            <p className="text-sm">No credentials added yet for {title}</p>
            <p className="text-xs text-text-secondary/60 mt-1">Add your first key above to activate {title}</p>
          </div>
        ) : (
          keys.map((k) => {
            const isDeleting = deletingKeyId === k.id
            const isSelected = selectedIds.includes(k.id)
            const isInvalid = Boolean(k.error_message)
            const isExhausted = !isInvalid && (k.is_exhausted || !k.is_active)

            return (
              <div
                key={k.id}
                className={`flex items-start sm:items-center justify-between rounded-xl p-3.5 sm:px-4 sm:py-3 border transition-all ${
                  isInvalid
                    ? 'bg-red-950/20 border-red-500/30 shadow-sm shadow-red-950/20'
                    : isExhausted
                    ? 'bg-amber-950/15 border-amber-500/30 shadow-sm shadow-amber-950/10'
                    : isSelected
                    ? 'bg-accent-mint/[0.04] border-accent-mint/30 shadow-sm'
                    : 'bg-surface-elevated/50 border-white/[0.03]'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation()
                      setSelectedIds((prev) =>
                        e.target.checked ? [...prev, k.id] : prev.filter((id) => id !== k.id)
                      )
                    }}
                    className="w-4 h-4 mt-0.5 sm:mt-0 rounded border-white/20 bg-surface text-accent-mint focus:ring-accent-mint/30 focus:ring-offset-0 cursor-pointer accent-emerald-500 flex-shrink-0"
                  />

                  {/* Status Icon */}
                  {isInvalid ? (
                    <XCircleIcon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                  ) : isExhausted ? (
                    <ExclamationTriangleIcon className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                  ) : (
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isInvalid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 uppercase tracking-wider">
                          <XCircleIcon className="w-3 h-3" />
                          Invalid Token
                        </span>
                      ) : isExhausted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                          <ExclamationTriangleIcon className="w-3 h-3" />
                          Quota Exhausted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                          Active
                        </span>
                      )}

                      <span className="text-sm font-semibold text-text-primary">
                        {k.label || k.key.substring(0, 16)}
                      </span>

                      <span className="text-[11px] font-mono text-text-secondary/70">
                        ({k.key.substring(0, 8)}...{k.key.substring(Math.max(0, k.key.length - 4))})
                      </span>
                    </div>

                    {isInvalid && (
                      <p className="text-[11px] text-red-400 font-medium flex items-center gap-1 mt-1">
                        <span>Error:</span>
                        <span className="font-semibold">{k.error_message}</span>
                      </p>
                    )}
                    {isExhausted && (
                      <p className="text-[11px] text-amber-300/90 font-medium flex items-center gap-1 mt-1">
                        <span>Account limit reached:</span>
                        <span className="font-normal text-text-secondary">
                          {k.error_message || 'Free monthly request limit exhausted. Add another key or upgrade account.'}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => testKey(k.key)}
                    disabled={testingKey === k.key}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/5 text-[11px] font-semibold transition-all disabled:opacity-50"
                    title="Verify key with provider and check remaining credits"
                  >
                    {testingKey === k.key ? (
                      <>
                        <ArrowPathIcon className="w-3 h-3 animate-spin text-accent-mint" />
                        <span>Checking...</span>
                      </>
                    ) : (
                      <span>Test Key</span>
                    )}
                  </button>

                  <button
                    onClick={() => deleteKey(k.id)}
                    disabled={isDeleting || isBulkDeleting}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-all disabled:opacity-50 flex-shrink-0"
                    title="Delete key"
                  >
                    {isDeleting ? (
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
