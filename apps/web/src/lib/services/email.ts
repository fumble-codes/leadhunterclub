import {
  renderApproved,
  renderRejected,
  renderSuspended,
  renderApplicationReceived,
} from '@/lib/email-templates'

interface SendOptions {
  html?: string
}

interface EmailResult {
  id: string
}

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@leadhunterclub.com'
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://leadhunterclub.com'
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

function logDev(...args: unknown[]) {
  if (!IS_PRODUCTION) {
    console.log('[Email Service]', ...args)
  }
}

async function sendWithResend(
  to: string,
  subject: string,
  body: string,
  opts?: SendOptions,
): Promise<EmailResult> {
  if (!RESEND_API_KEY) {
    if (IS_PRODUCTION) {
      throw new Error('RESEND_API_KEY is not configured. Email sending is required in production.')
    }
    logDev(`Email skipped (no RESEND_API_KEY): to=${to}, subject="${subject}"`)
    return { id: 'skipped-no-api-key' }
  }

  const { Resend } = await import('resend')
  const resend = new Resend(RESEND_API_KEY)

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    text: body,
    html: opts?.html || body,
  })

  if (error) {
    console.error('[Email Service] Resend error:', error)
    return { id: 'error' }
  }

  return { id: data?.id || 'sent' }
}

export const emailService = {
  async sendApproved(user: { name: string; email: string }, plan: string) {
    const planLabel = plan === 'FREELANCER' ? 'Freelancer' : plan === 'AGENCY' ? 'Agency' : plan
    const { subject, text, html } = renderApproved({
      name: user.name,
      plan: planLabel,
      appUrl: APP_URL,
    })
    return sendWithResend(user.email, subject, text, { html })
  },

  async sendRejected(user: { name: string; email: string }) {
    const { subject, text, html } = renderRejected({ name: user.name, appUrl: APP_URL })
    return sendWithResend(user.email, subject, text, { html })
  },

  async sendSuspended(user: { name: string; email: string }) {
    const { subject, text, html } = renderSuspended({ name: user.name, appUrl: APP_URL })
    return sendWithResend(user.email, subject, text, { html })
  },

  async sendApplicationReceived(user: { name: string; email: string }) {
    const { subject, text, html } = renderApplicationReceived({ name: user.name, appUrl: APP_URL })
    return sendWithResend(user.email, subject, text, { html })
  },

  async notifyAdmin(type: string, data: Record<string, unknown>) {
    if (!ADMIN_NOTIFICATION_EMAIL) {
      logDev(`Admin notification skipped (no ADMIN_NOTIFICATION_EMAIL): type=${type}`)
      return { id: 'skipped-no-admin-email' }
    }

    const subject = `[Lead Hunter Club] ${type}`
    const lines = Object.entries(data)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n')
    const text = `Admin Notification\n\nType: ${type}\n\n${lines}\n\nView at: ${APP_URL}/admin/users`

    return sendWithResend(ADMIN_NOTIFICATION_EMAIL, subject, text)
  },
}
