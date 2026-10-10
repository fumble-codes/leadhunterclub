import { describe, expect, it } from 'vitest'
import { PET_NOTICE_PX, PET_TOUCH_PX, proximityTier } from './proximity'

describe('proximityTier', () => {
  it('idle when far away', () => {
    expect(proximityTier(PET_NOTICE_PX + 1, true, false)).toBe('idle')
    expect(proximityTier(Number.POSITIVE_INFINITY, true, false)).toBe('idle')
  })

  it('idle while cooling down regardless of distance', () => {
    expect(proximityTier(0, true, true)).toBe('idle')
    expect(proximityTier(50, true, true)).toBe('idle')
  })

  it('excited when nearby', () => {
    expect(proximityTier(PET_NOTICE_PX, false, false)).toBe('excited')
    expect(proximityTier(PET_TOUCH_PX + 1, false, false)).toBe('excited')
  })

  it('touch without dwell stays excited; with dwell becomes petted', () => {
    expect(proximityTier(PET_TOUCH_PX, false, false)).toBe('excited')
    expect(proximityTier(0, true, false)).toBe('petted')
    expect(proximityTier(PET_TOUCH_PX, true, false)).toBe('petted')
  })
})
