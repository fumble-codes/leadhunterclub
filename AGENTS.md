# Agents

## Session memory

**Read `PROGRESS.md` first in every new session.** It is the live cross-session work log: the frontend/deploy checklist with per-item status, what's already completed (don't redo it), what's blocked and on whom (user assets vs. backend guy), deploy risks, and repo quirks (test runner = vitest, PowerShell rules, dev server). Update its statuses and "Completed work" section whenever you finish an item.

## Skills

This project includes the following skills in `skills/`. Load and follow the relevant SKILL.md when the user's request matches its trigger.

### taste-skill (`skills/taste-skill/SKILL.md`)
**Trigger:** frontend design, landing pages, portfolios, redesigns, UI slop prevention, anti-generic UI, design taste.
**What it does:** Reads the brief, infers design direction, tunes three dials (VARIANCE / MOTION / DENSITY), and ships interfaces that don't look templated. Real design systems when applicable, audit-first on redesigns, strict pre-flight check.

### lets-scroll (`skills/lets-scroll/SKILL.md`)
**Trigger:** scroll-driven landing pages, cinematic scroll pages, fly-through-the-world, camera flights, scroll-scrubbed video pages, diorama landing, scroll cinematic.
**What it does:** Builds scroll-scrubbed "fly through the world" landing pages with AI-generated scenes + camera flights chained into one seamless continuous shot, driven by scroll. Uses Monid/Higgsfield for rendering, portable vanilla-JS scrub engine.

## Usage

When a user request matches a skill's trigger:
1. Read the full `skills/<name>/SKILL.md`
2. Follow its instructions and conventions
3. Do not deviate from its rules unless the user explicitly overrides

## Design & iconography rules

- **No generic "AI slop" icons.** Never use lightning bolts (⚡ / `BoltIcon`), sparkles, rockets, magic wands,
  brains, or robot glyphs for product concepts — credits, upgrades, billing, AI, or "energy". They read as
  template slop and are banned from product UI.
- **Use literal, domain-specific icons** from the project sets (`@heroicons/react/24/outline`, `lucide-react`):
  - credits / billing / top-ups → `BanknotesIcon` / `Wallet` / `CurrencyRupeeIcon`
  - verified / success → `CheckBadgeIcon` / `CheckIcon`
  - warnings → `ExclamationTriangleIcon`
  - contact data → `EnvelopeIcon` / `PhoneIcon` / `UserIcon`
  - exports → `TableCellsIcon` / `ArrowDownTrayIcon`
- **Reuse existing mappings before inventing one.** `UpgradeNudgePopup` already maps low/out-of-credits to
  `BanknotesIcon` — follow that, don't reach for a new metaphor.
- **Render consistently:** outline style, heroicons `strokeWidth={1.6}`, 20px icon inside a 44px tile, tinted
  with a palette token (`accent-purple`, `accent-mint`, `text-text-*`) — never raw hex or the default icon color.
  Note the legacy alias trap: `accent-purple` renders **amber `#ffb800`**, `accent-mint` renders **green
  `#43ed9e`**. Full palette + surface/glass recipe: `docs/DESIGN.md`.
- **One icon per concept.** Every icon must carry meaning. Decorative icon soup (an icon next to every label)
  is banned; if it's only decoration, remove it.

## Git workflow

- **Always pull before pushing — no exceptions.** Run `git pull --rebase origin main` (fetch + rebase) *before* every `git push`, so commits pushed from other machines/sessions are integrated first and the push is never rejected.
- If the working tree is dirty with unrelated WIP, `git stash push -m "<note>"` first, then pull --rebase, push, then `git stash pop`.
- If the pull surfaces conflicts, resolve them (or stop and ask) before pushing. Never force-push. After pushing, confirm sync with `git rev-list --left-right --count origin/main...HEAD` showing `0 0`.
