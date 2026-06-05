import { NextResponse } from 'next/server'
import { dashboardStats, activityData } from '@/lib/mock/dashboardData'
import { allLeads } from '@/lib/mock/leadsData'

export async function GET() {
  const leads = allLeads

  return NextResponse.json({
    data: {
      stats: dashboardStats,
      activity: activityData,
      distribution: [
        { label: 'SaaS', trend: 'High Demand', color: 'mint' as const },
        { label: 'Fintech', trend: 'Growing', color: 'purple' as const },
        { label: 'E-commerce', trend: 'Saturating', color: 'orange' as const },
      ],
      readyForOutreachCount: leads.filter(l =>
        ['saved', 'drafting'].includes(l.status),
      ).length,
    },
  })
}
