export interface ScraperToolInfo {
  id: string
  name: string
  shortName: string
  icon: string
  badgeClass: string
  borderClass: string
  pillClass: string
}

/**
 * Normalizes and returns visual branding & metadata for the tool that scraped a lead.
 * Works seamlessly for newly scraped leads as well as historical records.
 */
export function getScraperToolInfo(lead: any): ScraperToolInfo {
  if (!lead) {
    return {
      id: 'apify',
      name: 'Apify',
      shortName: 'Apify',
      icon: '⚡',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      borderClass: 'border-amber-500/30',
      pillClass: 'bg-amber-500/10 text-amber-300',
    }
  }

  const rawEngine = (
    lead.scraper_engine ||
    lead.scraperEngine ||
    lead.scraperTool ||
    lead.contact_info?.scraper_engine ||
    lead.raw_result?._scraper_engine ||
    lead.raw_result?.scraper_engine ||
    lead.raw_result?.engine ||
    (lead.source === 'manual' ? 'manual' : null) ||
    (lead.source === 'seed' ? 'mock' : null) ||
    (lead.source_type === 'watchlist' || lead.source_profile || (typeof lead.keyword === 'string' && lead.keyword.startsWith('watchlist:')) ? 'apify_watchlist' : null) ||
    (lead.raw_result?.source === 'scrapedog' ? 'scrapedog' : null) ||
    (lead.raw_result?.source === 'crawlbase' ? 'crawlbase' : null) ||
    'apify'
  )
    .toString()
    .toLowerCase()
    .trim()

  if (rawEngine === 'scrapedog' || rawEngine === 'scrapingdog') {
    return {
      id: 'scrapedog',
      name: 'Scrapingdog',
      shortName: 'Scrapingdog',
      icon: '🐶',
      badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
      borderClass: 'border-orange-500/30',
      pillClass: 'bg-orange-500/10 text-orange-300',
    }
  }

  if (rawEngine === 'crawlbase') {
    return {
      id: 'crawlbase',
      name: 'Crawlbase',
      shortName: 'Crawlbase',
      icon: '🕷️',
      badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      borderClass: 'border-indigo-500/30',
      pillClass: 'bg-indigo-500/10 text-indigo-300',
    }
  }

  if (rawEngine === 'scrapingbee') {
    return {
      id: 'scrapingbee',
      name: 'ScrapingBee',
      shortName: 'ScrapingBee',
      icon: '🐝',
      badgeClass: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
      borderClass: 'border-yellow-500/30',
      pillClass: 'bg-yellow-500/10 text-yellow-300',
    }
  }

  if (rawEngine === 'zenrows') {
    return {
      id: 'zenrows',
      name: 'ZenRows',
      shortName: 'ZenRows',
      icon: '🛡️',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      borderClass: 'border-emerald-500/30',
      pillClass: 'bg-emerald-500/10 text-emerald-300',
    }
  }

  if (rawEngine === 'zyte' || rawEngine === 'zyteapi') {
    return {
      id: 'zyte',
      name: 'Zyte API',
      shortName: 'Zyte',
      icon: '⚡',
      badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      borderClass: 'border-cyan-500/30',
      pillClass: 'bg-cyan-500/10 text-cyan-300',
    }
  }

  if (rawEngine === 'manual') {
    return {
      id: 'manual',
      name: 'Manual Entry',
      shortName: 'Manual',
      icon: '✍️',
      badgeClass: 'bg-accent-mint/15 text-accent-mint border-accent-mint/30',
      borderClass: 'border-accent-mint/30',
      pillClass: 'bg-accent-mint/10 text-accent-mint',
    }
  }

  if (rawEngine === 'mock' || rawEngine === 'seed') {
    return {
      id: 'mock',
      name: 'Seed Data',
      shortName: 'Seed',
      icon: '🧪',
      badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      borderClass: 'border-purple-500/30',
      pillClass: 'bg-purple-500/10 text-purple-300',
    }
  }

  if (rawEngine === 'apify_watchlist') {
    return {
      id: 'apify',
      name: 'Apify (Watchlist)',
      shortName: 'Apify',
      icon: '⚡',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      borderClass: 'border-amber-500/30',
      pillClass: 'bg-amber-500/10 text-amber-300',
    }
  }

  // Default: Apify
  return {
    id: 'apify',
    name: 'Apify',
    shortName: 'Apify',
    icon: '⚡',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    borderClass: 'border-amber-500/30',
    pillClass: 'bg-amber-500/10 text-amber-300',
  }
}

/**
 * Formats a scrape timestamp into relative time and localized absolute format.
 */
export function formatScrapeTiming(dateStr?: string | null): {
  relative: string
  formatted: string
  isRecent: boolean
} {
  if (!dateStr) {
    return { relative: 'Never', formatted: 'No scrapes recorded', isRecent: false }
  }

  try {
    const d = new Date(dateStr)
    const diffMs = Date.now() - d.getTime()
    if (isNaN(diffMs)) {
      return { relative: 'Unknown', formatted: dateStr, isRecent: false }
    }

    const seconds = Math.max(0, Math.floor(diffMs / 1000))
    let relative = 'Just now'
    if (seconds < 60) relative = 'Just now'
    else if (seconds < 3600) relative = `${Math.floor(seconds / 60)}m ago`
    else if (seconds < 86400) relative = `${Math.floor(seconds / 3600)}h ago`
    else if (seconds < 172800) relative = 'Yesterday'
    else relative = `${Math.floor(seconds / 86400)}d ago`

    const formatted = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    return {
      relative,
      formatted,
      isRecent: diffMs < 60 * 60 * 1000, // within the last hour
    }
  } catch {
    return { relative: 'Unknown', formatted: dateStr, isRecent: false }
  }
}
