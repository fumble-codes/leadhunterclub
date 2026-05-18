'use client'

import { useState } from 'react'
import AppSidebar from '@/components/layout/AppSidebar'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Sparkles, 
  User, 
  MessageSquare, 
  Zap, 
  ChevronRight, 
  Info,
  Clock,
  ExternalLink,
  Target,
  MoreHorizontal
} from 'lucide-react'

import { getOutreachLeads } from '@/lib/mock/leadsData'

export default function OutreachPage() {
  const outreachLeads = getOutreachLeads()
  const [selectedLead, setSelectedLead] = useState(outreachLeads[0])
  const [draft, setDraft] = useState('')

  if (!selectedLead) return null // Handle empty state

  return (
    <div className="flex h-screen bg-bg-main overflow-hidden font-sans">
      <AppSidebar />

      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Thread List */}
        <div className="w-[320px] border-r border-white/[0.06] bg-[#12151A]/40 flex flex-col">
          <div className="p-6 border-b border-white/[0.06]">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <MessageSquare size={18} className="text-accent-mint" />
              Conversations
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {outreachLeads.map((lead) => (
              <button
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={`w-full text-left p-4 rounded-2xl transition-all relative group ${
                  selectedLead.id === lead.id 
                    ? 'bg-surface-secondary border border-white/[0.08] shadow-lg' 
                    : 'hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-text-primary">{lead.name}</span>
                  <span className="text-[10px] text-text-secondary font-mono">{lead.timestamp}</span>
                </div>
                <div className="text-[10px] text-accent-mint uppercase tracking-widest font-bold mb-2">
                  {lead.company}
                </div>
                <p className="text-xs text-text-secondary line-clamp-1 italic">
                  {lead.signalContext}
                </p>
                
                {selectedLead.id === lead.id && (
                  <motion.div 
                    layoutId="outreach-active"
                    className="absolute inset-0 border border-accent-mint/30 rounded-2xl pointer-events-none"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Center Column: Messaging Cockpit */}
        <div className="flex-1 flex flex-col bg-[#0F1115] relative">
          
          {/* Header */}
          <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-accent-${selectedLead.accent}/10 border border-accent-${selectedLead.accent}/20 flex items-center justify-center`}>
                <User size={20} className={`text-accent-${selectedLead.accent}`} />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary leading-tight">{selectedLead.name}</h3>
                <span className="text-xs text-text-secondary opacity-60">Conversation Thread</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/5 rounded-lg text-text-secondary transition-colors">
                <Clock size={18} />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-lg text-text-secondary transition-colors">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          {/* Chat History Placeholder */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="max-w-[80%] mx-auto text-center space-y-4 py-12">
               <div className="w-12 h-12 rounded-full bg-accent-mint/10 border border-accent-mint/20 flex items-center justify-center mx-auto text-accent-mint">
                 <Target size={24} />
               </div>
               <h4 className="text-sm font-bold text-text-primary uppercase tracking-widest">Initial Intercept Sent</h4>
               <p className="text-xs text-text-secondary italic">&quot;Hey Alex, saw your Shopify store load times are a bit sluggish. Just worked with a similar DTC brand to shave 2s off their LCP. Any interest in a quick audit?&quot;</p>
            </div>
          </div>

          {/* Strategy & Drafting Area */}
          <div className="p-6 border-t border-white/[0.06] bg-[#171A20]/40 backdrop-blur-xl">
             
             {/* AI Strategy Bar */}
             <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-mint/10 border border-accent-mint/20 text-accent-mint text-[10px] font-bold uppercase tracking-widest">
                  <Sparkles size={12} />
                  AI Angles:
                </div>
                {[
                  { label: 'Curiosity Loop', icon: Zap },
                  { label: 'Authority Play', icon: Info },
                  { label: 'Subtle Humor', icon: MessageSquare }
                ].map((angle) => (
                  <button key={angle.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-text-secondary hover:text-text-primary hover:border-white/20 transition-all whitespace-nowrap">
                    <angle.icon size={12} />
                    {angle.label}
                  </button>
                ))}
             </div>

             <div className="relative group">
                <textarea 
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Draft your socially intelligent outreach..."
                  className="w-full bg-[#0F1115] border border-white/[0.08] rounded-24px p-6 pr-24 text-sm text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-accent-mint/50 transition-all min-h-[140px] resize-none"
                />
                <button className="absolute bottom-4 right-4 p-4 bg-accent-mint text-[#11150C] rounded-xl font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(184,243,107,0.3)] transition-all">
                  Send
                  <Send size={16} />
                </button>
             </div>
          </div>
        </div>

        {/* Right Column: Intelligence Summary */}
        <div className="w-[340px] border-l border-white/[0.06] bg-[#12151A]/40 flex flex-col p-8">
           <div className="space-y-8">
              <section>
                <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Info size={12} />
                  Intelligence Brief
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
                 <div className="p-6 rounded-2xl bg-gradient-to-br from-accent-mint/10 to-transparent border border-accent-mint/20">
                    <h5 className="text-xs font-bold text-accent-mint mb-2">Socially Intelligent Note:</h5>
                    <p className="text-[11px] text-text-secondary leading-relaxed italic">
                      &quot;Alex likes direct, no-BS communication. Avoid fluff and focus on the technical Shopify metric improvement.&quot;
                    </p>
                 </div>
              </section>
           </div>
        </div>
      </main>
    </div>
  )
}
