'use client'

import { Search, Filter, Clock, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export interface Lead {
  id: string
  title: string
  company: string
  timestamp: string
  urgency: 'high' | 'medium' | 'low'
  category: string
  preview: string
}

const leads: Lead[] = [
  {
    id: '1',
    title: 'AI Analytics Platform Redesign',
    company: 'Nexus AI',
    timestamp: '2m ago',
    urgency: 'high',
    category: 'Design',
    preview: "Looking for a designer who understands AI product cycles. Our current interface feels clunky...",
  },
  {
    id: '2',
    title: 'Full Stack Web3 Developer',
    company: 'Chainlink Labs',
    timestamp: '15m ago',
    urgency: 'medium',
    category: 'Engineering',
    preview: "Scaling our core infrastructure for cross-chain interoperability. Experience with Rust and Solidity...",
  },
  {
    id: '3',
    title: 'Visual Identity & Branding',
    company: 'Flow State',
    timestamp: '45m ago',
    urgency: 'low',
    category: 'Branding',
    preview: "Creating a new brand language for a performance-focused coffee startup. Minimalist and bold...",
  },
  {
    id: '4',
    title: 'Growth Marketing Lead',
    company: 'Scale.ai',
    timestamp: '1h ago',
    urgency: 'high',
    category: 'Marketing',
    preview: "Building the next generation of data labeling infrastructure. Need a growth hacker who...",
  },
]

interface LeadListProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function LeadList({ selectedId, onSelect }: LeadListProps) {
  return (
    <div className="flex flex-col h-full bg-bg-main border-r border-subtle w-full max-w-md">
      {/* Header & Search */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary tracking-tight">Intel Feed</h2>
          <button className="p-2 rounded-lg hover:bg-surface-secondary text-text-secondary transition-colors">
            <Filter size={18} />
          </button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent-mint transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search signals..."
            className="w-full bg-surface-secondary border border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent-mint/50 transition-all placeholder:text-text-secondary/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['All', 'Design', 'Engineering', 'Marketing', 'High Intent'].map((tag) => (
            <button key={tag} className="px-3 py-1.5 rounded-full bg-surface-secondary border border-subtle text-[11px] font-medium text-text-secondary hover:text-text-primary whitespace-nowrap transition-colors">
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1">
        {leads.map((lead) => {
          const isActive = selectedId === lead.id
          return (
            <motion.button
              key={lead.id}
              onClick={() => onSelect(lead.id)}
              whileHover={{ x: 4 }}
              className={`w-full text-left p-4 rounded-2xl transition-all relative group rim-light ${
                isActive 
                  ? 'bg-surface-secondary border border-subtle ring-1 ring-accent-mint/20 shadow-[0_8px_24px_rgba(0,0,0,0.2)]' 
                  : 'hover:bg-surface-secondary/50 border border-transparent'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                  lead.urgency === 'high' ? 'text-accent-orange bg-accent-orange/10' : 
                  lead.urgency === 'medium' ? 'text-accent-purple bg-accent-purple/10' : 
                  'text-accent-cyan bg-accent-cyan/10'
                }`}>
                  {lead.category}
                </span>
                <span className="text-[10px] text-text-secondary flex items-center gap-1">
                  <Clock size={10} />
                  {lead.timestamp}
                </span>
              </div>

              <h3 className={`font-semibold text-sm mb-1 line-clamp-1 transition-colors ${isActive ? 'text-accent-mint' : 'text-text-primary'}`}>
                {lead.title}
              </h3>
              <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                {lead.preview}
              </p>

              {isActive && (
                <motion.div 
                  layoutId="active-border"
                  className="absolute inset-0 rounded-2xl border border-accent-mint/30 pointer-events-none"
                />
              )}
              
              <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Zap size={14} className="text-accent-mint" />
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
