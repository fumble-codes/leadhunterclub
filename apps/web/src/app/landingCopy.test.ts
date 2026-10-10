import { describe, expect, it } from 'vitest'
import { pickLandingHint, type LandingStatus } from './landingCopy'

const base: LandingStatus = { section: 'unknown', seenCount: 1, ctaHover: false }

describe('pickLandingHint', () => {
  it('greets on first hero sighting, then goes quiet', () => {
    const first = pickLandingHint({ ...base, section: 'hero' })
    expect(first?.title).toMatch(/hunters start free/)
    expect(first?.mood).toBe('online')
    expect(pickLandingHint({ ...base, section: 'hero', seenCount: 2 })).toBeNull()
  })

  it('cta hover beats section copy', () => {
    const h = pickLandingHint({ ...base, section: 'pricing', ctaHover: true })
    expect(h?.title).toMatch(/go on/)
    expect(h?.mood).toBe('listening')
  })

  it('narrates funnel, pricing, final once each', () => {
    expect(pickLandingHint({ ...base, section: 'funnel' })?.sub).toMatch(/live demand/)
    expect(pickLandingHint({ ...base, section: 'pricing' })?.sub).toMatch(/100\+ reveals/)
    expect(pickLandingHint({ ...base, section: 'final' })?.mood).toBe('online')
    expect(pickLandingHint({ ...base, section: 'pricing', seenCount: 3 })).toBeNull()
  })

  it('stays quiet on supporting sections', () => {
    for (const section of ['philosophy', 'features', 'tokens', 'testimonials', 'who', 'faq', 'unknown'] as const) {
      expect(pickLandingHint({ ...base, section })).toBeNull()
    }
  })
})
