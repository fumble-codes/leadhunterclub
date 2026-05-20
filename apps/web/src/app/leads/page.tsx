'use client'

import AppSidebar from '@/components/layout/AppSidebar'
import LeadCard from './components/LeadCard'
import { Command, Search, Sparkles } from 'lucide-react'

import { allLeads } from '@/lib/mock/leadsData'

// Filtering for 'new' signals for the live feed
const feedLeads = allLeads.filter(l => l.status === 'new')

export default function LeadsPage() {
  return (
    <div className="flex h-screen bg-bg-main overflow-hidden font-sans">
      {/* App Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 pb-32 relative">
        
        {/* Ambient Background Glows */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-purple/[0.03] blur-[120px] rounded-[100%] pointer-events-none" />
        <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-accent-cyan/[0.02] blur-[100px] rounded-[100%] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto relative z-10">
          
          {/* Header & Command Bar */}
          <div className="flex flex-col items-center justify-center mb-16 mt-4">
            
            {/* Raycast-style Command Palette */}
            <div className="relative group w-full max-w-2xl mb-12">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-accent-purple/20 via-accent-cyan/20 to-accent-mint/20 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center bg-[#171A20]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-2 shadow-2xl focus-within:ring-1 focus-within:ring-white/20 transition-all">
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
                    6 Signals
                  </div>
                </h1>
                <p className="text-text-secondary/80 text-sm">Real-time conversational opportunities intercepted across your network.</p>
              </div>
            </div>
          </div>

          {/* Asymmetrical CSS Grid Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(340px,auto)]">
            {feedLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
          
        </div>
      </main>
    </div>
  )
}
