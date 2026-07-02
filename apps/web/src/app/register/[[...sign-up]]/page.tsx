'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 800)
  }

  return (
    <main className="min-h-screen bg-bg-main flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Backlight Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(234,88,12,0.08)_0%,transparent_60%)] pointer-events-none" />

      {/* Back to Home Link */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-8 left-8 z-20"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-white transition-colors group"
        >
          <ArrowLeftIcon className="w-[14px] h-[14px] group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md flex flex-col items-center"
      >
        <div className="text-center mb-8">
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Lead Hunter Club"
              width={48}
              height={48}
              className="w-12 h-12 rounded-xl mx-auto mb-4 shadow-[0_0_20px_rgba(234,88,12,0.15)] hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Create your account</h1>
          <p className="text-sm text-text-secondary mt-2">Start dominating your outreach today</p>
        </div>

        <div className="bg-surface/40 backdrop-blur-xl border border-white/[0.06] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-full p-8">
          <form onSubmit={handleDemoLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Email address</label>
              <input 
                type="email" 
                defaultValue="demo@leadhunterclub.com"
                className="bg-surface-elevated border border-white/5 text-white rounded-xl outline-none focus:ring-1 focus:ring-accent-crimson/50 transition-all px-4 py-3" 
                required 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                defaultValue="password123"
                className="bg-surface-elevated border border-white/5 text-white rounded-xl outline-none focus:ring-1 focus:ring-accent-crimson/50 transition-all px-4 py-3" 
                required 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-2 bg-accent-crimson hover:bg-accent-crimson/90 text-white rounded-xl active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(234,88,12,0.15)] px-4 py-3 font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-text-secondary">
                Already have an account?{' '}
                <Link href="/login" className="text-accent-crimson hover:text-accent-crimson/80 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </main>
  )
}
