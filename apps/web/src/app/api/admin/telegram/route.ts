import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, AuthRequiredError, ForbiddenError } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendTelegramMessage } from '@/lib/services/telegram'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.theleadhunterclub.com'

export const DEFAULT_TELEGRAM_COMMUNITY_TEMPLATE = `🚀 <b>Fresh Leads Dropped — Lead Hunter Club</b>

🔥 <b>{count} new verified client opportunit{count_suffix}</b> {have_has} just been approved and added to the platform!

📌 <b>Niches:</b> {niches}

👉 <b>Review & unlock them now on the Dashboard:</b>
{link}`

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const [tgConfig, tgChannel, tgTemplate, tgDrips] = await Promise.allSettled([
      db.setting.findUnique({ where: { key: 'telegram_config' } }),
      db.setting.findUnique({ where: { key: 'telegram_community_channel' } }),
      db.setting.findUnique({ where: { key: 'telegram_alert_template' } }),
      db.setting.findUnique({ where: { key: 'telegram_drip_settings' } }),
    ])

    const configVal = tgConfig.status === 'fulfilled' && tgConfig.value?.value
      ? (tgConfig.value.value as Record<string, any>)
      : {}

    const channelVal = tgChannel.status === 'fulfilled' && tgChannel.value?.value
      ? (tgChannel.value.value as Record<string, any>)
      : {}

    const templateVal = tgTemplate.status === 'fulfilled' && tgTemplate.value?.value
      ? (tgTemplate.value.value as Record<string, any>)
      : {}

    const dripsVal = tgDrips.status === 'fulfilled' && tgDrips.value?.value
      ? (tgDrips.value.value as Record<string, any>)
      : {}

    return NextResponse.json({
      success: true,
      data: {
        botUsername: configVal.bot_username || 'leadhunterclubbot',
        botEnabled: configVal.enabled !== false,
        hasBotToken: Boolean(configVal.bot_token || process.env.TELEGRAM_BOT_TOKEN),
        configuredChannelId: channelVal.channel_id || '',
        configuredChannelName: channelVal.channel_name || null,
        alertTemplate: templateVal.template || DEFAULT_TELEGRAM_COMMUNITY_TEMPLATE,
        dripSettings: {
          free_drips_enabled: dripsVal.free_drips_enabled !== false,
          renewal_drips_enabled: dripsVal.renewal_drips_enabled !== false,
          grace_drips_enabled: dripsVal.grace_drips_enabled !== false,
          free_drip_interval_days: dripsVal.free_drip_interval_days || 3,
        },
      },
    })
  } catch (error: unknown) {
    if (error instanceof AuthRequiredError || error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Admin access required' }, { status: 403 })
    }
    const msg = error instanceof Error ? error.message : 'Failed to fetch Telegram settings'
    return NextResponse.json({ code: 'ERROR', message: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const body = await request.json().catch(() => ({}))
    const { action } = body

    if (action === 'save_channel') {
      const channelId = (body.channelId || '').trim()
      const channelName = (body.channelName || '').trim() || null

      await db.setting.upsert({
        where: { key: 'telegram_community_channel' },
        create: {
          key: 'telegram_community_channel',
          value: { channel_id: channelId, channel_name: channelName },
          description: 'Target Telegram community channel or group for automated lead drops',
        },
        update: {
          value: { channel_id: channelId, channel_name: channelName },
        },
      })

      return NextResponse.json({ success: true, message: 'Target Telegram channel saved successfully' })
    }

    if (action === 'save_template') {
      const template = (body.template || '').trim()
      if (!template) {
        return NextResponse.json({ code: 'BAD_REQUEST', message: 'Template text cannot be empty' }, { status: 400 })
      }

      await db.setting.upsert({
        where: { key: 'telegram_alert_template' },
        create: {
          key: 'telegram_alert_template',
          value: { template },
          description: 'Custom message template for Telegram community lead drop alerts',
        },
        update: {
          value: { template },
        },
      })

      return NextResponse.json({ success: true, message: 'Telegram alert template saved successfully' })
    }

    if (action === 'reset_template') {
      await db.setting.deleteMany({ where: { key: 'telegram_alert_template' } })
      return NextResponse.json({
        success: true,
        message: 'Template reset to default',
        template: DEFAULT_TELEGRAM_COMMUNITY_TEMPLATE,
      })
    }

    if (action === 'save_drip_settings') {
      const dripSettings = {
        free_drips_enabled: Boolean(body.free_drips_enabled),
        renewal_drips_enabled: Boolean(body.renewal_drips_enabled),
        grace_drips_enabled: Boolean(body.grace_drips_enabled),
        free_drip_interval_days: Math.max(1, parseInt(body.free_drip_interval_days, 10) || 3),
      }

      await db.setting.upsert({
        where: { key: 'telegram_drip_settings' },
        create: {
          key: 'telegram_drip_settings',
          value: dripSettings,
          description: 'Telegram automated marketing & retention drip campaign settings',
        },
        update: {
          value: dripSettings,
        },
      })

      return NextResponse.json({ success: true, message: 'Drip campaign settings updated successfully' })
    }

    if (action === 'send_test_alert') {
      const channelSetting = await db.setting.findUnique({ where: { key: 'telegram_community_channel' } })
      const channelVal = (channelSetting?.value as Record<string, any>) || {}
      const targetChannel = channelVal.channel_id || body.targetChannel

      if (!targetChannel) {
        return NextResponse.json(
          { code: 'BAD_REQUEST', message: 'Please configure and save a Target Telegram Channel/Group ID first.' },
          { status: 400 },
        )
      }

      const templateSetting = await db.setting.findUnique({ where: { key: 'telegram_alert_template' } })
      const rawTemplate = (templateSetting?.value as any)?.template || body.template || DEFAULT_TELEGRAM_COMMUNITY_TEMPLATE

      const sampleMessage = rawTemplate
        .replace(/{count}/g, '3')
        .replace(/{count_suffix}/g, 'ies')
        .replace(/{have_has}/g, 'have')
        .replace(/{niches}/g, 'Web Dev, AI & Automation, UI/UX Design')
        .replace(/{link}/g, `${APP_URL}/leads`)

      const ok = await sendTelegramMessage(targetChannel, sampleMessage, {
        inline_keyboard: [
          [{ text: '🚀 Review & Claim on Dashboard ↗', url: `${APP_URL}/leads` }],
        ],
      })

      if (!ok) {
        return NextResponse.json(
          {
            code: 'SEND_FAILED',
            message: `Failed to deliver test message to "${targetChannel}". Ensure @leadhunterclubbot is added as an Administrator to the channel with 'Post Messages' permission.`,
          },
          { status: 502 },
        )
      }

      return NextResponse.json({ success: true, message: `Test drop alert posted to ${targetChannel}!` })
    }

    if (action === 'send_test_drip') {
      const { dripType, targetChatId } = body
      if (!targetChatId) {
        return NextResponse.json(
          { code: 'BAD_REQUEST', message: 'Target Telegram chat ID required for test drip' },
          { status: 400 },
        )
      }

      let dripMessage = ''
      let buttons: any[] = []

      if (dripType === 'free_upsell') {
        dripMessage = `🔥 <b>45+ High-Paying Client Leads Approved This Week!</b>\n\nYou're on the <b>Free Starter Plan</b> (50 credits/mo).\nHunters on <b>Freelancer Pro</b> are currently unlocking direct client emails & closing ₹50k+ contracts.\n\n⚡ Upgrade now to get <b>1,000 monthly credits</b> and never miss a direct client deal!`
        buttons = [[{ text: '⚡ Upgrade to Freelancer Pro ↗', url: `${APP_URL}/pricing` }]]
      } else if (dripType === 'pre_renewal') {
        dripMessage = `💳 <b>Upcoming Renewal Reminder — Lead Hunter Club</b>\n\nYour <b>Freelancer Pro</b> membership renews in <b>4 days</b>.\n• 1,000 fresh credits will be added to your balance.\n• Any unused credits from this month will automatically roll over for <b>15 days</b>.\n\nThank you for being a top hunter!`
        buttons = [[{ text: 'Manage Subscription ↗', url: `${APP_URL}/settings` }]]
      } else {
        dripMessage = `⚠️ <b>Action Required: Subscription Payment Missed</b>\n\nYour recent subscription renewal did not go through.\n\n⏰ <b>Grace Period Active:</b> You have <b>15 days</b> to renew before your accumulated rollover credits expire permanently.\n\nRenew now to keep your credits and continue receiving instant lead drops:`
        buttons = [[{ text: '🔄 Reactivate Membership ↗', url: `${APP_URL}/pricing` }]]
      }

      const ok = await sendTelegramMessage(targetChatId, dripMessage, {
        inline_keyboard: buttons,
      })

      if (!ok) {
        return NextResponse.json(
          { code: 'SEND_FAILED', message: `Could not send test message to chat ${targetChatId}` },
          { status: 502 },
        )
      }

      return NextResponse.json({ success: true, message: `Test ${dripType} drip delivered successfully!` })
    }

    return NextResponse.json({ code: 'BAD_REQUEST', message: 'Invalid action' }, { status: 400 })
  } catch (error: unknown) {
    if (error instanceof AuthRequiredError || error instanceof ForbiddenError) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Admin access required' }, { status: 403 })
    }
    const msg = error instanceof Error ? error.message : 'Failed to update Telegram settings'
    return NextResponse.json({ code: 'ERROR', message: msg }, { status: 500 })
  }
}
