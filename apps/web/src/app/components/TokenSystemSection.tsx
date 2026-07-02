'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LockClosedIcon, BanknotesIcon, CheckCircleIcon, ChevronRightIcon, ChartBarSquareIcon, EyeIcon, UserIcon, EnvelopeIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/solid'

const ease = [0.16, 1, 0.3, 1] as const;

interface LeadCardData {
  id: string;
  name: string;
  email: string;
  company: string;
  source: string;
  title: string;
  signalContext: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  nicheTags: string[];
  replyProbability: number;
  accent: 'mint' | 'purple' | 'cyan' | 'orange' | 'pink';
  isLocked: boolean;
}

const themeMap = {
  mint: {
    cardBg: 'bg-accent-mint',
    text: 'text-text-on-accent',
    textMuted: 'text-text-on-accent/60',
    tagBg: 'bg-text-on-accent/10 border-text-on-accent/10',
    matchTag: 'bg-text-on-accent text-text-secondary hover:text-text-primary transition-colors',
    button: 'bg-text-on-accent hover:bg-black text-text-secondary hover:text-text-primary transition-colors',
    blurBg: 'bg-text-on-accent/10',
    blurLine: 'bg-text-on-accent/15',
    buttonReveal: 'bg-text-on-accent text-text-on-accent hover:bg-black/10'
  },
  purple: {
    cardBg: 'bg-accent-purple',
    text: 'text-white',
    textMuted: 'text-white/70',
    tagBg: 'bg-white/10 border-white/20',
    matchTag: 'bg-white text-text-on-accent',
    button: 'bg-white hover:bg-white/90 text-text-on-accent',
    blurBg: 'bg-white/10',
    blurLine: 'bg-white/20',
    buttonReveal: 'bg-white text-white hover:bg-white/10'
  },
  cyan: {
    cardBg: 'bg-accent-cyan',
    text: 'text-text-on-accent',
    textMuted: 'text-text-on-accent/60',
    tagBg: 'bg-text-on-accent/10 border-text-on-accent/10',
    matchTag: 'bg-text-on-accent text-text-secondary hover:text-text-primary transition-colors',
    button: 'bg-text-on-accent hover:bg-black text-text-secondary hover:text-text-primary transition-colors',
    blurBg: 'bg-text-on-accent/10',
    blurLine: 'bg-text-on-accent/15',
    buttonReveal: 'bg-text-on-accent text-text-on-accent hover:bg-black/10'
  },
  orange: {
    cardBg: 'bg-accent-orange',
    text: 'text-text-on-accent',
    textMuted: 'text-text-on-accent/60',
    tagBg: 'bg-text-on-accent/10 border-text-on-accent/10',
    matchTag: 'bg-text-on-accent text-text-secondary hover:text-text-primary transition-colors',
    button: 'bg-text-on-accent hover:bg-text-on-accent/90 text-white',
    blurBg: 'bg-text-on-accent/10',
    blurLine: 'bg-text-on-accent/15',
    buttonReveal: 'bg-text-on-accent text-text-on-accent hover:bg-black/10'
  },
  pink: {
    cardBg: 'bg-accent-pink',
    text: 'text-text-on-accent',
    textMuted: 'text-text-on-accent/60',
    tagBg: 'bg-text-on-accent/10 border-text-on-accent/10',
    matchTag: 'bg-text-on-accent text-text-secondary hover:text-text-primary transition-colors',
    button: 'bg-text-on-accent hover:bg-black text-text-secondary hover:text-text-primary transition-colors',
    blurBg: 'bg-text-on-accent/10',
    blurLine: 'bg-text-on-accent/15',
    buttonReveal: 'bg-text-on-accent text-text-on-accent hover:bg-black/10'
  },
};

