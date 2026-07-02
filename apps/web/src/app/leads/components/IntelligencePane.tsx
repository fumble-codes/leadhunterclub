'use client'

import { motion } from 'framer-motion'
import { UserIcon, SparklesIcon, ChevronRightIcon, ArrowTopRightOnSquareIcon, CheckCircleIcon, BoltIcon, BanknotesIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { Lead } from './LeadList'

interface IntelligencePaneProps {
  lead: Lead | null
}

export default function IntelligencePane({ lead }: IntelligencePaneProps) {
  if (!lead) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center text-center p-12 bg-bg-main relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(circle, var(--color-code-header) 0%, transparent 70%)' }} />
        <div className="w-16 h-16 rounded-2xl bg-surface-secondary border border-subtle flex items-center justify-center mb-6 text-text-secondary animate-pulse-subtle">
           <CheckCircleIcon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">Operational Intelligence</h3>
        <p className="text-text-secondary max-w-sm text-sm">
          Select a signal from the feed to reveal the proprietary intelligence package and conversion paths.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 h-full overflow-y-auto bg-bg-main scrollbar-hide">
      {/* Detail Header */}
      <div className="p-8 border-b border-subtle relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{ background: 'radial-gradient(circle, var(--color-code-header) 0%, transparent 70%)' }} />
        
        <div className="flex justify-between items-start mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors uppercase tracking-widest mb-2">
<SparklesIcon className="w-[14px] h-[14px]" />
               High Intent Signal Identified
            </div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">
              {lead.title}
            </h1>
          </motion.div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-secondary border border-subtle rounded-xl text-sm font-medium text-text-primary hover:bg-surface-elevated transition-all">
            Save Signal
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="text-[10px] uppercase text-text-secondary font-bold tracking-widest">Decision Maker</div>
            <div className="flex items-center gap-2 text-sm text-text-primary font-medium">
              <UserIcon className="w-[14px] h-[14px] text-text-secondary" />
              Alex Rivera
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] uppercase text-text-secondary font-bold tracking-widest">Role</div>
            <div className="flex items-center gap-2 text-sm text-text-primary font-medium">
              <BanknotesIcon className="w-[14px] h-[14px] text-text-secondary" />
              Founder & CEO
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] uppercase text-text-secondary font-bold tracking-widest">Funding</div>
            <div className="flex items-center gap-2 text-sm text-text-primary font-medium">
              $4.2M Series A
            </div>
          </div>
          <div className="space-y-1 text-accent-mint">
            <div className="text-[10px] uppercase text-accent-mint font-bold tracking-widest">Size</div>
            <div className="flex items-center gap-2 text-sm text-text-primary font-medium text-accent-mint">
<UserCircleIcon className="w-[14px] h-[14px] text-text-secondary" />
               12-25 Experts
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-10">
        {/* Signal Intelligence */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-text-secondary" />
               Signal Intelligence
            </h3>
            <span className="text-[10px] text-text-secondary font-mono">ANALYSIS_REPORT_V2</span>
          </div>
          
          <div className="glass-panel p-6 rounded-24px bg-surface-secondary/40 border-subtle rim-light">
            <p className="text-sm text-text-primary leading-relaxed font-mono opacity-90 italic">
              &quot;{lead.preview} Need a fresh SaaS aesthetic that highlights our core analytics engine. Looking for a designer who understands AI product cycles. Our current interface feels clunky and &apos;legacy&apos;.&quot;
            </p>
          </div>
        </section>

        {/* Strategic Outreach Paths */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center gap-2">
            <BoltIcon className="w-4 h-4 text-text-secondary" />
               Strategic Outreach Paths
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group text-left p-6 rounded-24px bg-surface-secondary/60 border hover:border-accent-mint/30 hover:border-border-subtle transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-surface-secondary group-hover:bg-accent-mint transition-colors" />
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-text-secondary hover:text-text-primary transition-colors uppercase">Low-Friction</span>
                <ChevronRightIcon className="w-[14px] h-[14px] text-text-secondary" />
              </div>
              <p className="text-xs text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors">
                Focus on their recent Series A funding and the specific &apos;clunky&apos; UI pain point. Offer a quick audit.
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group text-left p-6 rounded-24px bg-surface-secondary/60 border hover:border-accent-mint/30 hover:border-border-subtle transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-surface-secondary group-hover:bg-accent-purple transition-colors" />
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-text-secondary hover:text-text-primary transition-colors uppercase">AI Expert Path</span>
                <ChevronRightIcon className="w-[14px] h-[14px] text-text-secondary" />
              </div>
              <p className="text-xs text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors">
                Position as an AI specialist. Focus on data visualization and complex dashboard systems in your pitch.
              </p>
            </motion.button>
          </div>
        </section>

        {/* Action Bar */}
        <div className="pt-6 flex items-center gap-4">
          <button className="flex-1 py-4 bg-accent-mint text-bg-main font-bold rounded-xl hover: transition-all active:scale-95 flex items-center justify-center gap-2">
            Generate Conversion Draft
            <SparklesIcon className="w-[18px] h-[18px]" />
          </button>
          <button className="p-4 bg-accent-mint border border-subtle rounded-xl text-text-primary hover:bg-surface-elevated transition-all">
            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
