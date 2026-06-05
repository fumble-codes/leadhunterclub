'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ValidationError } from '@/lib/api/errors'
import { motion } from 'framer-motion'
import { ShieldCheck, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) { setError('Name is required'); return }
    if (!email.trim()) { setError('Email is required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      await register(name, email, password)
      router.replace('/dashboard')
    } catch (err) {
      if (err instanceof ValidationError) {
        const msgs = Object.values(err.details || {}).flat()
        setError(msgs.length > 0 ? msgs[0] : 'Invalid input')
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-bg-main flex items-center justify-center px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-purple/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <img src="/logo.svg" alt="Lead Hunter Club" className="w-12 h-12 rounded-xl mx-auto mb-4 shadow-[0_0_20px_rgba(167,139,250,0.1)]" />
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Create your account</h1>
          <p className="text-sm text-text-secondary mt-2">Start intercepting high-intent leads</p>
        </div>

        <div className="glass-panel rounded-[24px] border-subtle bg-surface/40 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Alex Hunter"
                className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-subtle text-text-primary text-sm placeholder-text-secondary/30 outline-none focus:ring-1 focus:ring-accent-purple/50 focus:border-accent-purple/50 transition-all"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="hunter@leadhunterclub.com"
                className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-subtle text-text-primary text-sm placeholder-text-secondary/30 outline-none focus:ring-1 focus:ring-accent-purple/50 focus:border-accent-purple/50 transition-all"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-surface-elevated border border-subtle text-text-primary text-sm placeholder-text-secondary/30 outline-none focus:ring-1 focus:ring-accent-purple/50 focus:border-accent-purple/50 transition-all"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/50 hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-accent-purple text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-accent-purple/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(167,139,250,0.15)]"
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-xs text-text-secondary">
              Already have an account?{' '}
              <Link href="/login" className="text-accent-purple font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8">
          <ShieldCheck size={12} className="text-text-secondary/40" />
          <span className="text-[10px] text-text-secondary/40">Free tier includes 50 trial tokens</span>
        </div>
      </motion.div>
    </main>
  )
}
