'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid'

function AlertsUnsubscribeContent() {
  const params = useSearchParams()
  const emailParam = params.get('email')
  const [email] = useState(emailParam || '')
  const [status, setStatus] = useState<'loading' | 'unsubscribed' | 'resubscribed' | 'invalid'>('loading')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!emailParam || !emailParam.includes('@')) {
      setStatus('invalid')
      return
    }

    // Auto-unsubscribe on page load
    fetch(`/api/alerts/unsubscribe?email=${encodeURIComponent(emailParam)}&action=unsubscribe`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setStatus('unsubscribed')
        } else {
          setStatus('invalid')
        }
      })
      .catch(() => setStatus('invalid'))
  }, [emailParam])

  const handleToggle = async (targetAction: 'resubscribe' | 'unsubscribe') => {
    if (!email) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/alerts/unsubscribe?email=${encodeURIComponent(email)}&action=${targetAction}`)
      const data = await res.json()
      if (data?.success) {
        setStatus(targetAction === 'resubscribe' ? 'resubscribed' : 'unsubscribed')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center px-4 py-12">
      <div className="metallic-card max-w-md w-full p-8 sm:p-10 text-center space-y-6">
        {/* Status Icon */}
        <div className="flex justify-center">
          {status === 'loading' && (
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-mint animate-spin">
              <ArrowPathIcon className="w-7 h-7" />
            </div>
          )}
          {status === 'unsubscribed' && (
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
          )}
          {status === 'resubscribed' && (
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
          )}
          {status === 'invalid' && (
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <XCircleIcon className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {status === 'loading' && 'Updating Preferences...'}
            {status === 'unsubscribed' && 'Unsubscribed from Lead Alerts'}
            {status === 'resubscribed' && 'Lead Alerts Re-Enabled'}
            {status === 'invalid' && 'Invalid Unsubscribe Link'}
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            {status === 'loading' && 'Please wait while we update your email preferences.'}
            {status === 'unsubscribed' && (
              <>
                You will no longer receive automated email alerts when new leads are approved on Lead Hunter.
                {email && (
                  <span className="block mt-1 font-mono text-xs text-text-primary/80">({email})</span>
                )}
              </>
            )}
            {status === 'resubscribed' && (
              <>
                You will continue receiving email alerts whenever verified 3-lead batches drop on the platform.
                {email && (
                  <span className="block mt-1 font-mono text-xs text-text-primary/80">({email})</span>
                )}
              </>
            )}
            {status === 'invalid' &&
              'This link appears to be missing a valid email address. You can update your alert settings directly inside your account.'}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          {status === 'unsubscribed' && (
            <button
              onClick={() => handleToggle('resubscribe')}
              disabled={actionLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-text-primary border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {actionLoading ? 'Updating...' : 'Undo — Re-enable Lead Drop Emails'}
            </button>
          )}

          {status === 'resubscribed' && (
            <button
              onClick={() => handleToggle('unsubscribe')}
              disabled={actionLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {actionLoading ? 'Updating...' : 'Turn Emails Back OFF'}
            </button>
          )}

          <div className="flex items-center gap-3">
            <Link
              href="/leads"
              className="flex-1 py-3 px-4 rounded-xl bg-accent-mint hover:bg-accent-mint/90 text-text-on-accent text-xs font-bold transition-all text-center"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/settings"
              className="flex-1 py-3 px-4 rounded-xl bg-surface-elevated/40 hover:bg-surface-elevated/60 text-text-primary text-xs font-semibold border border-subtle transition-all text-center"
            >
              Account Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AlertsUnsubscribePage() {
  return (
    <Suspense>
      <AlertsUnsubscribeContent />
    </Suspense>
  )
}
