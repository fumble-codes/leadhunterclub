'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { UserIcon, EnvelopeIcon, BanknotesIcon, BoltIcon, ArrowTopRightOnSquareIcon, CheckCircleIcon, LockClosedIcon, CalendarIcon, StarIcon } from '@heroicons/react/24/solid'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.name || '')

  const handleSaveProfile = () => {
    setIsEditing(false)
  }

  return (
      <main className="flex-1 overflow-y-auto px-10 py-12 relative">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] glow-mint-soft pointer-events-none" />

        <div className="max-w-[1000px] mx-auto relative z-10">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-text-primary tracking-tight">Settings</h1>
            <p className="text-text-secondary mt-2">Manage your account, credits, and subscription.</p>
          </div>

          <div className="space-y-6">

            {/* Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-[24px] border-subtle bg-surface/40 p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-surface-secondary border border-border-subtle flex items-center justify-center font-bold text-text-secondary hover:text-text-primary transition-colors text-xl">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">Profile</h2>
                    <p className="text-sm text-text-secondary">Your personal information</p>
                  </div>
                </div>
                <button
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isEditing
                      ? 'bg-accent-mint text-text-on-accent hover:bg-surface-secondary'
                      : 'bg-white/5 text-text-secondary hover:text-text-primary hover:bg-white/10'
                  }`}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                    <UserIcon className="w-3 h-3 inline mr-1" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-subtle text-text-primary text-sm outline-none focus:ring-1 focus:ring-accent-mint/50"
                    />
                  ) : (
                    <p className="text-sm text-text-primary font-medium px-4 py-3 rounded-xl bg-surface-elevated/50 border border-subtle/50">
                      {user?.name || '—'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                    <EnvelopeIcon className="w-3 h-3 inline mr-1" />
                    Email
                  </label>
                  <p className="text-sm text-text-primary font-medium px-4 py-3 rounded-xl bg-surface-elevated/50 border border-subtle/50 flex items-center justify-between">
                    {user?.email || '—'}
                    <CheckCircleIcon className="w-[14px] h-[14px] text-text-secondary shrink-0" />
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                    <LockClosedIcon className="w-3 h-3 inline mr-1" />
                    Role
                  </label>
                  <p className="text-sm text-text-primary font-medium px-4 py-3 rounded-xl bg-surface-elevated/50 border border-subtle/50 capitalize">
                    {user?.role || 'user'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
                    <CalendarIcon className="w-3 h-3 inline mr-1" />
                    Member Since
                  </label>
                  <p className="text-sm text-text-primary font-medium px-4 py-3 rounded-xl bg-surface-elevated/50 border border-subtle/50">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Credits & Tokens */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-[24px] border-subtle bg-surface/40 p-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-xl bg-surface-secondary border border-border-subtle flex items-center justify-center">
                  <BanknotesIcon className="w-6 h-6 text-text-secondary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Credits & Tokens</h2>
                  <p className="text-sm text-text-secondary">Your intelligence token balance</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface-elevated/50 border border-subtle/50 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-text-secondary">Available Credits</span>
                  <span className="text-2xl font-bold text-text-primary">{user?.credits ?? 0}</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((user?.credits ?? 0) / 1000) * 100)}%` }}
                    className="h-full bg-accent-purple rounded-full"
                  />
                </div>
                <p className="text-[10px] text-text-secondary/50 mt-3">
                  Credits are consumed when revealing lead identities (3 credits) or generating AI outreach (1 credit).
                </p>
              </div>

              <button className="w-full py-3.5 rounded-xl bg-accent-purple text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-surface-secondary transition-all shadow-[0_0_20px_rgba(var(--rgb-tab-purple),0.15)] hover:bg-accent-purple/90">
                <BoltIcon className="w-4 h-4" />
                Refill Credits
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Subscription */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel rounded-[24px] border-subtle bg-surface/40 p-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center">
                  <StarIcon className="w-6 h-6 text-accent-purple" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Subscription</h2>
                  <p className="text-sm text-text-secondary">Your current plan and billing</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface-elevated/50 border border-subtle/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-text-primary uppercase tracking-wider">Hunter Plan</span>
                    <span className="px-2 py-0.5 rounded-md bg-surface-secondary border border-border-subtle text-[9px] font-bold text-text-secondary hover:text-text-primary transition-colors uppercase tracking-widest">Active</span>
                  </div>
                  <p className="text-xs text-text-secondary">₹999 / month · 1,000 credits monthly · Renews Dec 15, 2024</p>
                </div>
                <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/[0.06] text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all">
                  Manage
                </button>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/[0.06] text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all">
                  Change Plan
                </button>
                <button className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/[0.06] text-xs font-medium text-text-secondary hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all">
                  Cancel Subscription
                </button>
              </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel rounded-[24px] border border-red-500/10 bg-red-500/[0.02] p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <LockClosedIcon className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Danger Zone</h2>
                  <p className="text-sm text-text-secondary">Irreversible account actions</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                <div>
                  <p className="text-sm font-medium text-text-primary">Sign Out</p>
                  <p className="text-xs text-text-secondary">End your current session</p>
                </div>
                <button
                  onClick={() => { logout() }}
                  className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
  )
}
