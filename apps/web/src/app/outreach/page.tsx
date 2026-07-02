'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { PaperAirplaneIcon, SparklesIcon, UserIcon, ChatBubbleLeftRightIcon, BoltIcon, InformationCircleIcon, ClockIcon, ArrowTopRightOnSquareIcon, ViewfinderCircleIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/solid'
import { AppLead } from '@/types/lead'

function OutreachContent() {
  const searchParams = useSearchParams()
  const initialLeadId = searchParams.get('leadId')
  
  const [outreachLeads, setOutreachLeads] = useState<AppLead[]>([])
  const [selectedLead, setSelectedLead] = useState<AppLead | null>(null)
  const [draft, setDraft] = useState('')
  const [subject, setSubject] = useState('')
  const [thread, setThread] = useState<any[]>([])
  const [followUpEnabled, setFollowUpEnabled] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const fetchOutreachLeads = async () => {
      try {
        const res = await fetch('/api/leads?saved=outreach')
        const json = await res.json()
        if (json.data) {
          setOutreachLeads(json.data)
          if (initialLeadId) {
            const found = json.data.find((l: AppLead) => l.id === initialLeadId)
            setSelectedLead(found || json.data[0] || null)
          } else {
            setSelectedLead(json.data[0] || null)
          }
        }
      } catch (err) {
        console.error('Failed to fetch outreach leads:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOutreachLeads()
  }, [initialLeadId])

  useEffect(() => {
    if (!selectedLead) return
    const fetchThread = async () => {
      try {
        const res = await fetch(`/api/outreach/thread?leadId=${selectedLead.id}`)
        const json = await res.json()
        if (json.success) setThread(json.data)
      } catch (e) {
        console.error(e)
      }
    }
    fetchThread()
    setSubject('')
    setDraft('')
  }, [selectedLead?.id])

  const generateAI = async (angle: string) => {
    if (!selectedLead) return
    setIsGenerating(true)
    setErrorMsg(null)
    setDraft('AI is analyzing deep intel and drafting the perfect angle...')
    
    try {
      const res = await fetch('/api/outreach/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedLead.id, angle })
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setDraft(json.content)
        window.dispatchEvent(new Event('user-refetch'))
      } else {
        setErrorMsg(json.message || 'Failed to generate')
        setDraft('')
      }
    } catch (err) {
      setErrorMsg('Network error occurred')
      setDraft('')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSend = async () => {
    if (!selectedLead || !draft.trim() || !subject.trim()) return
    setIsSending(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedLead.id, subject, body: draft })
      })
      const json = await res.json()
      if (json.success) {
        setThread([...thread, json.data])
        setDraft('')
        setSubject('')
      } else {
        setErrorMsg(json.message)
      }
    } catch (e) {
      setErrorMsg('Failed to send')
    } finally {
      setIsSending(false)
    }
  }

  if (loading) return <div className="flex h-screen bg-bg-main items-center justify-center text-text-secondary text-sm">Loading Outreach Console...</div>
  if (!selectedLead) return <main className="flex-1 p-8 text-text-secondary">No active conversations found.</main>

  return (
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Column: Thread List */}
        <div className="w-[320px] border-r border-white/[0.06] bg-background/40 flex flex-col">
          <div className="p-6 border-b border-white/[0.06]">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-[18px] h-[18px] text-text-secondary" />
              Conversations
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {outreachLeads.map((lead) => (
              <button
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={`w-full text-left p-4 rounded-[24px] transition-all relative group ${
                  selectedLead.id === lead.id 
                    ? 'metallic-card shadow-lg' 
                    : 'hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-bold text-text-primary">{lead.name}</span>
                  <span className="text-[10px] text-text-secondary font-mono">{lead.timestamp}</span>
                </div>
                <div className="text-[10px] text-text-secondary hover:text-text-primary transition-colors uppercase tracking-widest font-bold mb-2">
                  {lead.company}
                </div>
                <p className="text-xs text-text-secondary line-clamp-1 italic">
                  {lead.signalContext}
                </p>
                
                {selectedLead.id === lead.id && (
                  <motion.div 
                    layoutId="outreach-active"
                    className="absolute inset-0 border border-border-subtle rounded-2xl pointer-events-none"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Center Column: Messaging Cockpit */}
        <div className="flex-1 flex flex-col bg-background relative">
          
          {/* Header */}
          <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-md bg-accent-${selectedLead.accent}/10 border border-accent-${selectedLead.accent}/20 flex items-center justify-center`}>
                <UserIcon className={`w-5 h-5 text-accent-${selectedLead.accent || 'mint'}`} />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary leading-tight">{selectedLead.name}</h3>
                <span className="text-xs text-text-secondary opacity-60">Conversation Thread</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/5 rounded-lg text-text-secondary transition-colors">
                <ClockIcon className="w-[18px] h-[18px]" />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-lg text-text-secondary transition-colors">
                <EllipsisHorizontalIcon className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {thread.length === 0 ? (
              <div className="max-w-[80%] mx-auto text-center space-y-4 py-12">
                 <div className="w-8 h-8 rounded-md bg-surface-secondary border border-border-subtle flex items-center justify-center mx-auto text-text-secondary hover:text-text-primary transition-colors">
                    <ViewfinderCircleIcon className="w-6 h-6" />
                 </div>
                 <h4 className="text-sm font-bold text-text-primary uppercase tracking-widest">No previous contact</h4>
                 <p className="text-xs text-text-secondary italic">Start the conversation below.</p>
              </div>
            ) : (
              thread.map(msg => (
                <div key={msg.id} className="max-w-[85%] ml-auto bg-surface border border-border-subtle rounded-[24px] rounded-br-sm p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-3 border-b border-border-subtle/50 pb-3 gap-4">
                    <span className="text-[11px] font-bold text-text-primary uppercase tracking-widest truncate">{msg.subject}</span>
                    <span className="text-[10px] text-text-secondary font-mono shrink-0">{new Date(msg.sentAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-text-secondary whitespace-pre-wrap">{msg.body}</p>
                </div>
              ))
            )}
          </div>

          {/* Strategy & Drafting Area */}
          <div className="p-6 border-t border-white/[0.06] bg-surface/40 backdrop-blur-xl">
             
             {/* AI Strategy Bar */}
             <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-secondary border border-border-subtle text-text-secondary hover:text-text-primary transition-colors text-[10px] font-bold uppercase tracking-widest">
                  <SparklesIcon className="w-3 h-3" />
                  AI Angles:
                </div>
                {[
                  { label: 'Curiosity', icon: BoltIcon },
                  { label: 'Authority', icon: InformationCircleIcon },
                  { label: 'Humor', icon: ChatBubbleLeftRightIcon }
                ].map((angle) => (
                  <button 
                    key={angle.label} 
                    onClick={() => generateAI(angle.label)}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-text-secondary hover:text-text-primary hover:border-white/20 transition-all whitespace-nowrap disabled:opacity-50"
                  >
                    <angle.icon className="w-3 h-3" />
                    {angle.label} (-2 Tokens)
                  </button>
                ))}
             </div>
             
             {errorMsg && <div className="text-red-400 text-xs mb-2">{errorMsg}</div>}

             {/* Subject line */}
             <div className="mb-4">
               <input 
                 value={subject}
                 onChange={(e) => setSubject(e.target.value)}
                 placeholder="Subject line..."
                 className="w-full bg-surface border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-accent-mint/50 transition-all font-bold"
               />
             </div>

             <div className="relative group">
                <textarea 
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Draft your socially intelligent outreach..."
                  className="w-full bg-background border border-white/[0.08] rounded-[24px] p-6 pr-24 text-sm text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-border-subtle transition-all min-h-[140px] resize-none focus:border-accent-mint/50"
                />
                <button 
                  onClick={handleSend}
                  disabled={isSending || !draft.trim() || !subject.trim()}
                  className="absolute bottom-4 right-4 p-4 bg-accent-mint text-text-on-accent rounded-xl font-bold flex items-center gap-2 hover:opacity-80 transition-all disabled:opacity-50"
                >
                  {isSending ? '...' : 'Send'}
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
             </div>
             
             {/* Follow-up Campaign Toggle */}
             <div className="mt-4 flex items-center gap-3 pl-2">
               <button 
                 onClick={() => setFollowUpEnabled(!followUpEnabled)}
                 className={`w-10 h-5 rounded-full relative transition-colors ${followUpEnabled ? 'bg-accent-orange' : 'bg-surface-secondary border border-border-subtle'}`}
               >
                 <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${followUpEnabled ? 'translate-x-5' : ''}`} />
               </button>
               <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                 Auto-Follow-up Campaign
               </span>
             </div>
          </div>
        </div>

        {/* Right Column: Intelligence Summary */}
        <div className="w-[340px] border-l border-white/[0.06] bg-background/40 flex flex-col p-8">
           <div className="space-y-8">
              <section>
                <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <InformationCircleIcon className="w-3 h-3" />
                  Intelligence Brief
                </h4>
                <div className="metallic-card p-4 space-y-3">
                  <div className="text-xs text-text-primary leading-relaxed font-medium">
                    &quot;{selectedLead.signalContext}&quot;
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[...(selectedLead.niches || []), ...(selectedLead.nicheTags || [])].map(tag => (
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
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group cursor-pointer hover:border-border-subtle transition-all">
                    <span className="text-xs text-text-secondary group-hover:text-text-primary">Company Website</span>
                    <ArrowTopRightOnSquareIcon className="w-[14px] h-[14px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group cursor-pointer hover:border-border-subtle transition-all">
                    <span className="text-xs text-text-secondary group-hover:text-text-primary">LinkedIn Profile</span>
                    <ArrowTopRightOnSquareIcon className="w-[14px] h-[14px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </section>
           </div>
        </div>
      </main>
  )
}

export default function OutreachPage() {
  return (
    <Suspense fallback={<div className="flex h-screen bg-bg-main items-center justify-center text-text-secondary text-sm">Loading Outreach Console...</div>}>
      <OutreachContent />
    </Suspense>
  )
}
