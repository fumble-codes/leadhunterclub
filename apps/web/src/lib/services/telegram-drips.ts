import { db } from '@/lib/db'
import { sendTelegramMessage, escapeTgHtml } from './telegram'

export interface DripConfig {
  enabled: boolean
  template: string
  threshold?: number
}

export interface TelegramDripSettings {
  free_upsell: DripConfig
  low_credits: DripConfig
  mid_cycle_checkin: DripConfig
  pre_renewal: DripConfig
  grace_period: DripConfig
  win_back: DripConfig
}

export const DEFAULT_TELEGRAM_DRIPS: TelegramDripSettings = {
  free_upsell: {
    enabled: true,
    template: `🔥 <b>45+ High-Paying Client Leads Approved This Week!</b>\n\nHi {name}, you're currently on the <b>Free Starter Plan</b> (50 credits/mo).\nHunters on <b>Freelancer Pro</b> are currently unlocking direct client emails & closing ₹50k+ contracts.\n\n⚡ Upgrade now to get <b>1,000 monthly credits</b> and never miss a direct client deal!`,
  },
  low_credits: {
    enabled: true,
    threshold: 200,
    template: `⚠️ <b>Running Low on Credits!</b>\n\nHi {name}, you have <b>{credits} credits</b> remaining in your wallet.\nDon't let your outreach pause while pitching active clients.\n\n💰 Top up your credit balance now (top-up credits never expire!):`,
  },
  mid_cycle_checkin: {
    enabled: true,
    template: `🎯 <b>How's The Hunting Going? — Lead Hunter Club</b>\n\nHi {name}, you're halfway through this month's subscription cycle!\n• Remember: High-intent leads have the highest response rates in the first 48 hours.\n• Fresh leads matching your niches were just verified.\n\n👉 Open your dashboard now to claim today's freshest opportunities:`,
  },
  pre_renewal: {
    enabled: true,
    template: `💳 <b>Upcoming Renewal Notice — Lead Hunter Club</b>\n\nHi {name}, your <b>Freelancer Pro</b> subscription renews in <b>{days_left} days</b>.\n• 1,000 fresh credits will be added to your balance.\n• Any unused credits from this cycle will automatically roll over for <b>15 days</b> upon renewal.\n\nThank you for being a top hunter!`,
  },
  grace_period: {
    enabled: true,
    template: `🚨 <b>Urgent: 48-Hour Rollover Rescue Window Active</b>\n\nHi {name}, your recent subscription renewal did not go through.\n\n⏰ <b>You have 48 hours</b> to renew or re-subscribe to recover and keep your accumulated rollover credits ({credits} credits).\nAfter 48 hours, unused rollover credits expire permanently.`,
  },
  win_back: {
    enabled: true,
    template: `👋 <b>We Miss You on Lead Hunter Club!</b>\n\nHi {name}, 120+ verified client opportunities were just approved across Web Dev, AI, Design, and Marketing this week.\nClients are actively looking for service providers right now.\n\n⚡ Reactivate your membership today to get back in the game:`,
  },
}

