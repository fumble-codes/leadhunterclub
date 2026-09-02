import type { ExternalPost } from '@/lib/external-api/client'

export function applyClaimResponseToLead(
  existing: ExternalPost,
  claimResponse: { data?: ExternalPost; success?: boolean },
): ExternalPost {
  const unlocked = claimResponse?.data
  if (!unlocked || typeof unlocked !== 'object') {
    return {
      ...existing,
      is_claimed: true,
      claimed_count: (existing.claimed_count || 0) + 1,
    }
  }

  return {
    ...existing,
    ...unlocked,
    id: unlocked.id || existing.id,
    is_claimed: true,
    claimed_count: unlocked.claimed_count ?? (existing.claimed_count || 0) + 1,
  }
}

export function extractNiches(
  keyword: string | null,
  content: string,
  intelligence: string | null
): string[] {
  const niches: string[] = []
  const kw = keyword ? keyword.toLowerCase().replace(/^watchlist:/, '') : ''
  const c = (content || '').toLowerCase()
  const intel = (intelligence || '').toLowerCase()

  // 1. Map based on keyword match
  if (kw) {
    if (kw.includes('development') || kw.includes('coder') || kw.includes('software')) {
      niches.push('development')
    }
    if (kw.includes('web dev') || kw.includes('frontend') || kw.includes('backend') || kw.includes('fullstack') || kw.includes('nextjs')) {
      niches.push('web dev')
      niches.push('development')
    }
    if (kw.includes('design') || kw.includes('ui/ux') || kw.includes('figma') || kw.includes('branding')) {
      niches.push('design')
    }
    if (kw.includes('web design')) {
      niches.push('web design')
      niches.push('design')
    }
    if (kw.includes('marketing') || kw.includes('advertising') || kw.includes('ads') || kw.includes('ppc')) {
      niches.push('marketing')
    }
    if (kw.includes('ai') || kw.includes('automation') || kw.includes('gpt') || kw.includes('agent')) {
      niches.push('ai & automation')
    }
    if (kw.includes('seo') || kw.includes('ranking')) {
      niches.push('seo')
      niches.push('marketing')
    }
    if (kw.includes('copywriting') || kw.includes('writing') || kw.includes('content writer')) {
      niches.push('copywriting')
    }
    if (kw.includes('sales') || kw.includes('revops') || kw.includes('crm') || kw.includes('pipeline')) {
      niches.push('sales & revops')
    }
  }

  // 2. Fallback to keyword matching in content/intel if no niche has been found yet
  if (niches.length === 0) {
    if (c.includes('seo') || c.includes('search engine') || c.includes('backlink')) {
      niches.push('seo')
    }
    if (c.includes('copywrit') || c.includes('writer') || c.includes('writing')) {
      niches.push('copywriting')
    }
    if (c.includes('design') || c.includes('ui/ux') || c.includes('figma') || c.includes('landing page')) {
      niches.push('design')
      if (c.includes('website design') || c.includes('web design')) {
        niches.push('web design')
      }
    }
    if (c.includes('development') || c.includes('developer') || c.includes('code') || c.includes('nextjs') || c.includes('react')) {
      niches.push('development')
      if (c.includes('web dev') || c.includes('website dev') || c.includes('frontend') || c.includes('backend')) {
        niches.push('web dev')
      }
    }
    if (c.includes('marketing') || c.includes('ad campaign') || c.includes('ads ') || c.includes('lead gen')) {
      niches.push('marketing')
    }
    if (c.includes('ai ') || c.includes('artificial intelligence') || c.includes('automation') || c.includes('n8n') || c.includes('make.com') || c.includes('zapier')) {
      niches.push('ai & automation')
    }
    if (c.includes('sales') || c.includes('crm') || c.includes('revops')) {
      niches.push('sales & revops')
    }
  }

  // Deduplicate and capitalize to match filters
  const formatted = Array.from(new Set(niches)).map(n => {
    if (n === 'ai & automation') return 'AI & Automation'
    if (n === 'web dev') return 'Web Dev'
    if (n === 'web design') return 'Web Design'
    if (n === 'seo') return 'SEO'
    if (n === 'sales & revops') return 'Sales & RevOps'
    return n.charAt(0).toUpperCase() + n.slice(1)
  })

  // Fallback to "Development" if still empty
  if (formatted.length === 0) {
    formatted.push('Development')
  }

  return formatted
}
