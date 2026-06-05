'use client'

import AppSidebar from '@/components/layout/AppSidebar'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Target, 
  MessageSquare, 
  Coins, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import { dashboardStats, activityData } from '@/lib/mock/dashboardData'

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-bg-main overflow-hidden font-sans">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto px-10 py-12 relative">
        {/* Ambient Background Glows */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-mint/[0.03] blur-[120px] rounded-[100%] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-accent-purple/[0.02] blur-[100px] rounded-[100%] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto relative z-10">
          {/* Header */}
          <div className="mb-12 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-accent-mint uppercase tracking-[0.3em] mb-3">
                <ShieldCheck size={14} />
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
            {dashboardStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group metallic-card p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl bg-accent-${stat.accent}/10 text-accent-${stat.accent}`}>
                    {stat.label === 'Signals Intercepted' && <Target size={20} />}
                    {stat.label === 'Active Conversations' && <MessageSquare size={20} />}
                    {stat.label === 'Avg. Reply Probability' && <Zap size={20} />}
                    {stat.label === 'Credits Remaining' && <Coins size={20} />}
                  </div>
                  {stat.trend && (
                    <span className={`text-[11px] font-bold ${stat.trendUp ? 'text-accent-mint' : 'text-text-secondary'} flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md`}>
                      {stat.trend}
                      {stat.trendUp && <ArrowUpRight size={12} />}
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
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-accent-mint bg-surface-elevated px-2 py-1 rounded border border-accent-mint/30">
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
              <div className="p-8 rounded-[32px] bg-accent-mint text-[#11150C] relative overflow-hidden group">
                <Sparkles className="absolute top-[-20px] right-[-20px] w-32 h-32 opacity-10 rotate-12" />
                <h3 className="text-xl font-bold mb-2">Ready for Outreach</h3>
                <p className="text-sm opacity-80 mb-8 leading-relaxed">
                  You have 12 high-intent leads waiting for outreach strategy.
                </p>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-[#11150C] text-accent-mint font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl"
                >
                  Review New Leads
                  <ArrowUpRight size={18} />
                </motion.button>
              </div>

              <div className="metallic-card p-8">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                  <TrendingUp size={16} className="text-accent-purple" />
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
    </div>
  )
}
