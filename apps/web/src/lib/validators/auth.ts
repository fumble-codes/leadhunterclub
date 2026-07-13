import { z } from 'zod'

export const adminRegisterSchema = z.object({
  key: z.string().min(1, 'Registration key is required'),
})

export const adminUserActionSchema = z
  .object({
    action: z.enum(['APPROVE', 'REJECT', 'SUSPEND', 'ACTIVATE', 'RENEW_NOW']).optional(),
    plan: z.enum(['FREE', 'FREELANCER', 'AGENCY']).optional(),
    bonusCredits: z.number().int().min(0).optional(),
    changePlan: z.enum(['FREE', 'FREELANCER', 'AGENCY']).optional(),
  })
  .refine(
    (data) => data.action !== undefined || data.bonusCredits !== undefined || data.changePlan !== undefined,
    {
      message: 'Provide action (APPROVE/REJECT/SUSPEND/ACTIVATE/RENEW_NOW), bonusCredits, or changePlan',
    },
  )

export const onboardingSchema = z.object({
  portfolio: z.string().optional(),
  website: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  servicesOffered: z.array(z.string()).min(1, 'Select at least one service'),
  preferredLeadCategories: z.array(z.string()).min(1, 'Select at least one category'),
  outreachExperience: z.string().min(1, 'Tell us about your outreach experience'),
  discoverySource: z.string().min(1, 'Tell us how you found us'),
})

export const leadRevealSchema = z.object({
  leadId: z.string().min(1, 'leadId is required'),
})

export const outreachGenerateSchema = z.object({
  leadId: z.string().min(1, 'leadId is required'),
  angle: z.string().min(1, 'angle is required'),
})

export const outreachSendSchema = z.object({
  leadId: z.string().min(1, 'leadId is required'),
  subject: z.string().min(1, 'subject is required'),
  body: z.string().min(1, 'body is required'),
})

export const updateLeadSchema = z.object({
  status: z.enum(['new', 'saved', 'drafting', 'sent', 'replied', 'follow-up']).optional(),
  isSaved: z.boolean().optional(),
})

export const adminNoteSchema = z.object({
  content: z.string().min(1, 'Content is required'),
})
