'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  BanknotesIcon,
  BookmarkIcon,
  Squares2X2Icon,
  SparklesIcon,
  ArrowRightIcon,
  ViewfinderCircleIcon,
  ChatBubbleLeftRightIcon,
  BoltIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  ChartBarSquareIcon,
  ExclamationTriangleIcon,
  UserIcon,
  EllipsisHorizontalIcon,
  InformationCircleIcon,
  EyeIcon,
  ClockIcon,
} from '@heroicons/react/24/solid'
import Link from 'next/link'
import { AppLead } from '@/types/lead'
import LeadCard from '@/app/leads/components/LeadCard'

const allLeads: AppLead[] = [
  {
    id: 'hero-1',
    name: 'Andy Shepard',
    email: 'a.shepard@gmail.com',
    phone: '+1 (555) 012-3456',
    company: 'Nexus AI',
    source: 'LEAD HUNTER CLUB',
    category: 'SHOPIFY DESIGN',
    title: 'Shopify Designer - eCommerce Conversion',
    signalContext:
      'Struggling with slow load times and high bounce rates on their current Shopify store.',
    role: 'Shopify Designer / Freelancer',
    taskScope: 'Design engaging, high-converting Shopify storefronts for eCommerce brands',
    mustHave: 'Shopify storefront design expertise + strong UI/UX + conversion focus',
    nicheBonus: 'eCommerce design expertise + team collaboration + portfolio + proven results',
    buyerType: 'eCommerce Brand / Shopify Store',
    urgency: 'high',
    winProb: 'high',
    nicheTags: ['Storefront Design', 'High-Converting', 'Freelance'],
    hashtags: ['#shopify', '#design', '#ecommerce', '#conversion', '#storefront', '#freelance'],
    replyProbability: 92,
    status: 'saved',
    timestamp: '2h ago',
    niches: ['Web Design', 'Web Dev', 'Design'],
    isClaimable: true,
    revealCost: 3,
    isRevealed: false,
  },
  {
    id: 'hero-2',
    name: 'Emily Thompson',
    email: 'e.thompson@vanguard.io',
    phone: '+1 (555) 017-8892',
    company: 'Vanguard Group',
    source: 'LEAD HUNTER CLUB',
    category: 'PERFORMANCE MARKETING',
    title: 'Media Buyer - Meta & TikTok Scaling',
    signalContext: 'Scaling ad spend for Q4 but CAC is getting wildly unprofitable.',
    role: 'Performance Marketer / Agency',
    taskScope: 'Manage and scale paid acquisition across Meta and TikTok for DTC brands',
    mustHave: 'Proven track record scaling $50k+ monthly ad spend + creative strategy',
    nicheBonus: 'Experience in health & wellness DTC + UGC sourcing',
    buyerType: 'DTC Brand / 8-figure Run Rate',
    urgency: 'medium',
    winProb: 'medium',
    nicheTags: ['DTC', 'Paid Ads', 'Scaling'],
    hashtags: ['#performance', '#media', '#dtc', '#ads', '#scaling', '#tiktok'],
    replyProbability: 85,
    status: 'drafting',
    timestamp: '5h ago',
    niches: ['Marketing'],
    isClaimable: true,
    revealCost: 3,
    isRevealed: false,
  },
  {
    id: 'hero-3',
    name: 'Michael Carter',
    email: 'm.carter@stellar.co',
    phone: '+1 (555) 019-2045',
    company: 'Stellar Co',
    source: 'LEAD HUNTER CLUB',
    category: 'BRAND IDENTITY',
    title: 'Brand Designer - SaaS Rebrand',
    signalContext: 'Just raised seed round, looking to completely rebrand before product launch.',
    role: 'Brand Designer / Agency',
    taskScope: 'End-to-end visual identity revamp including logo, typography, and web assets',
    mustHave: 'B2B SaaS portfolio + modern minimal aesthetic + strict timeline management',
    nicheBonus: 'Motion design capabilities + Webflow experience',
    buyerType: 'Funded SaaS Startup',
    urgency: 'high',
    winProb: 'high',
    nicheTags: ['SaaS', 'Branding', 'Design'],
    hashtags: ['#saas', '#branding', '#design', '#identity', '#startup'],
    replyProbability: 88,
    status: 'saved',
    timestamp: '1d ago',
    niches: ['Design'],
    isClaimable: true,
    revealCost: 3,
    isRevealed: true,
  },
  {
    id: 'hero-4',
    name: 'David Anderson',
    email: 'd.anderson@prism.io',
    phone: '+1 (555) 014-9921',
    company: 'Prism Labs',
    source: 'LEAD HUNTER CLUB',
    category: 'SALES INFRASTRUCTURE',
    title: 'RevOps Specialist - Outbound Setup',
    signalContext: 'Just hired 3 new SDRs. Clear indicator they need outbound infrastructure.',
    role: 'RevOps Consultant / B2B',
    taskScope: 'Build and automate Apollo/Clay outbound sequences for a new SDR team',
    mustHave: 'Deep Apollo/Clay knowledge + deliverability setup + CRM integration',
    nicheBonus: 'Sales coaching experience + customized scripting',
    buyerType: 'B2B Services / Agency',
    urgency: 'medium',
    winProb: 'high',
    nicheTags: ['B2B', 'Sales', 'Systems'],
    hashtags: ['#revops', '#sales', '#outbound', '#apollo', '#clay'],
    replyProbability: 75,
    status: 'new',
    timestamp: '3d ago',
    niches: ['Sales & RevOps', 'AI & Automation'],
    isClaimable: true,
    revealCost: 3,
    isRevealed: false,
  },
]
const getSavedLeads = () =>
  allLeads.filter((l) => ['saved', 'drafting', 'sent', 'replied', 'follow-up'].includes(l.status))
