'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  Rss, Bookmark, Send, LayoutDashboard, Coins,
  Sparkles, ArrowRight, Target, MessageSquare, Zap,
  ArrowUpRight, TrendingUp, ShieldCheck, Filter,
  Search, Clock, Activity, ShieldAlert, User,
  MoreHorizontal, Info, ExternalLink, Eye
} from 'lucide-react'
import Link from 'next/link'
import { dashboardStats, activityData } from '@/lib/mock/dashboardData'
import { getSavedLeads, getOutreachLeads, allLeads } from '@/lib/mock/leadsData'
import LeadCard from '@/app/leads/components/LeadCard'

const ease = [0.16, 1, 0.3, 1] as const

const tabs = [
  { id: 'leads', label: 'Lead Feed', icon: Rss },
  { id: 'saved', label: 'Saved Leads', icon: Bookmark },
  { id: 'outreach', label: 'Outreach', icon: Send },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

// ─── Real Lead Feed content (100% precise to leads/page.tsx) ──────────────
function LeadsContent() {
  // Generate 4 leads for mockup preview
  const feedLeads = Array.from({ length: 4 }, (_, i) => ({
    ...allLeads[i % allLeads.length],
    id: `hero-lead-${i}`,
  }))

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 pb-32 relative w-full scrollbar-hide">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-purple/[0.03] blur-[60px] rounded-[100%] pointer-events-none" />
      <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-accent-cyan/[0.02] blur-[60px] rounded-[100%] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header & Command Bar */}
        <div className="flex flex-col items-center justify-center mb-16 mt-4">
          {/* Raycast-style Command Palette */}
          <div className="relative group w-full max-w-2xl mb-12">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-accent-purple/20 via-accent-cyan/20 to-accent-mint/20 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-[#181b22] border border-white/[0.08] rounded-2xl p-2 shadow-2xl focus-within:ring-1 focus-within:ring-white/20 transition-all">
              <div className="pl-4 pr-3 text-text-secondary">
                <Search size={20} className="stroke-[1.5]" />
              </div>
              <input
                type="text"
                placeholder="Ask AI or search signals... (Press ⌘K)"
                className="w-full bg-transparent border-none text-text-primary text-[15px] placeholder:text-text-secondary/50 focus:outline-none focus:ring-0 py-3"
              />
              <div className="flex items-center gap-2 pr-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <Sparkles size={14} className="text-accent-purple" />
                  <span className="text-[11px] font-semibold text-text-secondary">AI Filter</span>
                </div>
                <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-text-secondary tracking-widest">
                  ⌘K
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex items-end justify-between">
            <div>
              <h1 className="text-[32px] font-bold text-text-primary tracking-tight mb-2 flex items-center gap-3">
                Lead Feed
                <div className="flex items-center gap-2 px-2.5 py-1 border-l-2 border-accent-mint bg-gradient-to-r from-accent-mint/10 to-transparent text-accent-mint text-[11px] font-bold tracking-[0.2em] uppercase">
                  <span className="w-1.5 h-1.5 bg-accent-mint animate-pulse shadow-[0_0_8px_currentColor]" />
                  4 Signals
                </div>
              </h1>
              <p className="text-text-secondary/80 text-sm">Real-time conversational opportunities intercepted across your network.</p>
            </div>
          </div>
        </div>

        {/* Asymmetrical CSS Grid Feed exactly like leads/page.tsx */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 auto-rows-[minmax(340px,auto)]">
          {feedLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Real Saved Leads content (100% precise to saved/page.tsx) ────────────────────
function SavedContent() {
  const [activeTab, setActiveTab] = useState('All Leads')
  const savedLeads = getSavedLeads()

  const summaryCards = [
    { label: 'Reply Received', sub: 'Awaiting negotiation', count: '4 Leads', accent: 'purple', icon: MessageSquare },
    { label: 'Urgent Follow-up', sub: 'SLA window closing', count: '2 Urgent', accent: 'orange', icon: ShieldAlert },
    { label: 'High Budget', sub: 'Whale tier opportunities', count: '$10k+ Potential', accent: 'mint', icon: Target },
    { label: 'High Intent', sub: 'AI-verified opportunities', count: '8 New', accent: 'cyan', icon: Sparkles },
  ]

  return (
    <div className="flex-1 overflow-y-auto px-8 py-10 relative scrollbar-hide">
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
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight flex items-center gap-3">
              <Bookmark className="text-accent-orange" size={24} />
              Saved Leads
            </h2>
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              {['All Leads', 'In Progress', 'Archived'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${activeTab === tab
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
                className="bg-surface-secondary/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-accent-orange/50 transition-all w-48 lg:w-64"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-accent-orange text-[#11150C] rounded-xl font-bold text-xs hover:shadow-[0_0_20px_rgba(255,184,107,0.3)] transition-all">
              <TrendingUp size={14} />
              Report
            </button>
          </div>
        </div>

        {/* High-Density Pipeline Table */}
        <div className="bg-[#121316] border border-white/[0.05] rounded-[24px] overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-white/[0.05] text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] min-w-[800px]">
            <div className="col-span-1">Status</div>
            <div className="col-span-4">Lead</div>
            <div className="col-span-2">Source</div>
            <div className="col-span-2">Process</div>
            <div className="col-span-2 text-right">Last Action</div>
            <div className="col-span-1"></div>
          </div>

          <div className="divide-y divide-white/[0.03] min-w-[800px] overflow-x-auto">
            {savedLeads.map((lead, i) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="grid grid-cols-12 gap-4 px-8 py-5 items-center group hover:bg-white/[0.02] transition-colors"
              >
                <div className="col-span-1 flex items-center">
                  <div className={`w-2.5 h-2.5 rounded-full bg-accent-${lead.accent} ${lead.isActionable ? 'animate-pulse ring-4 ring-accent-purple/20' : 'opacity-40'}`} />
                </div>

                <div className="col-span-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-elevated border border-white/10 flex items-center justify-center text-[11px] font-bold text-text-primary overflow-hidden shrink-0">
                    {lead.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-text-primary group-hover:text-accent-orange transition-colors truncate">{lead.name}</div>
                    <div className="text-[10px] text-text-secondary truncate">{lead.email}</div>
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
    </div>
  )
}

// ─── Real Outreach content (100% precise to outreach/page.tsx) ───────────────
function OutreachContent() {
  const outreachLeads = getOutreachLeads()
  const [selectedLead, setSelectedLead] = useState(outreachLeads[0])
  const [draft, setDraft] = useState('')

  if (!selectedLead) return null

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Column: Thread List */}
      <div className="w-[320px] shrink-0 border-r border-white/[0.06] bg-[#12151A]/40 flex flex-col">
        <div className="p-6 border-b border-white/[0.06]">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <MessageSquare size={18} className="text-accent-mint" />
            Conversations
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          {outreachLeads.map((lead) => (
            <button
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              className={`w-full text-left p-4 rounded-2xl transition-all relative group ${selectedLead.id === lead.id
                ? 'bg-surface-secondary border border-white/[0.08] shadow-lg'
                : 'hover:bg-white/[0.03] border border-transparent'
                }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-bold text-text-primary truncate">{lead.name}</span>
                <span className="text-[10px] text-text-secondary font-mono ml-2 shrink-0">{lead.timestamp}</span>
              </div>
              <div className="text-[10px] text-accent-mint uppercase tracking-widest font-bold mb-2">
                {lead.company}
              </div>
              <p className="text-xs text-text-secondary line-clamp-1 italic">
                {lead.signalContext}
              </p>
              {selectedLead.id === lead.id && (
                <motion.div layoutId="outreach-active-hero"
                  className="absolute inset-0 border border-accent-mint/30 rounded-2xl pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Center Column: Messaging Cockpit */}
      <div className="flex-1 flex flex-col bg-[#0F1115] relative min-w-0">
        <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-accent-${selectedLead.accent}/10 border border-accent-${selectedLead.accent}/20 flex items-center justify-center`}>
              <User size={20} className={`text-accent-${selectedLead.accent}`} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-text-primary leading-tight truncate">{selectedLead.name}</h3>
              <span className="text-xs text-text-secondary opacity-60 truncate block">Conversation Thread</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <button className="p-2 hover:bg-white/5 rounded-lg text-text-secondary transition-colors"><Clock size={18} /></button>
            <button className="p-2 hover:bg-white/5 rounded-lg text-text-secondary transition-colors"><MoreHorizontal size={18} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          <div className="max-w-[80%] mx-auto text-center space-y-4 py-12">
            <div className="w-12 h-12 rounded-full bg-accent-mint/10 border border-accent-mint/20 flex items-center justify-center mx-auto text-accent-mint">
              <Target size={24} />
            </div>
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-widest">Initial Intercept Sent</h4>
            <p className="text-xs text-text-secondary italic">&quot;Hey Alex, saw your Shopify store load times are a bit sluggish. Just worked with a similar DTC brand to shave 2s off their LCP. Any interest in a quick audit?&quot;</p>
          </div>
        </div>

        <div className="p-6 border-t border-white/[0.06] bg-[#13151b]">
          <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-mint/10 border border-accent-mint/20 text-accent-mint text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
              <Sparkles size={12} /> AI Angles:
            </div>
            {[
              { label: 'Curiosity Loop', icon: Zap },
              { label: 'Authority Play', icon: Info },
              { label: 'Subtle Humor', icon: MessageSquare }
            ].map((angle) => (
              <button key={angle.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-text-secondary hover:text-text-primary hover:border-white/20 transition-all whitespace-nowrap">
                <angle.icon size={12} /> {angle.label}
              </button>
            ))}
          </div>

          <div className="relative group">
            <textarea
              value={draft} onChange={(e) => setDraft(e.target.value)}
              placeholder="Draft your socially intelligent outreach..."
              className="w-full bg-[#0F1115] border border-white/[0.08] rounded-[24px] p-6 pr-24 text-sm text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-accent-mint/50 transition-all min-h-[140px] resize-none"
            />
            <button className="absolute bottom-4 right-4 p-4 bg-accent-mint text-[#11150C] rounded-xl font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(184,243,107,0.3)] transition-all">
              Send <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Intelligence Summary */}
      <div className="w-[300px] lg:w-[340px] shrink-0 border-l border-white/[0.06] bg-[#12151A]/40 flex flex-col p-8 overflow-y-auto scrollbar-hide">
        <div className="space-y-8">
          <section>
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Info size={12} /> Intelligence Brief
            </h4>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="text-xs text-text-primary leading-relaxed font-medium">
                &quot;{selectedLead.signalContext}&quot;
              </div>
              <div className="flex flex-wrap gap-2">
                {['E-commerce', 'High Intent'].map(tag => (
                  <span key={tag} className="px-2 py-1 rounded-md bg-accent-mint/10 border border-accent-mint/20 text-[9px] font-bold text-accent-mint">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4">Conversion Paths</h4>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group cursor-pointer hover:border-accent-mint/30 transition-all">
                <span className="text-xs text-text-secondary group-hover:text-text-primary">Company Website</span>
                <ExternalLink size={14} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group cursor-pointer hover:border-accent-purple/30 transition-all">
                <span className="text-xs text-text-secondary group-hover:text-text-primary">LinkedIn Profile</span>
                <ExternalLink size={14} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </section>

          <section className="mt-auto">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-accent-mint/10 to-transparent border border-accent-mint/20 mt-8">
              <h5 className="text-xs font-bold text-accent-mint mb-2">Socially Intelligent Note:</h5>
              <p className="text-[11px] text-text-secondary leading-relaxed italic">
                &quot;Alex likes direct, no-BS communication. Avoid fluff and focus on the technical Shopify metric improvement.&quot;
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

// ─── Real Dashboard content (100% precise to dashboard/page.tsx) ─────────
function DashboardContent() {
  return (
    <div className="flex-1 overflow-y-auto px-10 py-12 relative scrollbar-hide">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-mint/[0.03] blur-[60px] rounded-[100%] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-accent-purple/[0.02] blur-[60px] rounded-[100%] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-accent-mint uppercase tracking-[0.3em] mb-3">
              <ShieldCheck size={14} /> Operational Status: Active
            </div>
            <h1 className="text-4xl font-bold text-text-primary tracking-tight">Operational Overview</h1>
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
              className="group relative p-6 rounded-[24px] bg-surface-secondary border border-subtle hover:border-white/10 transition-all duration-300 overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-accent-${stat.accent}/10 text-accent-${stat.accent}`}>
                  {stat.label === 'Analyzed Leads' && <Target size={20} />}
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
              <div className={`absolute bottom-0 left-0 w-full h-[2px] bg-accent-${stat.accent}/20 group-hover:bg-accent-${stat.accent}/40 transition-all`} />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Chart Section */}
          <div className="lg:col-span-2 p-8 rounded-[32px] bg-surface-secondary border border-subtle relative overflow-hidden">
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
                Review New Leads <ArrowUpRight size={18} />
              </motion.button>
            </div>

            <div className="p-8 rounded-[32px] bg-surface-secondary border border-subtle">
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
    </div>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
export default function HeroSection() {
  const [activeTab, setActiveTab] = useState('leads')

  const { scrollY } = useScroll()

  // Direct scroll-linked transforms — no spring wrapper to avoid fighting Lenis
  const rotateX = useTransform(scrollY, [0, 600], [22, 0])
  const scale = useTransform(scrollY, [0, 600], [0.95, 1])
  const y = useTransform(scrollY, [0, 600], [0, 0])

  return (
    <section className="relative min-h-screen flex flex-col items-center grain-texture overflow-hidden bg-[#080808] pt-20 pb-0 px-6" data-color="mint">
      
      {/* Subtle geometric grid background (Centered under the text, faint mint lines) */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-100"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(184, 243, 107, 0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(184, 243, 107, 0.015) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(circle at 50% 30%, black 10%, transparent 60%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 30%, black 10%, transparent 60%)'
        }}
      />

      {/* Faint precise technical backlight glow */}
      <div 
        className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full pointer-events-none z-0 mix-blend-screen opacity-70"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(184,243,107,0.03) 0%, rgba(167,139,250,0.02) 50%, transparent 70%)' }} 
      />

      {/* Centered Clario-style hero layout */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto flex flex-col justify-center items-center text-center pt-20 pb-4 transform-gpu">
        <div className="flex flex-col items-center relative w-full">
          
          {/* Centered Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.07, ease }}
            className="font-sans text-[38px] md:text-[54px] lg:text-[68px] font-semibold leading-[1.05] tracking-tighter mb-6 text-text-primary max-w-4xl mx-auto antialiased"
          >
            Stop looking for clients —<br />
            <span className="text-accent-mint">
              Start intercepting them.
            </span>
          </motion.h1>

          {/* Centered Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="text-[15px] md:text-[17px] text-text-secondary font-light leading-relaxed mb-10 max-w-2xl mx-auto antialiased"
          >
            Lead Hunter Club monitors active service demand in real-time, compiles deep social intelligence, and drafts personalized outreach that actually gets replies.
          </motion.p>

          {/* Centered CTA Row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="flex flex-row items-center justify-center gap-4 w-full relative z-10"
          >
            <Link href="/dashboard">
              <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent-mint text-[#080808] font-bold text-sm cursor-pointer shadow-[0_4px_25px_rgba(184,243,107,0.25)] transition-all hover:bg-accent-mint/90">
                Start Hunting <ArrowUpRight size={16} />
              </motion.span>
            </Link>
            <Link href="/sneak-peek">
              <motion.span whileHover={{ scale: 1.02 }} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] font-medium text-text-secondary hover:text-text-primary text-sm transition-colors cursor-pointer border border-white/[0.06] hover:border-accent-purple/20 hover:bg-accent-purple/[0.03]">
                Sneak Peek
              </motion.span>
            </Link>
          </motion.div>

          {/* Concentrated green backlight aura directly behind the button */}
          <div className="absolute top-[48%] left-1/2 -translate-x-1/2 w-[400px] h-[150px] rounded-full bg-accent-mint/25 blur-[50px] pointer-events-none z-0" />
          
          {/* Larger ambient backlight glow under button and behind mockup top edge */}
          <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-accent-mint/12 blur-[80px] pointer-events-none z-0" />
          
        </div>
      </div>

      {/* 3D Perspective Container for Clario-style tilt reveal */}
      <div 
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
        className="relative z-10 w-full max-w-[1200px] mt-[-24px] lg:mt-[-48px] group/appwindow"
      >
        <motion.div
          style={{ 
            transformStyle: 'preserve-3d', 
            rotateX,
            scale,
            y
          }}
          className="w-full transform-gpu will-change-transform"
        >
        {/* Faint separation backlight Behind the App Window */}
        <div className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-[100%] pointer-events-none -z-10 mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(184,243,107,0.06) 0%, transparent 70%)' }} />

        {/* Faint Stage shadow glow */}
        <div className="pointer-events-none absolute -bottom-12 left-1/2 -translate-x-1/2 w-2/3 h-24 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(184,243,107,0.07) 0%, transparent 75%)', filter: 'blur(20px)' }} />

        <div className="rim-light rounded-t-[24px] overflow-hidden shadow-[0_-60px_120px_-20px_rgba(0,0,0,0.9)] border border-white/[0.04] border-t-accent-mint/20 border-b-0 relative">
          {/* Glass reflection sheen overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-tr from-transparent via-white/[0.015] to-white/[0.05] mix-blend-overlay" />
          {/* macOS chrome */}
          <div className="flex items-center gap-2 px-5 py-3 bg-[#121316] border-b border-white/[0.06]">
            <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <span className="w-3 h-3 rounded-full bg-[#28C840]" />
            <span className="ml-4 text-xs font-mono text-text-secondary/30 tracking-wider">lead-hunter.app</span>
          </div>

          {/* App body */}
          <div className="flex h-[760px] bg-bg-main overflow-hidden">
            {/* Sidebar — matches AppSidebar visually, uses state instead of router */}
            <div className="w-[240px] shrink-0 bg-[#121316] border-r border-white/[0.04] flex flex-col py-4">
              <div className="px-5 mb-6 flex items-center gap-3">
                <img src="/logo.svg" alt="Lead Hunter Club" className="w-7 h-7 rounded-lg" />
                <span className="font-semibold text-sm text-text-primary tracking-tight">Lead Hunter Club</span>
              </div>

              <div className="flex-1 px-3 space-y-1">
                {tabs.map((t) => {
                  const isActive = activeTab === t.id
                  return (
                    <button key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left relative ${isActive ? 'text-accent-mint' : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'}`}>
                      {isActive && (
                        <motion.div layoutId="hero-sidebar-active"
                          className="absolute inset-0 bg-accent-mint/10 border border-accent-mint/20 rounded-xl shadow-[inset_0_0_12px_rgba(184,243,107,0.1)]" />
                      )}
                      <t.icon size={16} className="stroke-[1.5] relative z-10" />
                      <span className="relative z-10">{t.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Token widget */}
              <div className="px-4 mt-4 mb-2">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-primary uppercase tracking-widest">
                      <Coins size={11} className="text-accent-mint" /> Credits
                    </div>
                    <span className="text-[10px] text-text-secondary">750/1k</span>
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 1 }}
                      className="h-full bg-accent-mint rounded-full shadow-[0_0_8px_rgba(184,243,107,0.4)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex flex-1 overflow-hidden w-full relative">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.3, ease }} className="absolute inset-0 flex">

                  {activeTab === 'leads' && <LeadsContent />}
                  {activeTab === 'saved' && <SavedContent />}
                  {activeTab === 'outreach' && <OutreachContent />}
                  {activeTab === 'dashboard' && <DashboardContent />}

                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom fade-out overlay (opaque gradient — no backdrop-blur to avoid GPU thrash during scroll) */}
          <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-30">
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/90 via-60% to-transparent pointer-events-none" />
          </div>
        </div>
        </motion.div>
      </div>
    </section>
  )
}
