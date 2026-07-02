'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, SparklesIcon, ChatBubbleLeftRightIcon, ViewfinderCircleIcon, ExclamationTriangleIcon, ArrowTopRightOnSquareIcon, BookmarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AppLead } from '@/types/lead'

import { useRouter } from 'next/navigation'

export default function SavedLeadsPage() {
  const [activeTab, setActiveTab] = useState('All Leads')
  const [savedLeads, setSavedLeads] = useState<AppLead[]>([])
  const [loading, setLoading] = useState(true)
  const [isEngaging, setIsEngaging] = useState<string | null>(null)
  const router = useRouter()

  const readyCount = savedLeads.filter(l => l.isRevealed && (l.status === 'new' || l.status === 'saved')).length
  const activeCount = savedLeads.filter(l => ['drafting', 'sent', 'follow-up'].includes(l.status)).length
  const repliedCount = savedLeads.filter(l => l.status === 'replied').length
  const priorityCount = savedLeads.filter(l => l.urgency === 'critical' || l.urgency === 'high').length

  const dynamicSummaryCards = [
    { label: 'Reply Received', sub: 'Awaiting negotiation', count: `${repliedCount} Leads`, accent: 'purple', icon: ChatBubbleLeftRightIcon },
    { label: 'Active Conversations', sub: 'Currently in outreach', count: `${activeCount} Active`, accent: 'cyan', icon: SparklesIcon },
    { label: 'Ready for Outreach', sub: 'Unlocked & waiting', count: `${readyCount} Ready`, accent: 'mint', icon: ViewfinderCircleIcon },
    { label: 'High Priority Targets', sub: 'Critical & High Urgency', count: `${priorityCount} Urgent`, accent: 'orange', icon: ExclamationTriangleIcon },
  ]

  const handleEngage = async (leadId: string) => {
    setIsEngaging(leadId)
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'drafting' })
      })
      router.push(`/outreach?leadId=${leadId}`)
    } catch (err) {
      console.error(err)
      setIsEngaging(null)
    }
  }

  useEffect(() => {
    const fetchSavedLeads = async () => {
      try {
        const res = await fetch('/api/leads?saved=true')
        const json = await res.json()
        if (json.data) {
          setSavedLeads(json.data)
        }
      } catch (err) {
        console.error('Failed to fetch saved leads:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSavedLeads()
  }, [])

  return (
      <main className="flex-1 overflow-y-auto px-8 py-10 relative">
        <div className="max-w-[1400px] mx-auto relative z-10">
          
          {/* Summary Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {dynamicSummaryCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-6 metallic-card transition-all duration-300 overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl bg-accent-${card.accent}/10 text-accent-${card.accent} shadow-inner`}>
                    <card.icon className="w-[22px] h-[22px]" />
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
                 <BookmarkIcon className="w-6 h-6 text-text-secondary" />
                 Saved Leads
               </h2>
               <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                 {['All Leads', 'In Progress', 'Archived'].map((tab) => (
                   <button
                     key={tab}
                     onClick={() => setActiveTab(tab)}
                     className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${
                       activeTab === tab 
                         ? 'bg-accent-orange text-text-on-accent shadow-lg' 
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
                 <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                 <input 
                   type="text" 
                   placeholder="Search pipeline..." 
                   className="bg-surface-secondary/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-border-subtle transition-all w-64"
                 />
               </div>
               <button className="flex items-center gap-2 px-4 py-2.5 bg-accent-orange text-text-on-accent rounded-xl font-bold text-xs hover: transition-all">
                  <SparklesIcon className="w-[14px] h-[14px]" />
                  Performance Report
               </button>
            </div>
          </div>

          {/* High-Density Pipeline Table */}
          <div className="metallic-card overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-white/[0.05] text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">
               <div className="col-span-1">Status</div>
               <div className="col-span-4">Lead</div>
               <div className="col-span-2">Source</div>
               <div className="col-span-2">Process</div>
               <div className="col-span-2 text-right">Last Action</div>
               <div className="col-span-1"></div>
            </div>

            <div className="divide-y divide-white/[0.03]">
              {savedLeads
                .filter(lead => {
                  if (activeTab === 'All Leads') return true
                  if (activeTab === 'In Progress') return ['drafting', 'sent', 'follow-up'].includes(lead.status)
                  if (activeTab === 'Archived') return lead.status === 'replied'
                  return true
                })
                .map((lead, i) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="grid grid-cols-12 gap-4 px-8 py-5 items-center group hover:bg-white/[0.02] transition-colors focus:border-accent-orange/50"
                >
                  <div className="col-span-1 flex items-center">
                    <div className={`w-2.5 h-2.5 rounded-full bg-accent-${lead.accent || 'mint'} ${lead.isActionable ? 'animate-pulse ring-4 ring-accent-purple/20' : 'opacity-40'}`} />
                  </div>
                  
                  <div className="col-span-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-elevated border border-white/10 flex items-center justify-center text-[11px] font-bold text-text-primary overflow-hidden">
                       {lead.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-text-primary group-hover:text-text-secondary hover:text-text-primary transition-colors transition-colors group-hover:text-accent-orange">{lead.name}</div>
                      <div className="text-[10px] group-hover:text-accent-orange">{lead.email}</div>
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
                    {lead.isRevealed ? (
                      <button 
                        onClick={() => handleEngage(lead.id)}
                        disabled={isEngaging === lead.id}
                        className="px-3 py-1.5 bg-text-primary text-bg-main rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-accent-orange transition-colors inline-block disabled:opacity-50"
                      >
                        {isEngaging === lead.id ? '...' : 'Engage'}
                      </button>
                    ) : (
                      <Link 
                        href="/leads"
                        className="p-2 text-text-secondary hover:text-text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-accent-orange inline-block"
                        title="Reveal contact in Lead Feed first"
                      >
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <div className="p-8 text-center text-text-secondary text-sm">Loading saved pipeline...</div>
              )}
              {!loading && savedLeads.length === 0 && (
                <div className="p-8 text-center text-text-secondary text-sm">No saved leads in the pipeline.</div>
              )}
            </div>
          </div>

        </div>
      </main>
  )
}
