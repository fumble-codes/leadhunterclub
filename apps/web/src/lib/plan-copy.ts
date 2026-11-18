/**
 * Canonical user-facing rollover copy.
 *
 * ROLLOVER_VALIDITY_DAYS in lib/services/rollover.ts is the behavioural source
 * of truth (15 days). Admin-editable plan config lives in the DB and has drifted
 * before ("up to 30 days"), so any copy served to users is normalised here.
 * Keep the wording consistent with the rest of the site: 15 days, never more.
 */
export const ROLLOVER_COPY = 'Unused credits roll over for 15 days'

const ROLLOVER_PATTERN = /\b(?:roll[\s-]?over|carry[\s-]?over)\b/i

function normalizeString(text: string): string {
  if (!ROLLOVER_PATTERN.test(text)) return text
  // Replace the whole clause containing "rollover" with the canonical wording,
  // so any stale number ("up to 30 days", "7 days", etc.) cannot leak through.
  return text.replace(/[^.]*\b(?:roll[\s-]?over|carry[\s-]?over)\b[^.]*/i, ROLLOVER_COPY).trim()
}

/** Recursively normalises rollover copy in plan/refill config objects. */
export function normalizeRolloverCopy<T>(value: T): T {
  if (typeof value === 'string') return normalizeString(value) as T
  if (Array.isArray(value)) return value.map((item) => normalizeRolloverCopy(item)) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeRolloverCopy(item)]),
    ) as T
  }
  return value
}
