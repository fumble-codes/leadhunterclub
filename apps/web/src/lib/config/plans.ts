export type PlanId = 'FREE' | 'FREELANCER' | 'AGENCY'

export interface PlanConfig {
  id: PlanId
  name: string
  credits: number
  price: number
}

export const PLANS: Record<PlanId, PlanConfig> = {
  FREE: { id: 'FREE', name: 'Free', credits: 50, price: 0 },
  FREELANCER: { id: 'FREELANCER', name: 'Freelancer', credits: 500, price: 999 },
  AGENCY: { id: 'AGENCY', name: 'Agency', credits: 1000, price: 0 },
}

export function getPlanCredits(planId: string): number {
  return PLANS[planId as PlanId]?.credits ?? PLANS.FREE.credits
}
