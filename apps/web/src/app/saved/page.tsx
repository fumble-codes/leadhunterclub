'use client'

import { useState } from 'react'
import AppSidebar from '@/components/layout/AppSidebar'
import { 
  Search, 
  Sparkles, 
  MessageSquare, 
  Clock, 
  Target, 
  Zap, 
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  Bookmark,
  Filter
} from 'lucide-react'
import { motion } from 'framer-motion'

const summaryCards = [
  { label: 'Reply Received', sub: 'Awaiting negotiation', count: '4 Leads', accent: 'purple', icon: MessageSquare },
  { label: 'Urgent Follow-up', sub: 'SLA window closing', count: '2 Urgent', accent: 'orange', icon: ShieldAlert },
  { label: 'High Budget', sub: 'Whale tier opportunities', count: '$10k+ Potential', accent: 'mint', icon: Target },
  { label: 'High Intent', sub: 'AI-verified opportunities', count: '8 New', accent: 'cyan', icon: Sparkles },
]

import { getSavedLeads } from '@/lib/mock/leadsData'

const savedLeads = getSavedLeads()

export default function SavedLeadsPage() {
  const [activeTab, setActiveTab] = useState('All Leads')

  return (
    <div className="flex h-screen bg-bg-main overflow-hidden font-sans">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <div className="max-w-[1400px] mx-auto relative z-10">
          
          {/* Summary Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {summaryCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-6 rounded-[28px] bg-surface-secondary/50 border border-white/[0.05] hover:bg-surface-secondary hover:border-white/10 transition-all duration-300 overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl bg-accent-${card.accent}/10 text-accent-${card.accent} shadow-inner`}>
                    <card.icon size={22} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest text-accent-${card.accent}`}>
                    {card.count}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-text-primary tracking-tight">{card.label}</h3>
                <p className="text-xs text-text-secondary mt-1">{card.sub}</p>
                
                <div className={`absolute bottom-0 left-0 w-full h-1 bg-accent-${card.accent}/20 group-hover:bg-accent-${card.accent}/40 transition-all`} />
              </motion.div>
            ))}
          </div>

          {/* Table Controls */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-8">
               <h2 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-3">
                 <Bookmark className="text-accent-orange" size={24} />
                 Saved Leads
               </h2>
               <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                 {['All Leads', 'In Progress', 'Archived'].map((tab) => (
                   <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
                       activeTab === tab 
                         ? 'bg-accent-orange text-[#11150C] shadow-lg' 
                         : 'text-text-secondary hover:text-text-primary'
                     }`}
                   >
                     {tab}
                   </button>
                 ))}
               </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent-orange transition-colors" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search pipeline..." 
                   className="bg-surface-secondary/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-accent-orange/50 transition-all w-64"
                 />
               </div>
               <button className="flex items-center gap-2 px-4 py-2.5 bg-accent-orange text-[#11150C] rounded-xl font-bold text-xs hover:shadow-[0_0_20px_rgba(255,184,107,0.3)] transition-all">
                  <TrendingUp size={14} />
                  Performance Report
               </button>
            </div>
          </div>

          {/* High-Density Pipeline Table */}
          <div className="bg-surface-secondary/30 border border-white/[0.05] rounded-[32px] overflow-hidden backdrop-blur-md">
            <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-white/[0.05] text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">
               <div className="col-span-1">Status</div>
               <div className="col-span-4">Lead</div>
               <div className="col-span-2">Source</div>
               <div className="col-span-2">Process</div>
               <div className="col-span-2 text-right">Last Action</div>
               <div className="col-span-1"></div>
            </div>

            <div className="divide-y divide-white/[0.03]">
              {savedLeads.map((lead, i) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="grid grid-cols-12 gap-4 px-8 py-5 items-center group hover:bg-white/[0.02] transition-colors"
                >
                  <div className="col-span-1 flex items-center">
                    <div className={`w-2.5 h-2.5 rounded-full bg-accent-${lead.accent} ${lead.isActionable ? 'animate-pulse ring-4 ring-accent-purple/20' : 'opacity-40'}`} />
                  </div>
                  
                  <div className="col-span-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-elevated border border-white/10 flex items-center justify-center text-[11px] font-bold text-text-primary overflow-hidden">
                       {lead.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-text-primary group-hover:text-accent-orange transition-colors">{lead.name}</div>
                      <div className="text-[10px] text-text-secondary">{lead.email}</div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-text-secondary group-hover:text-text-primary transition-colors">
                      {lead.source}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest text-accent-${lead.accent}`}>
                      {lead.status}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <span className="text-[10px] text-text-secondary font-mono">SIGNAL_ANALYSIS_V2.4</span>
                  </div>

                  <div className="col-span-1 text-right">
                    {lead.isActionable ? (
                      <button className="px-3 py-1.5 bg-text-primary text-bg-main rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-accent-orange transition-colors">
                        Engage
                      </button>
                    ) : (
                      <button className="p-2 text-text-secondary hover:text-text-primary opacity-0 group-hover:opacity-100 transition-all">
                        <ArrowUpRight size={16} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
