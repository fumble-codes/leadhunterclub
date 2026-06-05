'use client'

import { motion } from 'framer-motion'
import { Activity, Lock, Coins, ShieldCheck } from 'lucide-react'

import { AppLead } from '@/lib/mock/leadsData'

const themeMap = {
  mint: { cardBg: 'bg-accent-mint', text: 'text-[#11150C]', textMuted: 'text-[#11150C]/60', tagBg: 'bg-[#11150C]/10 border-[#11150C]/10', matchTag: 'bg-[#11150C] text-accent-mint', button: 'bg-[#11150C] hover:bg-black text-accent-mint', blurBg: 'bg-[#11150C]/10', blurLine: 'bg-[#11150C]/15' },
  purple: { cardBg: 'bg-accent-purple', text: 'text-white', textMuted: 'text-white/70', tagBg: 'bg-white/10 border-white/20', matchTag: 'bg-white text-[#11150C]', button: 'bg-white hover:bg-white/90 text-[#11150C]', blurBg: 'bg-white/10', blurLine: 'bg-white/20' },
  cyan: { cardBg: 'bg-accent-cyan', text: 'text-[#11150C]', textMuted: 'text-[#11150C]/60', tagBg: 'bg-[#11150C]/10 border-[#11150C]/10', matchTag: 'bg-[#11150C] text-accent-cyan', button: 'bg-[#11150C] hover:bg-black text-accent-cyan', blurBg: 'bg-[#11150C]/10', blurLine: 'bg-[#11150C]/15' },
  orange: { cardBg: 'bg-accent-orange', text: 'text-[#11150C]', textMuted: 'text-[#11150C]/60', tagBg: 'bg-[#11150C]/10 border-[#11150C]/10', matchTag: 'bg-[#11150C] text-accent-orange', button: 'bg-[#11150C] hover:bg-black text-accent-orange', blurBg: 'bg-[#11150C]/10', blurLine: 'bg-[#11150C]/15' },
  pink: { cardBg: 'bg-accent-pink', text: 'text-[#11150C]', textMuted: 'text-[#11150C]/60', tagBg: 'bg-[#11150C]/10 border-[#11150C]/10', matchTag: 'bg-[#11150C] text-accent-pink', button: 'bg-[#11150C] hover:bg-black text-accent-pink', blurBg: 'bg-[#11150C]/10', blurLine: 'bg-[#11150C]/15' },
}

export default function LeadCard({ lead, onClick }: { lead: AppLead; onClick?: () => void }) {
  const theme = themeMap[lead.accent]
  
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`group relative text-left flex flex-col p-6 rounded-[28px] overflow-hidden min-h-[300px] w-full h-full col-span-1 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-[background-color,border-color,box-shadow] duration-300 ${theme.cardBg}`}
    >
      
      {/* Header: Source & Urgency */}
      <div className="flex items-center justify-between mb-5 w-full shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full bg-current ${theme.text}`} />
          <span className={`text-[11px] font-bold tracking-[0.2em] uppercase ${theme.textMuted}`}>
            {lead.source}
          </span>
        </div>
        
        <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${theme.textMuted}`}>
          <Activity size={14} />
          {lead.urgency}
        </div>
      </div>
 
      {/* Small Title */}
      <h4 className={`text-[13px] font-bold tracking-widest uppercase mb-3 shrink-0 ${theme.text}`}>
        {lead.title}
      </h4>
 
      {/* Dynamic Signal Context description with full-stretching flex growth */}
      <h3 className={`text-[22px] font-semibold tracking-tight leading-[1.3] mb-6 flex-grow ${theme.text}`}>
        &quot;{lead.signalContext}&quot;
      </h3>
 
      {/* Niche Tags */}
      <div className="flex flex-wrap gap-2 mb-6 shrink-0">
        {lead.nicheTags.map(tag => (
          <span key={tag} className={`px-3 py-1.5 text-[12px] font-semibold rounded-lg border ${theme.tagBg} ${theme.text}`}>
            {tag}
          </span>
        ))}
        {lead.replyProbability > 80 && (
            <span className={`px-3 py-1.5 text-[12px] font-bold rounded-lg border-transparent flex items-center gap-1.5 shadow-sm ${theme.matchTag}`}>
              <ShieldCheck size={14} className="stroke-[2.5]" /> {lead.replyProbability}% Match
            </span>
        )}
      </div>
 
      {/* Footer Area */}
      <div className="w-full pt-4 flex items-center justify-between shrink-0 border-t border-black/5 mt-auto">
        
        {/* Blurred Details Area */}
        <div className="flex items-center gap-3 select-none">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center overflow-hidden ${theme.blurBg}`}>
             <Lock size={16} className={theme.textMuted} />
          </div>
          <div className="flex flex-col gap-1.5 pointer-events-none">
             <div className={`h-3 w-28 rounded-[4px] blur-[2px] ${theme.blurLine}`} />
             <div className={`h-2.5 w-36 rounded-[4px] blur-[2px] ${theme.blurBg}`} />
          </div>
        </div>
        
        {/* Action Button */}
        <div className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-[13px] shadow-lg transition-all active:scale-95 ${theme.button}`}>
          Reveal
          <span className="flex items-center gap-1 opacity-90 text-[10px] uppercase tracking-widest ml-1">
            <Coins size={14} /> -3
          </span>
        </div>
 
      </div>
    </motion.button>
  )
}
