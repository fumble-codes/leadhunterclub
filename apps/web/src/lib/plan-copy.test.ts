import { describe, expect, it } from 'vitest'
import { normalizeRolloverCopy, ROLLOVER_COPY } from './plan-copy'

describe('normalizeRolloverCopy', () => {
  it('replaces a stale "up to 30 days" rollover claim', () => {
    expect(normalizeRolloverCopy('Unused credits rollover (up to 30 days)')).toBe(ROLLOVER_COPY)
  })

  it('replaces any other stale rollover duration in a feature list', () => {
    const config = {
      features: [
        'Unused credits roll over for 7 days',
        'Direct email reveals',
        '15-day credit rollover',
      ],
    }
    expect(normalizeRolloverCopy(config)).toEqual({
      features: [ROLLOVER_COPY, 'Direct email reveals', ROLLOVER_COPY],
    })
  })

  it('leaves non-rollover and already-correct copy untouched', () => {
    expect(normalizeRolloverCopy('1000 credits renewed monthly')).toBe('1000 credits renewed monthly')
    expect(normalizeRolloverCopy(ROLLOVER_COPY)).toBe(ROLLOVER_COPY)
  })
})
