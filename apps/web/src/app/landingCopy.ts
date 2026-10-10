/**
 * Landing-page hint script for the hunter pup (same playful pet voice as
 * onboarding). Pure function of landing signals — unit-testable in isolation.
 *
 * Frequency guard lives here too: sections the visitor already saw return
 * null (pet stays quiet and just watches) instead of repeating nudges.
 */

import type { PupHint } from '@/components/pup/PupCompanion'

export type LandingSection =
  | 'hero'
  | 'funnel'
  | 'philosophy'
  | 'features'
  | 'tokens'
  | 'testimonials'
  | 'who'
  | 'pricing'
  | 'faq'
  | 'final'
  | 'unknown'

export interface LandingStatus {
  section: LandingSection
  /** How many times this section has become active (1 = first sighting). */
  seenCount: number
  /** Cursor is over (or keyboard focus in) a CTA. */
  ctaHover: boolean
}

export function pickLandingHint(s: LandingStatus): PupHint | null {
  if (s.ctaHover) {
    return { title: 'go on, click it', sub: 'takes 30 seconds', mood: 'listening' }
  }

  switch (s.section) {
    case 'hero':
      if (s.seenCount > 1) return null
      return { title: 'psst — hunters start free', sub: '50 credits, no card. just saying', mood: 'online' }
    case 'funnel':
      if (s.seenCount > 1) return null
      return { title: "that's real buyer intent btw", sub: 'not scraped lists. live demand', mood: 'idle' }
    case 'pricing':
      if (s.seenCount > 1) return null
      return { title: 'quick maths:', sub: '₹999 ≈ 100+ reveals', mood: 'idle' }
    case 'final':
      if (s.seenCount > 1) return null
      return {
        title: 'last chance to stop cold-calling',
        sub: 'start hunting free →',
        mood: 'online',
      }
    default:
      return null
  }
}
