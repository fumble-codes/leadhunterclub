export type LeadStatus = 'new' | 'saved' | 'drafting' | 'sent' | 'replied' | 'follow-up'

export interface AppLead {
  id: string
  name: string
  email: string
  company: string
  source: string
  title: string
  signalContext: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  nicheTags: string[]
  replyProbability: number
  accent: 'mint' | 'purple' | 'cyan' | 'orange' | 'pink'
  status: LeadStatus
  timestamp: string
  lastActionDate?: string
  isActionable?: boolean
}

export const allLeads: AppLead[] = [
  {
    id: '1',
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
    status: 'saved',
    timestamp: '2h ago',
    lastActionDate: 'Sep 12, 2024'
  },
  {
    id: '2',
    name: 'Emily Thompson',
    email: 'e.thompson@vanguard.io',
    company: 'Vanguard Group',
    source: 'LinkedIn',
    title: 'Performance Marketing For —',
    signalContext: 'Scaling ad spend for Q4 but CAC is getting wildly unprofitable.',
    urgency: 'medium',
    nicheTags: ['DTC', 'Paid Ads', 'Scaling'],
    replyProbability: 85,
    accent: 'cyan',
    status: 'drafting',
    timestamp: '5h ago',
    lastActionDate: 'Sep 12, 2024'
  },
  {
    id: '3',
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
    status: 'saved',
    timestamp: '1d ago',
    lastActionDate: 'Sep 12, 2024'
  },
  {
    id: '4',
    name: 'David Anderson',
    email: 'd.anderson@prism.io',
    company: 'Prism Labs',
    source: 'Job Board',
    title: 'Sales Enablement For —',
    signalContext: 'Just hired 3 new SDRs. Clear indicator they need outbound infrastructure.',
    urgency: 'medium',
    nicheTags: ['B2B', 'Sales', 'Systems'],
    replyProbability: 75,
    accent: 'purple',
    status: 'new',
    timestamp: '3d ago',
    lastActionDate: 'Sep 11, 2024'
  },
  {
    id: '5',
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
    status: 'new',
    timestamp: '4h ago',
    lastActionDate: 'Sep 12, 2024'
  },
  {
    id: '6',
    name: 'Chris Wilson',
    email: 'c.wilson@global.co',
    company: 'Global Systems',
    source: 'Indie Hackers',
    title: 'UI/UX Design For —',
    signalContext: 'Product is built, but users are churning during the onboarding flow.',
    urgency: 'high',
    nicheTags: ['Fintech', 'UI/UX', 'Product'],
    replyProbability: 82,
    accent: 'cyan',
    status: 'new',
    timestamp: '1h ago',
    lastActionDate: 'Sep 12, 2024'
  }
]

export const getLeadsByStatus = (status: LeadStatus | 'all') => {
  if (status === 'all') return allLeads
  return allLeads.filter(l => l.status === status)
}

export const getSavedLeads = () => {
  return allLeads.filter(l => ['saved', 'drafting', 'sent', 'replied', 'follow-up'].includes(l.status))
}

export const getOutreachLeads = () => {
  return allLeads.filter(l => ['drafting', 'sent', 'replied', 'follow-up'].includes(l.status))
}
