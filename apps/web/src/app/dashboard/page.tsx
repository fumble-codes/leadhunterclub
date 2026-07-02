'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BoltIcon, ViewfinderCircleIcon, ChatBubbleLeftRightIcon, BanknotesIcon, ArrowTopRightOnSquareIcon, CheckCircleIcon } from '@heroicons/react/24/solid'
import { dashboardStats, activityData } from '@/lib/mock/dashboardData'

export default function DashboardPage() {
  const [stats, setStats] = useState<any[]>(dashboardStats)
  const [outreachCount, setOutreachCount] = useState(12)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          if (json.data.stats) setStats(json.data.stats)
          if (json.data.readyForOutreachCount !== undefined) setOutreachCount(json.data.readyForOutreachCount)
        }
      })
      .catch(err => console.error('Failed to load dashboard data:', err))
      .finally(() => setLoading(false))
  }, [])
  return (
      <main className="flex-1 overflow-y-auto px-10 py-12 relative">
        {/* Ambient Background Glows */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] glow-mint-soft pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] glow-purple-soft pointer-events-none" />

        <div className="max-w-[1400px] mx-auto relative z-10">
          {/* Header */}
          <div className="mb-12 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-text-secondary hover:text-text-primary transition-colors uppercase tracking-[0.3em] mb-3">
                <CheckCircleIcon className="w-[14px] h-[14px]" />
                Operational Status: Active
              </div>
              <h1 className="text-4xl font-bold text-text-primary tracking-tight">
                Operational Overview
              </h1>
              <p className="text-text-secondary mt-2">Welcome back. Your conversion pipeline is performing at 84% efficiency.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-xl bg-surface-secondary border border-subtle flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent-mint animate-pulse" />
                <span className="text-xs font-medium text-text-secondary uppercase tracking-widest">Live Node: US-EAST</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group metallic-card p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl bg-accent-${stat.accent}/10 text-accent-${stat.accent}`}>
                    {stat.label === 'Signals Intercepted' && <ViewfinderCircleIcon className="w-5 h-5" />}
                    {stat.label === 'Active Conversations' && <ChatBubbleLeftRightIcon className="w-5 h-5" />}
                    {stat.label === 'Avg. Reply Probability' && <BoltIcon className="w-5 h-5" />}
                    {stat.label === 'Credits Remaining' && <BanknotesIcon className="w-5 h-5" />}
                  </div>
                  {stat.trend && (
                    <span className={`text-[11px] font-bold ${stat.trendUp ? 'text-accent-mint' : 'text-text-secondary'} flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md`}>
                      {stat.trend}
                      {stat.trendUp && <ArrowTopRightOnSquareIcon className="w-3 h-3" />}
                    </span>
                  )}
                </div>
                
                <h3 className="text-3xl font-bold text-text-primary mb-1">{stat.value}</h3>
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{stat.label}</p>
                
                {/* Subtle bottom accent glow */}
                <div className={`absolute bottom-0 left-0 w-full h-[2px] bg-accent-${stat.accent}/20 group-hover:bg-accent-${stat.accent}/40 transition-all`} />
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Chart Section */}
            <div className="lg:col-span-2 metallic-card p-8">
               <div className="flex items-center justify-between mb-10">
                 <div>
                   <h3 className="text-lg font-bold text-text-primary tracking-tight">Conversion Velocity</h3>
                   <p className="text-sm text-text-secondary">Reply momentum over the last 7 days</p>
                 </div>
                 <select className="bg-surface-elevated border border-subtle text-xs text-text-primary rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-accent-mint/50">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                 </select>
               </div>

               <div className="h-[200px] flex items-end justify-between gap-4">
                  {activityData.map((data, i) => (
                    <div key={data.day} className="flex-1 flex flex-col items-center gap-4 group">
                       <motion.div 
                         initial={{ height: 0 }}
                         animate={{ height: `${data.value * 2}px` }}
                         transition={{ duration: 1, delay: i * 0.1, ease: 'circOut' }}
                         className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-accent-mint/10 to-accent-mint/40 group-hover:to-accent-mint/60 transition-all relative"
                       >
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-text-secondary hover:text-text-primary transition-colors bg-surface-elevated px-2 py-1 rounded border border-border-subtle">
                           {data.value}%
                         </div>
                       </motion.div>
                       <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{data.day}</span>
                    </div>
                  ))}
               </div>
            </div>

            {/* Quick Actions & AI Status */}
            <div className="space-y-6">
              <div className="p-8 rounded-[32px] bg-accent-mint text-text-on-accent relative overflow-hidden group">
                <h3 className="text-xl font-bold mb-2">Ready for Outreach</h3>
                <p className="text-sm opacity-80 mb-8 leading-relaxed">
                  You have {outreachCount} high-intent lead{outreachCount === 1 ? '' : 's'} waiting for outreach strategy.
                </p>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-text-on-accent text-accent-mint font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl"
                >
                  Review New Leads
                  <ArrowTopRightOnSquareIcon className="w-[18px] h-[18px]" />
                </motion.button>
              </div>

              <div className="metallic-card p-8">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-6">
                  Lead Distribution
                </h3>
                <div className="space-y-4">
                   {[
                     { label: 'SaaS', trend: 'High Demand', color: 'mint' },
                     { label: 'Fintech', trend: 'Growing', color: 'purple' },
                     { label: 'E-commerce', trend: 'Saturating', color: 'orange' }
                   ].map((item) => (
                     <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-xs font-semibold text-text-primary">{item.label}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest text-accent-${item.color}`}>
                          {item.trend}
                        </span>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  )
}