const dashboardStats = [
  {
    label: 'Analyzed Leads',
    value: '1,284',
    trend: '+12%',
    trendUp: true,
    accent: 'purple' as const,
  },
  {
    label: 'Active Conversations',
    value: '42',
    trend: '+5',
    trendUp: true,
    accent: 'purple' as const,
  },
  {
    label: 'Avg. Reply Probability',
    value: '84%',
    trend: '+2.4%',
    trendUp: true,
    accent: 'purple' as const,
  },
  { label: 'Credits Remaining', value: '750', trend: '/ 1,000', accent: 'purple' as const },
]
const activityData = [
  { day: 'Mon', value: 45 },
  { day: 'Tue', value: 52 },
  { day: 'Wed', value: 38 },
  { day: 'Thu', value: 65 },
  { day: 'Fri', value: 48 },
  { day: 'Sat', value: 32 },
  { day: 'Sun', value: 28 },
]
const ease = [0.16, 1, 0.3, 1] as const

const tabs = [
  { id: 'leads', label: 'Lead Feed', icon: BanknotesIcon },
  { id: 'saved', label: 'Saved Leads', icon: BookmarkIcon },
  { id: 'pipeline', label: 'Pipeline', icon: ChartBarSquareIcon },
  { id: 'dashboard', label: 'Dashboard', icon: Squares2X2Icon },
]

