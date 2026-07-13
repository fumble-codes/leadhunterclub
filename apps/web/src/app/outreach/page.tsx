'use client'

import { SparklesIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { Button } from '@/components/ui'

export default function OutreachPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] glow-purple-medium pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] glow-cyan-soft pointer-events-none" />

      <div className="relative z-10 max-w-md text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center mx-auto">
          <SparklesIcon className="w-8 h-8 text-accent-purple" />
        </div>

        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          AI Outreach Console
        </h1>

        <p className="text-text-secondary text-sm leading-relaxed">
          A dedicated workspace to generate, edit, and copy AI drafts is in development.
          Generate AI drafts from the Lead Drawer and manage your full pipeline from Saved Leads.
        </p>

        <div className="pt-4">
          <Link href="/saved">
            <Button variant="primary" color="mint" size="md">
              Go to Saved Leads
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
