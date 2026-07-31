'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import {
  SparklesIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  BoltIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AppLead } from '@/types/lead'
import { Badge, Button, CustomLoader } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { getFirebaseToken } from '@/lib/firebase'

interface ThreadEmail {
  id: string
  subject: string
  body: string
  direction: string
  sentAt: string
}

const ANGLES = ['Curiosity', 'Authority', 'Humor'] as const
type Angle = (typeof ANGLES)[number]

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (sameDay) return `Today · ${time}`
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday · ${time}`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` · ${time}`
}

function OutreachWorkspace() {
  const searchParams = useSearchParams()
  const leadId = searchParams.get('leadId')
  const { addToast } = useToast()

  const [lead, setLead] = useState<AppLead | null>(null)
  const [thread, setThread] = useState<ThreadEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [angle, setAngle] = useState<Angle>('Curiosity')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null)

  const loadThread = useCallback(async () => {
    if (!leadId) return
    try {
      const token = await getFirebaseToken()
      const res = await fetch(`/api/outreach/thread?leadId=${encodeURIComponent(leadId)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const json = await res.json()
      if (res.ok && Array.isArray(json.data)) setThread(json.data)
    } catch {
      // thread is non-critical; ignore failures
    }
  }, [leadId])

  useEffect(() => {
    let cancelled = false
    const loadLead = async () => {
      if (!leadId) {
        setLoading(false)
        return
      }
      try {
        const token = await getFirebaseToken()
        const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const json = await res.json()
        if (res.ok && json.data) {
          if (!cancelled) setLead(json.data)
        } else {
          addToast({ type: 'error', message: json.message || 'Failed to load lead' })
        }
      } catch {
        addToast({ type: 'error', message: 'Failed to load lead' })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadLead()
    loadThread()
    return () => {
      cancelled = true
    }
  }, [leadId, loadThread, addToast])

  const handleGenerate = async () => {
    if (!leadId || generating) return
    setGenerating(true)
    try {
      const token = await getFirebaseToken()
      const res = await fetch('/api/outreach/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ leadId, angle }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setBody(json.content)
        if (typeof json.creditsRemaining === 'number') setCreditsRemaining(json.creditsRemaining)
        addToast({ type: 'success', message: '✓ Draft generated' })
      } else if (json.code === 'INSUFFICIENT_CREDITS') {
        addToast({ type: 'error', message: 'Not enough credits to generate a draft (2 credits)' })
      } else if (json.code === 'FORBIDDEN') {
        addToast({ type: 'error', message: 'Reveal this lead before using AI outreach' })
      } else if (json.code === 'RATE_LIMITED') {
        addToast({ type: 'error', message: 'Too many requests — try again shortly' })
      } else {
        addToast({ type: 'error', message: json.message || 'Failed to generate draft' })
      }
    } catch {
      addToast({ type: 'error', message: 'Network error during generation' })
    } finally {
      setGenerating(false)
    }
  }

  const handleSend = async () => {
    if (!leadId || sending) return
    if (!subject.trim() || !body.trim()) {
      addToast({ type: 'error', message: 'Add a subject and message body' })
      return
    }
    setSending(true)
    try {
      const token = await getFirebaseToken()
      const res = await fetch('/api/outreach/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ leadId, subject, body }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        addToast({ type: 'success', message: '✓ Message sent' })
        await loadThread()
      } else if (json.code === 'INSUFFICIENT_CREDITS') {
        addToast({ type: 'error', message: 'Not enough credits to send (1 credit)' })
      } else if (json.code === 'RATE_LIMITED') {
        addToast({ type: 'error', message: 'Too many requests — try again shortly' })
      } else {
        addToast({ type: 'error', message: json.message || 'Failed to send message' })
      }
    } catch {
      addToast({ type: 'error', message: 'Network error while sending' })
    } finally {
      setSending(false)
    }
  }

  if (loading) return <CustomLoader page="outreach" />

  if (!leadId) {
    return (
      <main className="flex-1 flex items-center justify-center px-8 relative overflow-hidden">
        <div className="relative z-10 max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center mx-auto">
            <SparklesIcon className="w-8 h-8 text-accent-purple" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            AI Outreach Console
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed">
            Open a lead from your pipeline to generate, edit, and send AI-drafted outreach.
          </p>
          <div className="pt-4">
            <Link href="/saved">
              <Button variant="primary" color="mint" size="md">
                Go to Saved Leads
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const statusColor: Record<string, 'mint' | 'purple'> = {
    saved: 'mint',
    drafting: 'mint',
    sent: 'purple',
    replied: 'purple',
    'follow-up': 'purple',
  }

  return (
    <main className="flex-1 overflow-y-auto px-8 py-10 relative">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] glow-purple-medium pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] glow-mint-soft pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/saved"
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-accent-mint hover:border-accent-mint/20 transition-all"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-3">
              <SparklesIcon className="w-6 h-6 text-accent-purple" />
              AI Outreach Console
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Draft with AI, edit, then send. Generation costs 2 credits · Send costs 1 credit.
            </p>
          </div>
        </div>

        {lead ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="metallic-card p-6 mb-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-elevated border border-white/10 flex items-center justify-center text-sm font-bold text-text-primary overflow-hidden shrink-0">
                  {lead.isRevealed
                    ? lead.name.split(' ').map((n) => n[0]).join('').slice(0, 2)
                    : '??'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-text-primary truncate">
                      {lead.isRevealed ? lead.name : 'Unlocked Contact'}
                    </h2>
                    <Badge size="sm" color={statusColor[lead.status] || 'mint'}>
                      {lead.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-text-secondary truncate mt-0.5">
                    {lead.isRevealed && lead.email ? lead.email : 'unlocked@leadhunterclub.com'}
                    {lead.company ? ` · ${lead.company}` : ''}
                    {lead.source ? ` · ${lead.source}` : ''}
                  </div>
                </div>
                {creditsRemaining !== null && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent-mint/10 border border-accent-mint/20">
                    <BoltIcon className="w-4 h-4 text-accent-mint" />
                    <span className="text-xs font-bold text-accent-mint">
                      {creditsRemaining} credits left
                    </span>
                  </div>
                )}
              </div>
              {lead.signalContext && (
                <div className="mt-4 pt-4 border-t border-white/[0.05]">
                  <div className="text-xxs font-bold uppercase tracking-widest text-text-secondary mb-2">
                    Buying Signal
                  </div>
                  <p className="text-sm text-text-primary/80 leading-relaxed line-clamp-3">
                    {lead.signalContext}
                  </p>
                </div>
              )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="lg:col-span-3 metallic-card p-6"
              >
                <div className="text-xxs font-bold uppercase tracking-widest text-text-secondary mb-4">
                  Compose
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-text-primary mb-2">
                    Outreach Angle
                  </label>
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5 w-fit">
                    {ANGLES.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAngle(a)}
                        className={`px-4 py-2 rounded-lg text-11 font-bold uppercase tracking-widest transition-all ${
                          angle === a
                            ? 'bg-accent-purple text-text-on-accent shadow-lg'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="outreach-subject" className="block text-xs font-bold text-text-primary mb-2">
                    Subject
                  </label>
                  <input
                    id="outreach-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="A subject line for your message..."
                    className="w-full bg-surface-secondary/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-border-subtle transition-all text-text-primary placeholder:text-text-secondary/50"
                  />
                </div>

                <div className="mb-2">
                  <label htmlFor="outreach-body" className="block text-xs font-bold text-text-primary mb-2">
                    Message
                  </label>
                  <textarea
                    id="outreach-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your message, or hit Generate for an AI draft..."
                    rows={12}
                    className="w-full bg-surface-secondary/50 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-border-subtle transition-all text-text-primary placeholder:text-text-secondary/50 resize-y leading-relaxed"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Button
                    variant="outline"
                    color="purple"
                    size="md"
                    onClick={handleGenerate}
                    loading={generating}
                    disabled={sending}
                  >
                    {!generating && <SparklesIcon className="w-4 h-4" />}
                    Generate Draft (2 credits)
                  </Button>
                  <Button
                    variant="primary"
                    color="mint"
                    size="md"
                    onClick={handleSend}
                    loading={sending}
                    disabled={generating}
                  >
                    {!sending && <PaperAirplaneIcon className="w-4 h-4" />}
                    Send Message (1 credit)
                  </Button>
                  {body && (
                    <button
                      onClick={() => {
                        setBody('')
                        setSubject('')
                      }}
                      className="text-11 font-bold uppercase tracking-widest text-text-secondary hover:text-red-400 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="lg:col-span-2 metallic-card p-6 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xxs font-bold uppercase tracking-widest text-text-secondary">
                    Conversation
                  </div>
                  <button
                    onClick={loadThread}
                    className="p-1.5 rounded-lg text-text-secondary hover:text-accent-mint hover:bg-accent-mint/10 transition-all"
                    aria-label="Refresh thread"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                  </button>
                </div>

                {thread.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                      <ChatBubbleLeftRightIcon className="w-6 h-6 text-text-secondary" />
                    </div>
                    <p className="text-xs text-text-secondary">
                      No messages yet. Send your first outreach to start the conversation.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 space-y-4 overflow-y-auto max-h-[560px] pr-1">
                    {thread.map((email) => (
                      <div
                        key={email.id}
                        className={`rounded-xl border p-4 ${
                          email.direction === 'outbound'
                            ? 'bg-accent-purple/[0.06] border-accent-purple/20'
                            : 'bg-accent-mint/[0.06] border-accent-mint/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <EnvelopeIcon
                              className={`w-4 h-4 shrink-0 ${
                                email.direction === 'outbound'
                                  ? 'text-accent-purple'
                                  : 'text-accent-mint'
                              }`}
                            />
                            <span className="text-11 font-bold uppercase tracking-widest text-text-primary truncate">
                              {email.direction === 'outbound' ? 'You' : 'Lead'} ·{' '}
                              {email.subject || 'No subject'}
                            </span>
                          </div>
                          <span className="text-[10px] text-text-secondary shrink-0">
                            {formatTimestamp(email.sentAt)}
                          </span>
                        </div>
                        <p className="text-xs text-text-primary/80 leading-relaxed whitespace-pre-wrap">
                          {email.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </>
        ) : (
          <div className="metallic-card p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-text-secondary" />
            </div>
            <p className="text-text-secondary text-sm">Lead not found or unavailable.</p>
            <div className="mt-4">
              <Link href="/saved">
                <Button variant="primary" color="mint" size="md">
                  Back to Saved Leads
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function OutreachPage() {
  return (
    <Suspense fallback={<CustomLoader page="outreach" />}>
      <OutreachWorkspace />
    </Suspense>
  )
}
