'use client'

import { useState, useEffect } from 'react'
import { getFirebaseToken } from '@/lib/firebase'
import {
  KeyIcon, PlusIcon, TrashIcon, ShieldCheckIcon, ShieldExclamationIcon,
} from '@heroicons/react/24/solid'
import { CustomLoader } from '@/components/ui/CustomLoader'



interface ApifyKey {
  _id: string
  id: string
  key: string
  label: string | null
  is_active: boolean
  comments_used: number
  comments_limit: number
  comments_remaining: number
  assigned_worker: string | null
}

export default function AdminTokensPage() {
  const [tokens, setTokens] = useState<ApifyKey[]>([])
  const [loading, setLoading] = useState(true)
  const [newKey, setNewKey] = useState('')
  const [newLabel, setNewLabel] = useState('')

  const fetchTokens = async () => {
    const token = await getFirebaseToken()
    if (!token) return
    try {
      const res = await fetch('/api/admin/apify-keys', { headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json()
      setTokens(json.data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTokens() }, [])

  const addKey = async () => {
    if (!newKey.trim()) return
    const token = await getFirebaseToken()
    const res = await fetch('/api/admin/apify-keys', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: newKey.trim(), label: newLabel.trim() || undefined }),
    })
    if (res.ok) {
      setNewKey(''); setNewLabel('')
      fetchTokens()
    }
  }

  const deleteKey = async (id: string) => {
    const token = await getFirebaseToken()
    await fetch(`/api/admin/apify-keys/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchTokens()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">API Keys & Tokens</h1>
        <p className="text-sm text-text-secondary mt-1">Manage scraping and enrichment service credentials</p>
      </div>

      {loading ? (
        <CustomLoader page="admin" />
      ) : (
        <div className="space-y-6">
          <div className="bg-surface/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <KeyIcon className="w-4 h-4 text-accent-mint" />Apify API Keys
            </h2>
            <div className="flex items-end gap-3 mb-6">
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1 block">API Key</label>
                <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="apify_api_..."
                  className="w-full bg-surface-elevated border border-white/5 text-white rounded-xl outline-none focus:ring-1 focus:ring-accent-mint/50 transition-all px-4 py-2.5 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1 block">Label</label>
                <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="My Key"
                  className="w-full bg-surface-elevated border border-white/5 text-white rounded-xl outline-none focus:ring-1 focus:ring-accent-mint/50 transition-all px-4 py-2.5 text-sm"
                />
              </div>
              <button onClick={addKey} disabled={!newKey.trim()}
                className="px-5 py-2.5 rounded-xl bg-accent-mint text-white text-sm font-medium hover:bg-accent-mint/90 transition-all disabled:opacity-50">
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {tokens.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-6">No API keys added yet</p>
              ) : tokens.map(k => (
                <div key={k._id || k.id} className="flex items-center justify-between bg-surface-elevated/50 rounded-xl px-4 py-3 border border-white/[0.03]">
                  <div className="flex items-center gap-3">
                    {k.is_active ? <ShieldCheckIcon className="w-4 h-4 text-green-400" /> : <ShieldExclamationIcon className="w-4 h-4 text-gray-500" />}
                    <div>
                      <p className="text-sm font-medium text-text-primary">{k.label || k.key.substring(0, 20)}...</p>
                      <p className="text-[10px] text-text-secondary">
                        Used: {k.comments_used}/{k.comments_limit} | Remaining: {k.comments_remaining}
                        {k.assigned_worker && <> | Worker: {k.assigned_worker}</>}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => deleteKey(k._id || k.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-all">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
