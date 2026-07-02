export type LeadStatus = 'new' | 'saved' | 'drafting' | 'sent' | 'replied' | 'follow-up'

export interface AppLead {
  id: string
  name: string
  email: string
  company: string
  source: string
  category: string
  title: string
  signalContext: string
  role: string
  taskScope: string
  mustHave: string
  nicheBonus: string
  buyerType: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  winProb: 'low' | 'medium' | 'high'
  nicheTags: string[]
  hashtags: string[]
  replyProbability: number
  status: LeadStatus
  timestamp: string
  lastActionDate?: string
  isActionable?: boolean
  niches: string[]
  isSaved?: boolean
  isRevealed?: boolean
  hasPhone?: boolean
  phone?: string | null
  accent?: 'mint' | 'purple' | 'cyan' | 'orange' | 'pink' | string
}

export const allLeads: AppLead[] = [
  {
    id: '1',
    name: 'Andy Shepard',
    email: 'a.shepard@gmail.com',
    company: 'Nexus AI',
    source: 'LEAD HUNTER CLUB',
    category: 'SHOPIFY DESIGN',
    title: 'Shopify Designer - eCommerce Conversion',
    signalContext: 'Struggling with slow load times and high bounce rates on their current Shopify store.',
    role: 'Shopify Designer / Freelancer',
    taskScope: 'Design engaging, high-converting Shopify storefronts for eCommerce brands',
    mustHave: 'Shopify storefront design expertise + strong UI/UX + conversion focus',
    nicheBonus: 'eCommerce design expertise + team collaboration + portfolio + proven results',
    buyerType: 'eCommerce Brand / Shopify Store',
    urgency: 'high',
    winProb: 'high',
    nicheTags: ['Storefront Design', 'High-Converting', 'Freelance'],
    hashtags: ['#shopify', '#design', '#ecommerce', '#conversion', '#storefront', '#freelance'],
    replyProbability: 92,
    status: 'saved',
    timestamp: '2h ago',
    lastActionDate: 'Sep 12, 2024',
    niches: ['Web Design', 'Web Dev', 'Design']
  },
  {
    id: '2',
    name: 'Emily Thompson',
    email: 'e.thompson@vanguard.io',
    company: 'Vanguard Group',
    source: 'LEAD HUNTER CLUB',
    category: 'PERFORMANCE MARKETING',
    title: 'Media Buyer - Meta & TikTok Scaling',
    signalContext: 'Scaling ad spend for Q4 but CAC is getting wildly unprofitable.',
    role: 'Performance Marketer / Agency',
    taskScope: 'Manage and scale paid acquisition across Meta and TikTok for DTC brands',
    mustHave: 'Proven track record scaling $50k+ monthly ad spend + creative strategy',
    nicheBonus: 'Experience in health & wellness DTC + UGC sourcing',
    buyerType: 'DTC Brand / 8-figure Run Rate',
    urgency: 'medium',
    winProb: 'medium',
    nicheTags: ['DTC', 'Paid Ads', 'Scaling'],
    hashtags: ['#performance', '#media', '#dtc', '#ads', '#scaling', '#tiktok'],
    replyProbability: 85,
    status: 'drafting',
    timestamp: '5h ago',
    lastActionDate: 'Sep 12, 2024',
    niches: ['Marketing']
  },
  {
    id: '3',
    name: 'Michael Carter',
    email: 'm.carter@stellar.co',
    company: 'Stellar Co',
    source: 'LEAD HUNTER CLUB',
    category: 'BRAND IDENTITY',
    title: 'Brand Designer - SaaS Rebrand',
    signalContext: 'Just raised seed round, looking to completely rebrand before product launch.',
    role: 'Brand Designer / Agency',
    taskScope: 'End-to-end visual identity revamp including logo, typography, and web assets',
    mustHave: 'B2B SaaS portfolio + modern minimal aesthetic + strict timeline management',
    nicheBonus: 'Motion design capabilities + Webflow experience',
    buyerType: 'Funded SaaS Startup',
    urgency: 'high',
    winProb: 'high',
    nicheTags: ['SaaS', 'Branding', 'Design'],
    hashtags: ['#saas', '#branding', '#design', '#identity', '#startup'],
    replyProbability: 88,
    status: 'saved',
    timestamp: '1d ago',
    lastActionDate: 'Sep 12, 2024',
    niches: ['Design']
  },
  {
    id: '4',
    name: 'David Anderson',
    email: 'd.anderson@prism.io',
    company: 'Prism Labs',
    source: 'LEAD HUNTER CLUB',
    category: 'SALES INFRASTRUCTURE',
    title: 'RevOps Specialist - Outbound Setup',
    signalContext: 'Just hired 3 new SDRs. Clear indicator they need outbound infrastructure.',
    role: 'RevOps Consultant / B2B',
    taskScope: 'Build and automate Apollo/Clay outbound sequences for a new SDR team',
    mustHave: 'Deep Apollo/Clay knowledge + deliverability setup + CRM integration',
    nicheBonus: 'Sales coaching experience + customized scripting',
    buyerType: 'B2B Services / Agency',
    urgency: 'medium',
    winProb: 'high',
    nicheTags: ['B2B', 'Sales', 'Systems'],
    hashtags: ['#revops', '#sales', '#outbound', '#apollo', '#clay'],
    replyProbability: 75,
    status: 'new',
    timestamp: '3d ago',
    lastActionDate: 'Sep 11, 2024',
    niches: ['Sales & RevOps', 'AI & Automation']
  },
  {
    id: '5',
    name: 'Lily Hernandez',
    email: 'l.hernandez@nexus.com',
    company: 'Nexus Analytics',
    source: 'LEAD HUNTER CLUB',
    category: 'SEO STRATEGY',
    title: 'Technical SEO - B2B SaaS',
    signalContext: 'Competitor just outranked them for their main keyword. Founder is stressed.',
    role: 'SEO Strategist / Consultant',
    taskScope: 'Technical audit and programmatic SEO implementation to regain lost rankings',
    mustHave: 'Enterprise SaaS SEO experience + programmatic content scaling',
    nicheBonus: 'Developer background + Next.js knowledge',
    buyerType: 'B2B Enterprise SaaS',
    urgency: 'critical',
    winProb: 'high',
    nicheTags: ['B2B SaaS', 'SEO', 'Content'],
    hashtags: ['#seo', '#b2b', '#saas', '#content', '#growth'],
    replyProbability: 95,
    status: 'new',
    timestamp: '4h ago',
    lastActionDate: 'Sep 12, 2024',
    niches: ['SEO', 'Marketing']
  },
  {
    id: '6',
    name: 'Chris Wilson',
    email: 'c.wilson@global.co',
    company: 'Global Systems',
    source: 'LEAD HUNTER CLUB',
    category: 'PRODUCT DESIGN',
    title: 'UI/UX Designer - Onboarding Flow',
    signalContext: 'Product is built, but users are churning during the onboarding flow.',
    role: 'Product Designer / UX Specialist',
    taskScope: 'Redesign user onboarding to reduce friction and improve activation rate',
    mustHave: 'Fintech product experience + behavioral psychology + user testing',
    nicheBonus: 'Framer prototyping + data analytics knowledge',
    buyerType: 'Fintech Mobile App',
    urgency: 'high',
    winProb: 'medium',
    nicheTags: ['Fintech', 'UI/UX', 'Product'],
    hashtags: ['#ui', '#ux', '#fintech', '#product', '#onboarding'],
    replyProbability: 82,
    status: 'new',
    timestamp: '1h ago',
    lastActionDate: 'Sep 12, 2024',
    niches: ['Design', 'Web Design']
  },
  {
    id: '7',
    name: 'Marcus Vance',
    email: 'm.vance@vancemedia.com',
    company: 'Aero SaaS',
    source: 'LEAD HUNTER CLUB',
    category: 'COPYWRITING',
    title: 'Conversion Copywriter - VSL & Landing Page',
    signalContext: 'Scaling spend on VSL but conversion rate is sub-1%. Need a copywriter to rewrite the hook and body.',
    role: 'Copywriter / Conversion Specialist',
    taskScope: 'Audit and rewrite landing page and VSL script to maximize conversions',
    mustHave: 'Direct response copywriting portfolio + SaaS experience',
    nicheBonus: 'Video editing coordination + rapid hook variations',
    buyerType: 'SaaS Founder / Growth Stage',
    urgency: 'high',
    winProb: 'high',
    nicheTags: ['Copywriting', 'Direct Response', 'VSL'],
    hashtags: ['#copywriting', '#vsl', '#conversion', '#saas'],
    replyProbability: 89,
    status: 'new',
    timestamp: '2h ago',
    lastActionDate: 'Sep 12, 2024',
    niches: ['Copywriting', 'Marketing']
  },
  {
    id: '8',
    name: 'Vikram Patel',
    email: 'v.patel@autoflows.ai',
    company: 'AutoFlows AI',
    source: 'LEAD HUNTER CLUB',
    category: 'AI & AUTOMATION',
    title: 'AI Automation Engineer - Custom CRM Workflows',
    signalContext: 'Sales team wasting 10 hours/week manually copy-pasting leads from Apollo to Salesforce.',
    role: 'AI / Automation Developer',
    taskScope: 'Build Make.com / Zapier workflows connecting Apollo, OpenAI, and Salesforce',
    mustHave: 'Deep Zapier/Make.com API knowledge + CRM integrations + error handling',
    nicheBonus: 'Salesforce Certified Developer + custom Node.js script capabilities',
    buyerType: 'Mid-Market Agency / B2B Services',
    urgency: 'critical',
    winProb: 'high',
    nicheTags: ['Automation', 'Make.com', 'Zapier'],
    hashtags: ['#ai', '#automation', '#zapier', '#salesforce', '#crm'],
    replyProbability: 94,
    status: 'new',
    timestamp: '5h ago',
    lastActionDate: 'Sep 12, 2024',
    niches: ['AI & Automation', 'Development']
  },
  {
    id: '9',
    name: 'Sophie Dubois',
    email: 's.dubois@frontline.dev',
    company: 'Frontline Dev',
    source: 'LEAD HUNTER CLUB',
    category: 'WEB DEVELOPMENT',
    title: 'Frontend Developer - React/Next.js Migration',
    signalContext: 'Legacy WordPress site is super slow. Want to migrate landing pages to Next.js for sub-second speeds.',
    role: 'Next.js Frontend Engineer',
    taskScope: 'Migrate design and text from WP to Next.js/Tailwind CSS with focus on performance',
    mustHave: 'React/Next.js expert + Tailwind CSS + PageSpeed optimization',
    nicheBonus: 'Framer Motion animation + SEO best practices knowledge',
    buyerType: 'Growth Agency / DTC Group',
    urgency: 'high',
    winProb: 'medium',
    nicheTags: ['Frontend', 'Next.js', 'React'],
    hashtags: ['#nextjs', '#react', '#frontend', '#webdev', '#migration'],
    replyProbability: 81,
    status: 'new',
    timestamp: '6h ago',
    lastActionDate: 'Sep 12, 2024',
    niches: ['Development', 'Web Dev']
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
