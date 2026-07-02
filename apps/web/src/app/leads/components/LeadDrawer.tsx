'use client'

import { useState } from 'react'
import { XMarkIcon, LockClosedIcon, BanknotesIcon, CheckCircleIcon, ChartBarSquareIcon, UserIcon, EnvelopeIcon, ArrowPathIcon, PhoneIcon } from '@heroicons/react/24/solid'
import { AppLead } from '@/types/lead'
import { useRouter } from 'next/navigation'

// Reuse theme map for styling
const themeMap = {
  mint: { textAccent: 'text-text-secondary hover:text-text-primary transition-colors', bgAccent: 'bg-surface-secondary' },
  purple: { textAccent: 'text-text-secondary hover:text-text-primary transition-colors', bgAccent: 'bg-surface-secondary' },
  cyan: { textAccent: 'text-text-secondary hover:text-text-primary transition-colors', bgAccent: 'bg-surface-secondary' },
  orange: { textAccent: 'text-text-secondary hover:text-text-primary transition-colors', bgAccent: 'bg-surface-secondary' },
  pink: { textAccent: 'text-text-secondary hover:text-text-primary transition-colors', bgAccent: 'bg-surface-secondary' },
}

export default function LeadDrawer({ 
  lead, 
  onClose,
  onReveal,
}: { 
  lead: AppLead; 
  onClose: () => void;
  onReveal: (name: string, email: string, phone?: string | null) => void;
}) {
  const theme = themeMap[(lead.accent as keyof typeof themeMap) || 'mint']
  const [isRevealing, setIsRevealing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isStartingOutreach, setIsStartingOutreach] = useState(false)
  const router = useRouter()
  const tokenCost = lead.hasPhone ? 5 : 3

  const handleRevealClick = async () => {
    try {
      setIsRevealing(true)
      setErrorMsg(null)
      const res = await fetch('/api/leads/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        onReveal(json.name, json.email, json.phone)
        // Trigger sidebar/header credits update
        window.dispatchEvent(new Event('user-refetch'))
      } else {
        setErrorMsg(json.message || 'Failed to unlock lead')
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('An unexpected network error occurred')
    } finally {
      setIsRevealing(false)
    }
  }

  const handleStartOutreach = async () => {
    setIsStartingOutreach(true)
    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'drafting' })
      })
      router.push(`/outreach?leadId=${lead.id}`)
    } catch (err) {
      console.error(err)
      setIsStartingOutreach(false)
    }
  }

  return (
    <div className="h-full w-full bg-surface-secondary border border-border-subtle rounded-2xl flex flex-col shadow-2xl relative overflow-hidden">
      
      {/* Top subtle highlight */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] opacity-40 bg-gradient-to-r from-transparent via-current to-transparent ${theme.textAccent}`} />

      {/* Header with Close button */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-3">
           <div className={`w-2.5 h-2.5 rounded-full bg-current ${theme.textAccent} `} />
           <span className="text-[12px] font-bold tracking-[0.15em] text-text-secondary uppercase">
             {lead.source}
           </span>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary transition-colors"
        >
          <XMarkIcon className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Title & Urgent */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-[24px] font-bold tracking-tight text-text-primary leading-[1.2]">
            {lead.title}
          </h2>
          {lead.urgency === 'high' || lead.urgency === 'critical' ? (
             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-400/10 border border-red-400/20 text-red-400 text-[10px] font-bold uppercase tracking-widest shrink-0">
               <ChartBarSquareIcon className="w-3 h-3" /> {lead.urgency}
             </div>
          ) : null}
        </div>

        {/* Signal Context */}
        <div className="mb-8 mt-2">
           <h3 className="text-[16px] font-medium leading-relaxed text-text-primary/90 italic border-l-2 border-border-subtle pl-4 py-1">
             &quot;{lead.signalContext}&quot;
           </h3>
        </div>

        <div className="w-full h-px bg-border-subtle mb-8" />

        {/* Deep Intel Layout - Hidden until revealed */}
        <div className="flex flex-col gap-6 relative">
          {!lead.isRevealed && (
            <div className="absolute inset-0 z-10 backdrop-blur-[6px] bg-surface-secondary/50 flex flex-col items-center justify-center rounded-xl border border-white/5">
              <LockClosedIcon className="w-6 h-6 text-text-secondary mb-2" />
              <p className="text-[12px] font-bold text-text-primary tracking-widest uppercase">AI Intel Locked</p>
              <p className="text-[10px] text-text-secondary mt-1">Reveal contact to unlock deep intelligence</p>
            </div>
          )}
          <div className={!lead.isRevealed ? "opacity-30 blur-[2px] select-none" : ""}>
            <IntelBlock label="Target Buyer" value={lead.buyerType} theme={theme} />
            <IntelBlock label="Ideal Candidate" value={lead.role} theme={theme} />
            <IntelBlock label="Core Scope" value={lead.taskScope} theme={theme} />
            <IntelBlock label="Requirements" value={lead.mustHave} theme={theme} />
            <IntelBlock label="Bonus Points" value={lead.nicheBonus} theme={theme} />
          </div>
        </div>

        <div className="w-full h-px bg-border-subtle my-8" />
        
        {/* Tags & Probabilities */}
        <div className="flex flex-wrap gap-2 mb-6">
           <span className="text-[12px] text-text-secondary font-medium mr-2 self-center">Hashtags:</span>
           {lead.hashtags.map(t => (
             <span key={t} className="text-[12px] font-medium text-text-secondary/80 px-2 py-1 rounded bg-white/5">
               {t}
             </span>
           ))}
        </div>

        <div className="flex items-center gap-4">
           {lead.winProb === 'high' && (
              <div className="text-[12px] font-medium text-emerald-400">
                 Win Probability: <span className="font-bold">HIGH</span>
              </div>
           )}
           {lead.replyProbability > 80 && (
              <div className="text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1">
                  <CheckCircleIcon className="w-[14px] h-[14px]" /> {lead.replyProbability}% Reply Match
              </div>
           )}
        </div>

      </div>

      {/* Footer Area (Locked or Unlocked) */}
      <div className="p-6 bg-surface border-t border-border-subtle shrink-0 rounded-b-2xl">
         {lead.isRevealed ? (
           <div className="flex items-center justify-between gap-4">
             <div className="flex items-center gap-3 min-w-0 flex-1">
               <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent-mint/10 text-accent-mint shrink-0">
                  <UserIcon className="w-4 h-4" />
               </div>
               <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-bold text-text-primary truncate">{lead.name}</span>
                  <a href={`mailto:${lead.email}`} className="text-[12px] font-medium text-accent-cyan hover:underline flex items-center gap-1 truncate">
                    <EnvelopeIcon className="w-3 h-3 shrink-0" /> <span className="truncate">{lead.email}</span>
                  </a>
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} className="text-[12px] font-medium text-accent-orange hover:underline flex items-center gap-1 mt-1 truncate">
                      <PhoneIcon className="w-3 h-3 shrink-0" /> <span className="truncate">{lead.phone}</span>
                    </a>
                  )}
               </div>
             </div>
             <div className="flex items-center gap-2 shrink-0">
               <button 
                 onClick={handleStartOutreach}
                 disabled={isStartingOutreach}
                 className="shrink-0 whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-[12px] bg-accent-purple hover:bg-accent-purple/80 text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50"
               >
                 {isStartingOutreach ? 'Starting...' : 'Start Outreach'}
               </button>
             </div>
           </div>
         ) : (
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3 select-none">
               <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5">
                   <LockClosedIcon className="w-4 h-4 text-text-secondary" />
               </div>
               <div className="flex flex-col gap-1.5 pointer-events-none">
                  <div className="h-2 w-32 rounded-[4px] bg-white/10 blur-[1px]" />
                  <div className="h-2 w-24 rounded-[4px] bg-white/5 blur-[1px]" />
               </div>
             </div>
             
             <button 
               onClick={handleRevealClick}
               disabled={isRevealing}
               className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-[12px] bg-white/5 hover:bg-white/10 border border-border-subtle text-white transition-all disabled:opacity-50`}
             >
               {isRevealing ? (
                 <>
                   <ArrowPathIcon className="w-3 h-3 animate-spin" />
                   Unlocking...
                 </>
               ) : (
                 <>
                   Reveal Lead
                   <span className="flex items-center gap-1 text-[10px] text-text-secondary uppercase tracking-widest ml-1">
                      <BanknotesIcon className="w-3 h-3" /> -{tokenCost}
                   </span>
                 </>
               )}
             </button>
           </div>
         )}
         {errorMsg && (
           <div className="text-[11px] text-red-400 mt-3 font-medium">
             {errorMsg}
           </div>
         )}
      </div>

    </div>
  )
}

function IntelBlock({ label, value, theme }: { label: string, value: string, theme: any }) {
  return (
    <div>
      <span className={`block text-[11px] font-bold tracking-[0.15em] uppercase mb-2 opacity-80 ${theme.textAccent}`}>{label}</span>
      <span className="block text-[14px] text-text-primary/95 leading-relaxed font-medium">{value}</span>
    </div>
  )
}
