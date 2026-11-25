'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon, LifebuoyIcon } from '@heroicons/react/24/solid'
import { Badge, Select, CustomLoader } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { getFirebaseToken } from '@/lib/firebase'

interface AdminTicket {
  id: string
  subject: string
  category: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  userId: string
  user: { name: string; email: string; plan: string }
  _count: { messages: number }
}

const statusColor: Record<string, 'mint' | 'purple'> = {
  OPEN: 'mint',
  IN_PROGRESS: 'purple',
  RESOLVED: 'purple',
  CLOSED: 'purple',
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<AdminTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const { addToast } = useToast()

  const load = async () => {
    try {
      const token = await getFirebaseToken()
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      if (priority) params.set('priority', priority)
      if (category) params.set('category', category)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/support/tickets?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const json = await res.json()
      if (json.data) setTickets(json.data)
    } catch {
      addToast({ type: 'error', message: 'Failed to load tickets' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, priority, category])

  const runSearch = () => {
    setLoading(true)
    load()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <h2 className="min-w-0 text-xl sm:text-2xl font-bold text-text-primary tracking-tight flex items-center gap-3">
          <LifebuoyIcon className="w-6 h-6 shrink-0 text-text-secondary" />
          Support Tickets
        </h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="relative w-full sm:w-64 sm:flex-1 sm:max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder="Search subject, name, email..."
            className="w-full bg-surface-secondary/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-border-subtle transition-all"
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            value={status}
            onChange={(v) => setStatus(v)}
            size="sm"
            placeholder="Status"
            options={[
              { label: 'Open', value: 'OPEN' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Resolved', value: 'RESOLVED' },
              { label: 'Closed', value: 'CLOSED' },
            ]}
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            value={priority}
            onChange={(v) => setPriority(v)}
            size="sm"
            placeholder="Priority"
            options={[
              { label: 'Low', value: 'low' },
              { label: 'Normal', value: 'normal' },
              { label: 'High', value: 'high' },
              { label: 'Urgent', value: 'urgent' },
            ]}
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            value={category}
            onChange={(v) => setCategory(v)}
            size="sm"
            placeholder="Category"
            options={[
              { label: 'Bug', value: 'bug' },
              { label: 'General', value: 'general' },
              { label: 'Billing', value: 'billing' },
              { label: 'Leads', value: 'leads' },
              { label: 'Account', value: 'account' },
              { label: 'Technical', value: 'technical' },
            ]}
          />
        </div>
      </div>

      {/* Queue */}
      <div className="metallic-card overflow-hidden">
        {tickets.length === 0 && !loading && (
          <div className="p-8 text-center sm:p-14">
            <LifebuoyIcon className="w-8 h-8 text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary text-sm">No tickets match.</p>
          </div>
        )}

        {tickets.length > 0 && (
          <div className="divide-y divide-white/[0.03]">
            {tickets.map((ticket, i) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.03 }}
                className="grid grid-cols-12 gap-x-2 gap-y-2 px-4 py-4 items-center hover:bg-white/[0.02] transition-colors sm:gap-4 sm:px-8"
              >
                <div className="col-span-1 flex items-center">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      ticket.status === 'OPEN'
                        ? 'bg-accent-mint'
                        : ticket.status === 'IN_PROGRESS'
                          ? 'bg-accent-purple'
                          : 'bg-white/20'
                    }`}
                  />
                </div>
                <div className="col-span-11 min-w-0 sm:col-span-5">
                  <Link
                    href={`/admin/support/${ticket.id}`}
                    className="block break-words group-hover:text-accent-mint transition-colors"
                  >
                    <div className="text-sm font-bold text-text-primary">{ticket.subject}</div>
                    <div className="text-xxs text-text-secondary mt-0.5 flex items-center gap-2 capitalize">
                      {ticket.category}
                      {ticket.category === 'bug' && (
                        <Badge size="sm" color="purple">BUG</Badge>
                      )}
                    </div>
                  </Link>
                </div>
                <div className="col-span-12 min-w-0 sm:col-span-3">
                  <Link
                    href={`/admin/users/${ticket.userId}`}
                    title="Open user details"
                    className="text-sm font-medium text-text-primary hover:text-accent-mint hover:underline transition-colors"
                  >
                    {ticket.user.name}
                  </Link>
                  <div className="break-all text-xxs text-text-secondary">{ticket.user.email}</div>
                </div>
                <div className="col-span-4 sm:col-span-1">
                  <Badge size="sm" color={statusColor[ticket.status] || 'purple'}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="col-span-4 sm:col-span-1">
                  <span className={`text-xxs font-bold uppercase tracking-wide ${
                    ticket.priority === 'urgent'
                      ? 'text-accent-mint'
                      : ticket.priority === 'high'
                        ? 'text-accent-purple'
                        : 'text-text-secondary'
                  }`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="col-span-4 text-right text-xxs text-text-secondary sm:col-span-1">
                  {ticket._count.messages}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {loading && <CustomLoader page="admin" />}
      </div>
    </div>
  )
}