export default function TokenSystemSection() {
  const [tokens, setTokens] = useState(750);
  const [activeTab, setActiveTab] = useState<'leads' | 'outreach' | 'automation'>('leads');
  const [activeCardId, setActiveCardId] = useState<string>('card-2');
  const [isRevealing, setIsRevealing] = useState<string | null>(null);

  // 3 real high-fidelity UI cards matching exact leadsData mock accents & copy
  const [leads, setLeads] = useState<LeadCardData[]>([
    {
      id: 'card-1',
      name: 'Andy Shepard',
      email: 'a.shepard@gmail.com',
      company: 'Nexus AI',
      source: 'Twitter',
      title: 'Web Development For —',
      signalContext: 'Struggling with slow load times and high bounce rates on their current Shopify store.',
      urgency: 'high',
      nicheTags: ['E-Commerce', 'Web Dev', 'Shopify'],
      replyProbability: 92,
      accent: 'orange',
      isLocked: true,
    },
    {
      id: 'card-2',
      name: 'Michael Carter',
      email: 'm.carter@stellar.co',
      company: 'Stellar Co',
      source: 'Reddit',
      title: 'Brand Identity For —',
      signalContext: 'Just raised seed round, looking to completely rebrand before product launch.',
      urgency: 'high',
      nicheTags: ['SaaS', 'Branding', 'Design'],
      replyProbability: 88,
      accent: 'mint',
      isLocked: true,
    },
    {
      id: 'card-3',
      name: 'Lily Hernandez',
      email: 'l.hernandez@nexus.com',
      company: 'Nexus Analytics',
      source: 'Twitter',
      title: 'SEO Strategy For —',
      signalContext: 'Competitor just outranked them for their main keyword. Founder is stressed.',
      urgency: 'critical',
      nicheTags: ['B2B SaaS', 'SEO', 'Content'],
      replyProbability: 95,
      accent: 'pink',
      isLocked: true,
    },
    {
      id: 'card-4',
      name: 'David Chen',
      email: 'd.chen@apexflow.io',
      company: 'ApexFlow',
      source: 'LinkedIn',
      title: 'SaaS Platform For —',
      signalContext: 'Looking for a dedicated Node/React team to refactor their legacy subscription architecture.',
      urgency: 'high',
      nicheTags: ['SaaS', 'Node.js', 'Refactor'],
      replyProbability: 94,
      accent: 'purple',
      isLocked: true,
    },
    {
      id: 'card-5',
      name: 'Sarah Jenkins',
      email: 's.jenkins@elevateops.net',
      company: 'Elevate Ops',
      source: 'Threads',
      title: 'Cold Outreach For —',
      signalContext: 'Struggling with 1% open rates on cold outbound campaigns, seeking deliverability expert.',
      urgency: 'critical',
      nicheTags: ['Outbound', 'Deliverability', 'SMTP'],
      replyProbability: 91,
      accent: 'cyan',
      isLocked: true,
    },
  ]);

  const handleReveal = (id: string) => {
    if (tokens < 3) {
      setTokens(750); // Reset for simulation
      return;
    }
    
    setIsRevealing(id);

    setTimeout(() => {
      setTokens(prev => prev - 3);
      setLeads(prev => prev.map(lead => {
        if (lead.id === id) {
          return { ...lead, isLocked: false };
        }
        return lead;
      }));
      setIsRevealing(null);
    }, 700);
  };

  const activeCardIndex = leads.findIndex(l => l.id === activeCardId);

  return (
    <section id="tokens" className="py-40 px-6 max-w-[1300px] mx-auto overflow-hidden">
      
      {/* Centered Header Section with Big Eyebrow */}
      <div className="text-center mb-24 max-w-4xl mx-auto space-y-5">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-text-secondary/40">
          Simple Token-Based System
        </span>
        <h2 className="font-display text-4xl md:text-5xl lg:text-[56px] font-semibold tracking-tight text-text-primary leading-[1.1] max-w-3xl mx-auto">
          You control how your workflow operates.
        </h2>
        <p className="text-base md:text-lg text-text-secondary font-light leading-relaxed max-w-3xl mx-auto">
          Every subscription includes monthly tokens. Use them however you want—unlock qualified leads, generate personalized AI outreach, and access real-time intent intelligence. No bloated pricing tiers, and no paying for features you never use.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Column (40%): Explanatory Text & Clerk-Style Accordion/Tabs */}
        <div className="lg:col-span-5 space-y-8 text-left">

          {/* Core Balance Pill */}
          <div className="p-4 rounded-2xl bg-code-bg-dark border border-white/[0.08] flex items-center justify-between">
            <span className="text-xs font-mono tracking-widest uppercase text-text-secondary/60">
              Live Token Ledger Simulator
            </span>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-xl">
              <BanknotesIcon className="w-4 h-4 text-text-secondary animate-pulse" />
              <span className="font-mono text-base font-bold text-text-primary">
                {tokens} Credits
              </span>
              {tokens < 745 && (
                <button 
                  onClick={() => setTokens(750)} 
                  className="ml-2 text-xs text-text-secondary/40 hover:text-text-primary transition-colors"
                  title="Reset Token Balance"
                >
                  <ArrowPathIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Clerk-Style Feature Tabs Accordion */}
          <div className="space-y-4">
            
            {/* Accordion Item 1 */}
            <div 
              onClick={() => setActiveTab('leads')}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                activeTab === 'leads' 
                  ? 'bg-white/[0.03] border-white/10 shadow-[inset_0_1px_0_rgba(var(--rgb-white),0.05)]' 
                  : 'bg-transparent border-transparent hover:bg-white/[0.01]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold font-mono tracking-widest uppercase ${activeTab === 'leads' ? 'text-text-secondary hover:text-text-primary transition-colors' : 'text-text-secondary'} 'text-accent-pink'`}>
                  ● USER INTENT FEEDS
                </span>
                <ChevronRightIcon className={`w-4 h-4 text-text-secondary transition-transform duration-300 ${activeTab === 'leads' ? 'rotate-90' : ''}`} />
              </div>
              
              {activeTab === 'leads' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  transition={{ duration: 0.3, ease }}
                  className="mt-3 overflow-hidden text-xs text-text-secondary space-y-3 pl-3"
                >
                  <p className="leading-relaxed">
                    This stack simulates a live lead feed. Selecting a card focuses on the prospect&apos;s real pain point. Clicking &apos;Reveal&apos; costs 3 tokens, decrypting the verified email address and contact name instantly.
                  </p>
                  
                  {/* Target selectors within Accordion */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    {leads.map((lead) => (
                      <button
                        key={lead.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCardId(lead.id);
                        }}
                        className={`text-left px-3 py-2 rounded-lg text-[11px] font-mono flex items-center justify-between border transition-all ${
                          activeCardId === lead.id
                            ? 'bg-white/5 border-white/10 text-text-primary font-bold'
                            : 'bg-transparent border-transparent text-text-secondary/60 hover:text-text-primary'
                        }`}
                      >
                        <span>{lead.company} ({lead.source})</span>
                        {lead.isLocked ? (
                          <span className="text-[10px] text-badge-amber font-bold uppercase tracking-wider">Locked</span>
                        ) : (
                          <span className="text-[10px] text-text-secondary hover:text-text-primary transition-colors font-bold uppercase tracking-wider">Revealed</span>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Accordion Item 2 */}
            <div 
              onClick={() => setActiveTab('outreach')}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                activeTab === 'outreach' 
                  ? 'bg-white/[0.03] border-white/10 shadow-[inset_0_1px_0_rgba(var(--rgb-white),0.05)]' 
                  : 'bg-transparent border-transparent hover:bg-white/[0.01]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold font-mono tracking-widest uppercase ${activeTab === 'outreach' ? 'text-text-secondary hover:text-text-primary transition-colors' : 'text-text-secondary'} 'text-accent-pink'`}>
                  ○ GENERATE OUTREACH
                </span>
                <ChevronRightIcon className={`w-4 h-4 text-text-secondary transition-transform duration-300 ${activeTab === 'outreach' ? 'rotate-90' : ''}`} />
              </div>
              
              {activeTab === 'outreach' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  transition={{ duration: 0.3, ease }}
                  className="mt-3 overflow-hidden text-xs text-text-secondary pl-3"
                >
                  <p className="leading-relaxed">
                    Custom outreach writes personalized copy based on targeted intent signals. Connect your SMTP directly inside the LH console to dispatch.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Accordion Item 3 */}
            <div 
              onClick={() => setActiveTab('automation')}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                activeTab === 'automation' 
                  ? 'bg-white/[0.03] border-white/10 shadow-[inset_0_1px_0_rgba(var(--rgb-white),0.05)]' 
                  : 'bg-transparent border-transparent hover:bg-white/[0.01]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold font-mono tracking-widest uppercase ${activeTab === 'automation' ? 'text-text-secondary hover:text-text-primary transition-colors' : 'text-text-secondary'} 'text-accent-pink'`}>
                  ○ CAMPAIGN AUTOMATION
                </span>
                <ChevronRightIcon className={`w-4 h-4 text-text-secondary transition-transform duration-300 ${activeTab === 'automation' ? 'rotate-90' : ''}`} />
              </div>
              
              {activeTab === 'automation' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  transition={{ duration: 0.3, ease }}
                  className="mt-3 overflow-hidden text-xs text-text-secondary pl-3"
                >
                  <p className="leading-relaxed">
                    Automate context‑aware follow‑up branches directly inside your campaigns to maximize conversions while maintaining high personal fidelity.
                  </p>
                </motion.div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column (60%): Layered Offset 3D Stack (Matches Clerk Components perfectly) */}
        <div className="lg:col-span-7 flex items-center justify-center py-20 relative min-h-[460px] md:min-h-[500px]">
          
          {/* Decorative Background grid glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--rgb-white),0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          {/* Layered sheets container */}
          <div className="relative w-full max-w-[420px] h-[340px]">
            {leads.map((lead, idx) => {
              const theme = themeMap[lead.accent];
              const isActive = lead.id === activeCardId;
              
              // Calculate horizontal perspective layout
              const offset = idx - activeCardIndex;
              const isBehind = Math.abs(offset) > 0;

              // Ensure exactly 3 cards are always visible by adjusting offset boundaries
              let displayOffset = offset;
              if (offset === 2 && activeCardIndex !== 0) {
                displayOffset = 999; // Hide beyond first-card boundary
              }
              if (offset === -2 && activeCardIndex !== leads.length - 1) {
                displayOffset = -999; // Hide beyond last-card boundary
              }

              let zIndex = 20;
              let xTranslation = 0;
              let scaleVal = 1.05;
              let rotation = 0;
              let filterClass = 'blur-0 opacity-100 scale-100 pointer-events-auto';

              if (displayOffset === 0) {
                zIndex = 20;
                xTranslation = 0;
                scaleVal = 1.05;
                rotation = 0;
                filterClass = 'blur-0 opacity-100 scale-100 pointer-events-auto';
              } else if (displayOffset === -1) {
                // Shifted to the left/behind
                zIndex = 10;
                xTranslation = -110;
                scaleVal = 0.88;
                rotation = -6;
                filterClass = 'blur-[1.5px] opacity-50 hover:opacity-75 cursor-pointer pointer-events-auto';
              } else if (displayOffset === 1) {
                // Shifted to the right/behind
                zIndex = 10;
                xTranslation = 110;
                scaleVal = 0.88;
                rotation = 6;
                filterClass = 'blur-[1.5px] opacity-50 hover:opacity-75 cursor-pointer pointer-events-auto';
              } else if (displayOffset === -2) {
                // Far left/behind card (visible when active is the last card)
                zIndex = 5;
                xTranslation = -200;
                scaleVal = 0.76;
                rotation = -12;
                filterClass = 'blur-[3px] opacity-25 hover:opacity-50 cursor-pointer pointer-events-auto';
              } else if (displayOffset === 2) {
                // Far right/behind card (visible when active is the first card)
                zIndex = 5;
                xTranslation = 200;
                scaleVal = 0.76;
                rotation = 12;
                filterClass = 'blur-[3px] opacity-25 hover:opacity-50 cursor-pointer pointer-events-auto';
              } else {
                // Completely hidden cards out of sight
                zIndex = 0;
                scaleVal = 0.7;
                xTranslation = displayOffset * 180;
                filterClass = 'opacity-0 pointer-events-none';
              }

              return (
                <motion.div
                  key={lead.id}
                  style={{ zIndex }}
                  animate={{
                    x: xTranslation,
                    scale: scaleVal,
                    rotate: rotation,
                  }}
                  transition={{ duration: 0.6, ease }}
                  onClick={() => {
                    if (isBehind) {
                      setActiveCardId(lead.id);
                      setActiveTab('leads');
                    }
                  }}
                  className={`absolute top-0 left-0 right-0 text-left flex flex-col p-6 rounded-[28px] overflow-hidden min-h-[320px] w-full shadow-[0_30px_100px_rgba(var(--rgb-black),0.6)] border transition-all duration-300 ${theme.cardBg} ${filterClass}`}
                >
                  {/* Decorative card glow */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] to-transparent pointer-events-none" />

                  {/* Header: Source & Urgency */}
                  <div className="flex items-center justify-between mb-5 w-full relative z-10 bg-gradient-to-tr">
                    <div className="flex items-center gap-2 bg-gradient-to-tr">
                      <div className={`w-2 h-2 rounded-full bg-current ${theme.text}`} />
                      <span className={`text-[10px] font-mono font-bold tracking-[0.2em] uppercase ${theme.textMuted}`}>
                        {lead.source}
                      </span>
                    </div>

                    <div className={`flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider ${theme.textMuted}`}>
                      <ChartBarSquareIcon className="w-3 h-3" />
                      {lead.urgency}
                    </div>
                  </div>

                  {/* Small Title */}
                  <h4 className={`text-[11px] font-mono font-bold tracking-[0.15em] uppercase mb-2 ${theme.text}`}>
                    {lead.title}
                  </h4>

                  {/* Big context block quotes */}
                  <h3 className={`text-lg md:text-[20px] font-semibold tracking-tight leading-[1.3] mb-6 flex-grow ${theme.text}`}>
                    &quot;{lead.signalContext}&quot;
                  </h3>

                  {/* Niche tags list */}
                  <div className="flex flex-wrap gap-1.5 mb-6 relative z-10 bg-gradient-to-tr">
                    {lead.nicheTags.map(tag => (
                      <span key={tag} className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border ${theme.tagBg} ${theme.text}`}>
                        {tag}
                      </span>
                    ))}
                    {lead.replyProbability > 90 && (
                      <span className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border-transparent flex items-center gap-1.5 shadow-sm ${theme.matchTag}`}>
                        <CheckCircleIcon className="w-3 h-3" /> {lead.replyProbability}% Match
                      </span>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="w-full pt-4 flex items-center justify-between shrink-0 border-t border-black/5 relative z-10">
                    
                    {/* Credentials details section (blurred or unlocked) */}
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${theme.blurBg}`}>
                        {lead.isLocked ? (
                          <LockClosedIcon className={`w-[14px] h-[14px] ${theme.textMuted}`} />
                        ) : (
                          <UserIcon className={`w-[14px] h-[14px] ${theme.text}`} />
                        )}
                      </div>

                      <div className="flex flex-col">
                        <AnimatePresence mode="wait">
                          {lead.isLocked ? (
                            <motion.div 
                              key="locked"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex flex-col gap-1.5"
                            >
                              <div className={`h-2.5 w-24 rounded blur-[2px] ${theme.blurLine}`} />
                              <div className={`h-2.5 w-32 rounded blur-[2px] ${theme.blurBg}`} />
                            </motion.div>
                          ) : (
                            <motion.div 
                              key="unlocked"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-col text-[11px] leading-tight"
                            >
                              <span className={`font-bold ${theme.text}`}>{lead.name}</span>
                              <span className={`font-mono ${theme.textMuted} text-[10px]`}>{lead.email}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      {lead.isLocked ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isActive) handleReveal(lead.id);
                          }}
                          disabled={isRevealing !== null || !isActive}
                          className={`flex items-center gap-1 px-4 py-2.5 rounded-xl font-bold text-[12px] shadow-md transition-all active:scale-95 duration-200 border border-black/5 cursor-pointer ${theme.button}`}
                        >
                          {isRevealing === lead.id ? (
                            <span className="animate-pulse">Decoding...</span>
                          ) : (
                            <>
                              Reveal
                              <span className="flex items-center gap-0.5 opacity-90 text-[10px] uppercase font-mono tracking-widest ml-1 font-bold">
                                <BanknotesIcon className="w-3 h-3 text-current" /> -3
                              </span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border border-black/10 bg-black/10 ${theme.text}`}>
                          <CheckCircleIcon className="w-4 h-4 text-current" /> Unlocked
                        </div>
                      )}
                    </div>

                  </div>

                </motion.div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
