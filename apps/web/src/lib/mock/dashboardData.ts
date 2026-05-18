export interface DashboardStat {
  label: string
  value: string
  trend?: string
  trendUp?: boolean
  accent: 'mint' | 'purple' | 'cyan' | 'orange' | 'pink'
}

export const dashboardStats: DashboardStat[] = [
  {
    label: 'Analyzed Leads',
    value: '1,284',
    trend: '+12%',
    trendUp: true,
    accent: 'mint'
  },
  {
    label: 'Active Conversations',
    value: '42',
    trend: '+5',
    trendUp: true,
    accent: 'purple'
  },
  {
    label: 'Avg. Reply Probability',
    value: '84%',
    trend: '+2.4%',
    trendUp: true,
    accent: 'cyan'
  },
  {
    label: 'Credits Remaining',
    value: '750',
    trend: '/ 1,000',
    accent: 'orange'
  }
]

export const activityData = [
  { day: 'Mon', value: 45 },
  { day: 'Tue', value: 52 },
  { day: 'Wed', value: 38 },
  { day: 'Thu', value: 65 },
  { day: 'Fri', value: 48 },
  { day: 'Sat', value: 32 },
  { day: 'Sun', value: 28 },
]
