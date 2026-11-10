'use client'

import React from 'react'
import { detectNiche } from '@/lib/claim-reveal'
import {
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  PaintBrushIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  MegaphoneIcon,
  PencilIcon,
  FilmIcon,
  UserPlusIcon,
  CpuChipIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline'

export interface NicheBadgeProps {
  niche?: string | null
  keyword?: string | null
  content?: string | null
  intelligence?: string | null
  className?: string
  size?: 'xs' | 'sm'
}

/* Icon = literal, domain-specific glyph per niche (repo icon rules: outline
   heroicons, 1.6 stroke set globally by className sizing; no emoji, no
   sparkles/bolts). Colors stay per-niche category tokens. */
const NICHE_STYLES: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  'Web Development': {
    bg: 'bg-[#08283b]',
    text: 'text-cyan-300',
    border: 'border-cyan-400/40',
    icon: <CodeBracketIcon className="w-3 h-3 shrink-0" strokeWidth={1.6} />,
  },
  'Mobile Development': {
    bg: 'bg-[#0a2342]',
    text: 'text-blue-300',
    border: 'border-blue-400/40',
    icon: <DevicePhoneMobileIcon className="w-3 h-3 shrink-0" strokeWidth={1.6} />,
  },
  'UI/UX Design': {
    bg: 'bg-[#211138]',
    text: 'text-purple-200',
    border: 'border-purple-400/40',
    icon: <PaintBrushIcon className="w-3 h-3 shrink-0" strokeWidth={1.6} />,
  },
  'Branding & Design': {
    bg: 'bg-[#290e2e]',
    text: 'text-fuchsia-200',
    border: 'border-fuchsia-400/40',
    icon: <TagIcon className="w-3 h-3 shrink-0" strokeWidth={1.6} />,
  },
  'SEO & Organic Growth': {
    bg: 'bg-[#082a1e]',
    text: 'text-emerald-300',
    border: 'border-emerald-400/40',
    icon: <ArrowTrendingUpIcon className="w-3 h-3 shrink-0" strokeWidth={1.6} />,
  },
  'Paid Ads & Marketing': {
    bg: 'bg-[#08272b]',
    text: 'text-teal-200',
    border: 'border-teal-400/40',
    icon: <MegaphoneIcon className="w-3 h-3 shrink-0" strokeWidth={1.6} />,
  },
  'Content & Copywriting': {
    bg: 'bg-[#2b1f09]',
    text: 'text-amber-300',
    border: 'border-amber-400/40',
    icon: <PencilIcon className="w-3 h-3 shrink-0" strokeWidth={1.6} />,
  },
  'Video Production & Editing': {
    bg: 'bg-[#2d0e1b]',
    text: 'text-rose-300',
    border: 'border-rose-400/40',
    icon: <FilmIcon className="w-3 h-3 shrink-0" strokeWidth={1.6} />,
  },
  'Sales & Lead Gen': {
    bg: 'bg-[#2e1608]',
    text: 'text-orange-300',
    border: 'border-orange-400/40',
    icon: <UserPlusIcon className="w-3 h-3 shrink-0" strokeWidth={1.6} />,
  },
  'AI & Automation': {
    bg: 'bg-[#1b1238]',
    text: 'text-violet-200',
    border: 'border-violet-400/40',
    icon: <CpuChipIcon className="w-3 h-3 shrink-0" strokeWidth={1.6} />,
  },
  'Consulting & Strategy': {
    bg: 'bg-[#121638]',
    text: 'text-indigo-200',
    border: 'border-indigo-400/40',
    icon: <BriefcaseIcon className="w-3 h-3 shrink-0" strokeWidth={1.6} />,
  },
  'General': {
    bg: 'bg-[#181a20]',
    text: 'text-zinc-300',
    border: 'border-zinc-500/30',
    icon: <TagIcon className="w-3 h-3 shrink-0" strokeWidth={1.6} />,
  },
}

const DEFAULT_STYLE = {
  bg: 'bg-white/[0.06]',
  text: 'text-text-secondary',
  border: 'border-white/10',
  icon: <TagIcon className="w-3 h-3 shrink-0" strokeWidth={1.6} />,
}

export function resolveNiche(
  niche?: string | null,
  keyword?: string | null,
  content?: string | null,
  intelligence?: string | null,
): string {
  return detectNiche({ niche, keyword, content, intelligence })
}

export function NicheBadge({
  niche,
  keyword,
  content,
  intelligence,
  className = '',
  size = 'xs',
}: NicheBadgeProps) {
  const resolved = resolveNiche(niche, keyword, content, intelligence)
  const style = NICHE_STYLES[resolved] || DEFAULT_STYLE

  const sizeClasses =
    size === 'xs'
      ? 'text-[10px] px-2 py-0.5 tracking-tight'
      : 'text-xs px-2.5 py-1 tracking-normal'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border backdrop-blur-sm shadow-sm transition-all ${style.bg} ${style.text} ${style.border} ${sizeClasses} ${className}`}
      title={`Niche: ${resolved}`}
    >
      {style.icon}
      <span>{resolved}</span>
    </span>
  )
}
