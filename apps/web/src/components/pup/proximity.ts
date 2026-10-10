/**
 * Proximity tiers for pup expressions. Pure (unit-testable); timing
 * (dwell/cooldown) is owned by the caller, this only classifies.
 *
 * - idle: cursor far away (or cooling down after a pet).
 * - excited: cursor nearby — the pup notices and leans in slightly.
 * - petted: cursor right on the orb with dwell satisfied — one dry line.
 */

export type PetExpression = 'idle' | 'excited' | 'petted'

export const PET_NOTICE_PX = 90
export const PET_TOUCH_PX = 30

export function proximityTier(
  dPx: number,
  dwellOk: boolean,
  cooling: boolean,
): PetExpression {
  if (cooling || dPx > PET_NOTICE_PX) return 'idle'
  if (dPx <= PET_TOUCH_PX) return dwellOk ? 'petted' : 'excited'
  return 'excited'
}