export async function getTelegramDripSettings(): Promise<TelegramDripSettings> {
  try {
    const setting = await db.setting.findUnique({
      where: { key: 'telegram_drip_settings' },
    })
    const val = (setting?.value as Record<string, any>) || {}

    return {
      free_upsell: {
        enabled: val.free_upsell?.enabled ?? val.free_drips_enabled ?? DEFAULT_TELEGRAM_DRIPS.free_upsell.enabled,
        template: val.free_upsell?.template || DEFAULT_TELEGRAM_DRIPS.free_upsell.template,
      },
      low_credits: {
        enabled: val.low_credits?.enabled ?? DEFAULT_TELEGRAM_DRIPS.low_credits.enabled,
        threshold: val.low_credits?.threshold || 200,
        template: val.low_credits?.template || DEFAULT_TELEGRAM_DRIPS.low_credits.template,
      },
      mid_cycle_checkin: {
        enabled: val.mid_cycle_checkin?.enabled ?? DEFAULT_TELEGRAM_DRIPS.mid_cycle_checkin.enabled,
        template: val.mid_cycle_checkin?.template || DEFAULT_TELEGRAM_DRIPS.mid_cycle_checkin.template,
      },
      pre_renewal: {
        enabled: val.pre_renewal?.enabled ?? val.renewal_drips_enabled ?? DEFAULT_TELEGRAM_DRIPS.pre_renewal.enabled,
        template: val.pre_renewal?.template || DEFAULT_TELEGRAM_DRIPS.pre_renewal.template,
      },
      grace_period: {
        enabled: val.grace_period?.enabled ?? val.grace_drips_enabled ?? DEFAULT_TELEGRAM_DRIPS.grace_period.enabled,
        template: val.grace_period?.template || DEFAULT_TELEGRAM_DRIPS.grace_period.template,
      },
      win_back: {
        enabled: val.win_back?.enabled ?? DEFAULT_TELEGRAM_DRIPS.win_back.enabled,
        template: val.win_back?.template || DEFAULT_TELEGRAM_DRIPS.win_back.template,
      },
    }
  } catch {
    return DEFAULT_TELEGRAM_DRIPS
  }
}

export function formatDripMessage(
  template: string,
  vars: {
    name?: string | null
    credits?: number | string
    days_left?: number | string
    plan?: string
    link?: string
  },
  appUrl: string,
): string {
  const cleanUrl = appUrl.replace(/\/+$/, '')
  return template
    .replace(/\{name\}/g, escapeTgHtml(vars.name || 'there'))
    .replace(/\{credits\}/g, String(vars.credits ?? 0))
    .replace(/\{days_left\}/g, String(vars.days_left ?? 0))
    .replace(/\{plan\}/g, escapeTgHtml(vars.plan || 'Freelancer Pro'))
    .replace(/\{link\}/g, vars.link || `${cleanUrl}/pricing`)
}

export function getDripButton(
  dripType: keyof TelegramDripSettings,
  appUrl: string,
): Array<Array<{ text: string; url: string }>> {
  const cleanUrl = appUrl.replace(/\/+$/, '')
  switch (dripType) {
    case 'free_upsell':
      return [[{ text: '⚡ Upgrade to Freelancer Pro ↗', url: `${cleanUrl}/pricing` }]]
    case 'low_credits':
      return [[{ text: '💰 Recharge Credits ↗', url: `${cleanUrl}/pricing` }]]
    case 'mid_cycle_checkin':
      return [[{ text: '🚀 Open Leads Dashboard ↗', url: `${cleanUrl}/leads` }]]
    case 'pre_renewal':
      return [[{ text: '⚙️ Manage Subscription ↗', url: `${cleanUrl}/settings` }]]
    case 'grace_period':
      return [[{ text: '🔄 Reactivate & Save Rollover ↗', url: `${cleanUrl}/pricing` }]]
    case 'win_back':
      return [[{ text: '🚀 Welcome Back Offer ↗', url: `${cleanUrl}/pricing` }]]
    default:
      return [[{ text: '🚀 Open Dashboard ↗', url: `${cleanUrl}/leads` }]]
  }
}

/**
 * Runs scheduled evaluation of all 6 Telegram drip campaigns.
 * Called by the subscription check cron.
 */
