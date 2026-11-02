export function buildPrismaNicheFilter(niche: string | null | undefined): any {
  if (!niche || niche === 'All') return undefined

  const n = niche.toLowerCase().trim()
  if (n === 'seo' || n.includes('organic')) {
    return { contains: 'SEO', mode: 'insensitive' }
  }
  if (n === 'marketing' || n.includes('paid ads')) {
    return { contains: 'Marketing', mode: 'insensitive' }
  }
  if (n === 'design' || n.includes('ui/ux')) {
    return { OR: [{ contains: 'Design', mode: 'insensitive' }, { contains: 'UI/UX', mode: 'insensitive' }] }
  }
  if (n === 'web dev' || n === 'development' || n.includes('develop')) {
    return { contains: 'Develop', mode: 'insensitive' }
  }
  if (n.includes('automation') || n.includes('ai')) {
    return { contains: 'Automation', mode: 'insensitive' }
  }
  if (n.includes('copywriting') || n.includes('content')) {
    return { contains: 'Copywriting', mode: 'insensitive' }
  }
  if (n.includes('sales') || n.includes('lead gen') || n.includes('revops')) {
    return { contains: 'Sales', mode: 'insensitive' }
  }
  if (n.includes('video')) {
    return { contains: 'Video', mode: 'insensitive' }
  }
  return { contains: niche, mode: 'insensitive' }
}