// ─── Real Lead Feed content (compact hero preview) ──────────────
function LeadsContent() {
  const feedLeads = allLeads.slice(0, 4)

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 pb-16 relative w-full scrollbar-hide">
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header & Command Bar */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative group w-full max-w-md mb-3">
            <div className="relative flex items-center bg-surface border border-white/[0.08] rounded-xl px-3 py-1.5 shadow-lg focus-within:ring-1 focus-within:ring-white/20 transition-all">
              <MagnifyingGlassIcon className="w-3.5 h-3.5 text-text-secondary mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Ask AI or search signals... (Press ⌘K)"
                className="w-full bg-transparent border-none text-text-primary text-xs placeholder:text-text-secondary/50 focus:outline-none focus:ring-0 py-0.5"
              />
              <div className="flex items-center gap-1.5 pl-2 shrink-0">
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-semibold text-text-secondary">
                  <SparklesIcon className="w-2.5 h-2.5" /> AI Filter
                </span>
                <span className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-text-secondary">
                  ⌘K
                </span>
              </div>
            </div>
          </div>

          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary tracking-tight">Lead Feed</h3>
              <span className="px-2 py-0.5 rounded bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-[9px] font-mono font-medium uppercase tracking-wider">
                4 Signals
              </span>
            </div>
            <p className="text-text-secondary/60 text-[11px]">Real-time buyer intent</p>
          </div>
        </div>

        {/* 2-column Grid of real LeadCards matching leadfeed design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-stretch">
          {feedLeads.map((lead, i) => (
            <LeadCard key={lead.id} lead={lead} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Real Saved Leads content (compact hero preview) ────────────────────
function SavedContent() {
  const [activeTab, setActiveTab] = useState('All Leads')
  const savedLeads = getSavedLeads()

  const summaryCards = [
    { label: 'Reply Received', count: '4 Leads', accent: 'purple', icon: ChatBubbleLeftRightIcon },
    { label: 'Urgent Follow-up', count: '2 Urgent', accent: 'orange', icon: ExclamationTriangleIcon },
    { label: 'High Budget', count: '$10k+', accent: 'mint', icon: ViewfinderCircleIcon },
    { label: 'High Intent', count: '8 New', accent: 'purple', icon: SparklesIcon },
  ]

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 pb-16 relative scrollbar-hide">
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Summary Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="p-2.5 rounded-xl bg-surface-secondary/40 border border-white/[0.05] flex items-center gap-2.5"
            >
              <div className="p-1.5 rounded-lg bg-white/5 text-text-secondary shrink-0">
                <card.icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] text-text-secondary/70 truncate">{card.label}</div>
                <div className="text-xs font-bold text-text-primary">{card.count}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Controls */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary tracking-tight">Saved Leads</h3>
            <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
              {['All', 'In Progress'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2 py-0.5 rounded text-[9px] font-semibold transition-all ${
                    activeTab === tab
                      ? 'bg-accent-orange text-text-on-accent'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Compact Table */}
        <div className="bg-code-header border border-white/[0.05] rounded-xl overflow-hidden text-xs">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-white/[0.05] text-[9px] font-mono text-text-secondary/60 uppercase">
            <div className="col-span-5">Lead</div>
            <div className="col-span-3">Source</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Intent</div>
          </div>

          <div className="divide-y divide-white/[0.03]">
            {savedLeads.slice(0, 4).map((lead) => (
              <div
                key={lead.id}
                className="grid grid-cols-12 gap-2 px-3 py-2 items-center hover:bg-white/[0.02]"
              >
                <div className="col-span-5 flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-surface-elevated border border-white/10 flex items-center justify-center text-[9px] font-bold text-text-primary shrink-0">
                    {lead.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-text-primary truncate">{lead.name}</div>
                    <div className="text-[10px] text-text-secondary/60 truncate">{lead.company}</div>
                  </div>
                </div>
                <div className="col-span-3">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-mono text-text-secondary">
                    {lead.source}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[9px] font-mono uppercase text-accent-purple font-medium">
                    {lead.status}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-[10px] font-mono font-semibold text-accent-mint">
                    {lead.replyProbability}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Real Dashboard content (compact hero preview) ─────────
function DashboardContent() {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 pb-16 relative scrollbar-hide">
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary tracking-tight">Performance</h3>
          <span className="text-[9px] font-mono text-text-secondary/60 uppercase">Past 7 days</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {dashboardStats.map((stat) => (
            <div
              key={stat.label}
              className="p-2.5 rounded-xl bg-surface-secondary/40 border border-white/[0.05]"
            >
              <div className="text-[9px] text-text-secondary/70 truncate mb-1">{stat.label}</div>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-bold text-text-primary">{stat.value}</span>
                <span className="text-[9px] font-mono text-accent-mint">{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-code-header border border-white/[0.05]">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-text-primary">Conversion Velocity</span>
            <span className="text-[10px] font-mono text-text-secondary/60">Signals intercepted / day</span>
          </div>
          <div className="h-[90px] flex items-end justify-between gap-3 px-2">
            {activityData.map((data) => (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  style={{ height: `${data.value * 0.9}px` }}
                  className="w-full max-w-[28px] rounded-t bg-accent-purple/40 hover:bg-accent-purple/70 transition-all"
                />
                <span className="text-[9px] font-mono text-text-secondary/60">{data.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Real Pipeline content (compact hero preview) ──
const pipelineStages = [
  { id: 'saved', label: 'Saved', desc: 'Unlocked & in pipeline', icon: BookmarkIcon },
  { id: 'contacted', label: 'Contacted', desc: 'You reached out', icon: ArrowTopRightOnSquareIcon },
  { id: 'replied', label: 'Replied', desc: 'Conversation started', icon: ChatBubbleLeftRightIcon },
  { id: 'closed', label: 'Closed', desc: 'Deal won', icon: CheckCircleIcon },
]

function pipelineStageFor(status: string) {
  if (status === 'replied') return 'replied'
  if (status === 'sent' || status === 'follow-up') return 'contacted'
  return 'saved'
}

function PipelineContent() {
  const savedLeads = getSavedLeads().map((lead) => ({
    ...lead,
    stage: pipelineStageFor(lead.status),
  }))

  const stageCounts = pipelineStages.reduce(
    (acc, stage) => ({
      ...acc,
      [stage.id]: savedLeads.filter((l) => l.stage === stage.id).length,
    }),
    {} as Record<string, number>,
  )

  const stageIndex = (stage: string) => pipelineStages.findIndex((s) => s.id === stage)

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 pb-16 relative scrollbar-hide">
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary tracking-tight">Pipeline</h3>
            <span className="text-[9px] font-mono text-text-secondary/60 uppercase">
              {savedLeads.length} active leads
            </span>
          </div>
        </div>

        {/* Stage Flow Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {pipelineStages.map((stage) => (
            <div
              key={stage.id}
              className="p-2.5 rounded-xl bg-surface-secondary/40 border border-white/[0.05]"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-text-secondary font-medium">{stage.label}</span>
                <span className="text-xs font-bold text-text-primary">{stageCounts[stage.id]}</span>
              </div>
              <p className="text-[9px] text-text-secondary/50 truncate">{stage.desc}</p>
            </div>
          ))}
        </div>

        {/* Pipeline Rows */}
        <div className="bg-code-header border border-white/[0.05] rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-white/[0.05] text-[9px] font-mono text-text-secondary/60 uppercase">
            <div className="col-span-5">Lead</div>
            <div className="col-span-3">Source</div>
            <div className="col-span-3">Stage</div>
            <div className="col-span-1 text-right">Win</div>
          </div>

          <div className="divide-y divide-white/[0.03]">
            {savedLeads.slice(0, 4).map((lead) => (
              <div
                key={lead.id}
                className="grid grid-cols-12 gap-2 px-3 py-2 items-center hover:bg-white/[0.02]"
              >
                <div className="col-span-5 flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-surface-elevated border border-white/10 flex items-center justify-center text-[9px] font-bold text-text-primary shrink-0">
                    {lead.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-text-primary truncate">{lead.name}</div>
                    <div className="text-[10px] text-text-secondary/60 truncate">{lead.company}</div>
                  </div>
                </div>

                <div className="col-span-3">
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-mono text-text-secondary">
                    {lead.source}
                  </span>
                </div>

                <div className="col-span-3">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 flex-1">
                      {pipelineStages.map((s, si) => (
                        <div
                          key={s.id}
                          className={`h-1 flex-1 rounded-full ${
                            si <= stageIndex(lead.stage) ? 'bg-accent-purple/80' : 'bg-white/[0.08]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[9px] font-mono text-accent-purple shrink-0 uppercase">
                      {lead.stage}
                    </span>
                  </div>
                </div>

                <div className="col-span-1 text-right">
                  <span className="text-[10px] font-mono font-semibold text-accent-mint">
                    {lead.replyProbability}%
                  </span>
                </div>
              </div>
            ))}
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
    <section
      className="relative min-h-screen flex flex-col items-center grain-texture overflow-hidden bg-page-bg pt-20 pb-0 px-6"
    >
      {/* Crisp geometric grid background (Engineering precision) */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-100"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at 50% 20%, black 15%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 20%, black 15%, transparent 70%)',
        }}
      />

      {/* Centered Clario-style hero layout */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto flex flex-col justify-center items-center text-center pt-16 pb-4 transform-gpu">
        <div className="flex flex-col items-center relative w-full">
          {/* Centered Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.07, ease }}
            className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-semibold leading-[1.1] tracking-tight mb-5 text-text-primary max-w-3xl mx-auto antialiased"
          >
            Stop looking for clients
            <br />
            <span className="text-accent-orange">Start intercepting them.</span>
          </motion.h1>

          {/* Centered Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="text-sm sm:text-base text-text-secondary font-light leading-relaxed mb-8 max-w-xl mx-auto antialiased"
          >
            Lead Hunter Club monitors active service demand in real-time, compiles deep social
            intelligence, and unlocks verified contact details so you can close deals while the
            demand is hot.
          </motion.p>

          {/* Centered CTA Row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="flex flex-row items-center justify-center gap-3.5 w-full relative z-10"
          >
            <Link href="/register">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-container text-on-primary-container font-semibold text-xs sm:text-sm cursor-pointer shadow-[0_4px_20px_rgba(var(--rgb-primary-container),0.25)] transition-all hover:bg-primary-container/90"
              >
                Start Hunting <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </motion.span>
            </Link>
            <Link href="/sneak-peek">
              <motion.span
                whileHover={{ scale: 1.02 }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/[0.02] shadow-[inset_0_1px_0_rgba(var(--rgb-white),0.06)] font-medium text-text-secondary hover:text-text-primary text-xs sm:text-sm transition-colors cursor-pointer border border-white/[0.06] hover:border-border-subtle hover:bg-accent-purple/[0.03] hover:border-accent-purple/20"
              >
                Sneak Peek
              </motion.span>
            </Link>
          </motion.div>
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
            y,
          }}
          className="w-full transform-gpu will-change-transform"
        >
          <div className="rounded-t-[24px] overflow-hidden shadow-[0_-25px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] border border-white/[0.08] border-b-0 relative">
            {/* Glass reflection sheen overlay */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-tr from-transparent via-white/[0.015] to-white/[0.05] mix-blend-overlay" />
            {/* macOS chrome */}
            <div className="flex items-center gap-2 px-5 py-3 bg-code-header border-b border-white/[0.06]">
              <span className="w-3 h-3 rounded-full bg-dot-red" />
              <span className="w-3 h-3 rounded-full bg-dot-yellow" />
              <span className="w-3 h-3 rounded-full bg-dot-green" />
              <span className="ml-4 text-xs font-mono text-text-secondary/30 tracking-wider">
                lead-hunter.app
              </span>
            </div>

            {/* App body */}
            <div className="flex h-[540px] md:h-[580px] bg-bg-main overflow-hidden">
              {/* Sidebar — matches AppSidebar visually, uses state instead of router */}
              <div className="w-[240px] shrink-0 bg-code-header border-r border-white/[0.04] flex flex-col py-4">
                <div className="px-5 mb-6 flex items-center gap-3">
                  <Image
                    src="/logo.svg"
                    alt="Lead Hunter Club"
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-lg"
                  />
                  <span className="font-semibold text-sm text-text-primary tracking-tight">
                    Lead Hunter Club
                  </span>
                </div>

                <div className="flex-1 px-3 space-y-1">
                  {tabs.map((t) => {
                    const isActive = activeTab === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left relative ${isActive ? 'text-accent-purple' : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'}`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="hero-sidebar-active"
                            className="absolute inset-0 bg-accent-purple/10 border border-accent-purple/20 rounded-xl shadow-[inset_0_0_12px_rgba(var(--rgb-accent-purple),0.1)]"
                          />
                        )}
                        <t.icon className="w-4 h-4 relative z-10" />
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
                        <BanknotesIcon className="w-[11px] h-[11px] text-text-secondary" /> Credits
                      </div>
                      <span className="text-[10px] text-text-secondary">750/1k</span>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        transition={{ duration: 1 }}
                        className="h-full bg-accent-purple rounded-full shadow-[0_0_8px_rgba(var(--rgb-accent-purple),0.4)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main content area */}
              <div className="flex flex-1 overflow-hidden w-full relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.3, ease }}
                    className="absolute inset-0 flex"
                  >
                    {activeTab === 'leads' && <LeadsContent />}
                    {activeTab === 'saved' && <SavedContent />}
                    {activeTab === 'pipeline' && <PipelineContent />}
                    {activeTab === 'dashboard' && <DashboardContent />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom fade-out overlay (opaque gradient — no backdrop-blur to avoid GPU thrash during scroll) */}
            <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-30">
              <div className="absolute inset-0 bg-gradient-to-t from-page-bg via-page-bg/90 via-60% to-transparent pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