export async function runTelegramAutomatedDrips(): Promise<{
  processed: number
  sent: number
  errors: number
}> {
  const settings = await getTelegramDripSettings()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.theleadhunterclub.com'
  const now = new Date()

  let processed = 0
  let sent = 0
  let errors = 0

  try {
    // Fetch all active users with linked Telegram chat ID
    const users = await db.user.findMany({
      where: {
        status: { in: ['ACTIVE', 'active'] },
        telegram_chat_id: { not: null },
      },
      include: {
        creditAccount: true,
      },
    })

    for (const user of users) {
      if (!user.telegram_chat_id) continue
      processed++

      const account = user.creditAccount
      const totalCredits = (account?.subscriptionBalance ?? 0) + (account?.rolloverBalance ?? 0)
      const renewalDate = account?.renewalDate ? new Date(account.renewalDate) : null
      const daysUntilRenewal = renewalDate
        ? Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null

      // 1. FREE USER UPSELL DRIP
      if (settings.free_upsell.enabled && user.plan === 'FREE') {
        const text = formatDripMessage(settings.free_upsell.template, {
          name: user.name || 'there',
          plan: 'Free Starter',
        }, appUrl)
        const ok = await sendTelegramMessage(user.telegram_chat_id, text, {
          inline_keyboard: getDripButton('free_upsell', appUrl),
        })
        if (ok.success) sent++
        else errors++
        continue
      }

      // 2. LOW CREDITS NUDGE (<= threshold, default 200)
      const lowThreshold = settings.low_credits.threshold || 200
      if (settings.low_credits.enabled && totalCredits <= lowThreshold && totalCredits > 0) {
        const text = formatDripMessage(settings.low_credits.template, {
          name: user.name || 'there',
          credits: totalCredits,
        }, appUrl)
        const ok = await sendTelegramMessage(user.telegram_chat_id, text, {
          inline_keyboard: getDripButton('low_credits', appUrl),
        })
        if (ok.success) sent++
        else errors++
        continue
      }

      // 3. 48-HOUR GRACE PERIOD ALERT (Subscription ended, rollover credits at risk)
      if (settings.grace_period.enabled && account?.rolloverExpiresAt && (account.rolloverBalance ?? 0) > 0) {
        const expiresAt = new Date(account.rolloverExpiresAt)
        const hoursLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60))
        if (hoursLeft > 0 && hoursLeft <= 48) {
          const text = formatDripMessage(settings.grace_period.template, {
            name: user.name || 'there',
            credits: account.rolloverBalance,
          }, appUrl)
          const ok = await sendTelegramMessage(user.telegram_chat_id, text, {
            inline_keyboard: getDripButton('grace_period', appUrl),
          })
          if (ok.success) sent++
          else errors++
          continue
        }
      }

      // 4. PRE-RENEWAL WARNING (3 or 7 days before renewal)
      if (settings.pre_renewal.enabled && user.plan !== 'FREE' && daysUntilRenewal !== null) {
        if (daysUntilRenewal === 3 || daysUntilRenewal === 7) {
          const text = formatDripMessage(settings.pre_renewal.template, {
            name: user.name || 'there',
            days_left: daysUntilRenewal,
            plan: user.plan || 'Freelancer Pro',
          }, appUrl)
          const ok = await sendTelegramMessage(user.telegram_chat_id, text, {
            inline_keyboard: getDripButton('pre_renewal', appUrl),
          })
          if (ok.success) sent++
          else errors++
          continue
        }
      }

      // 5. MID-CYCLE ENGAGEMENT CHECK-IN (~day 15 of cycle)
      if (settings.mid_cycle_checkin.enabled && user.plan !== 'FREE' && daysUntilRenewal !== null) {
        if (daysUntilRenewal >= 14 && daysUntilRenewal <= 16) {
          const text = formatDripMessage(settings.mid_cycle_checkin.template, {
            name: user.name || 'there',
          }, appUrl)
          const ok = await sendTelegramMessage(user.telegram_chat_id, text, {
            inline_keyboard: getDripButton('mid_cycle_checkin', appUrl),
          })
          if (ok.success) sent++
          else errors++
          continue
        }
      }
    }
  } catch (err: any) {
    console.error('[TelegramDrips] Execution error:', err.message)
    errors++
  }

  return { processed, sent, errors }
}

