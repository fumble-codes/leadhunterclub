import { api } from '@/lib/api'
import type { DashboardData } from '@leadhunter/shared'

export const dashboardService = {
  getData: () =>
    api.get<DashboardData>('/dashboard'),
}
