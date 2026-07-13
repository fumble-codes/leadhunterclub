function wrapHtml(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:16px;border:1px solid rgba(255,255,255,0.06)">
        <tr><td style="padding:40px">
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.02em">Lead Hunter Club</h1>
          ${body}
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:24px 0" />
          <p style="margin:0;font-size:12px;color:#888;line-height:1.5">
            Lead Hunter Club &mdash; Find & close your ideal clients<br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://leadhunterclub.com'}" style="color:#dc3b4c;text-decoration:none">Visit dashboard</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

interface TemplateData {
  name: string
  appUrl: string
}

interface ApprovedData extends TemplateData {
  plan: string
}

interface RejectedData extends TemplateData {}

interface SuspendedData extends TemplateData {}

interface ApplicationReceivedData extends TemplateData {}

export function renderApproved(data: ApprovedData) {
  const subject = `Welcome to Lead Hunter Club — You've been approved!`
  const text = `Hi ${data.name},\n\nGreat news! Your application has been approved with the ${data.plan} plan.\n\nYou can now log in and start finding leads.\n\n${data.appUrl}/dashboard`
  const html = wrapHtml(`
    <p style="margin:16px 0;font-size:15px;color:#ccc;line-height:1.6">Hi ${data.name},</p>
    <p style="margin:16px 0;font-size:15px;color:#ccc;line-height:1.6">Great news! Your application has been approved with the <strong style="color:#fff">${data.plan}</strong> plan.</p>
    <p style="margin:16px 0;font-size:15px;color:#ccc;line-height:1.6">You can now log in and start finding leads.</p>
    <a href="${data.appUrl}/dashboard" style="display:inline-block;margin:8px 0 16px;padding:12px 28px;background:#dc3b4c;color:#fff;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600">Go to Dashboard</a>
  `)
  return { subject, text, html }
}

export function renderRejected(data: RejectedData) {
  const subject = `Update on your Lead Hunter Club application`
  const text = `Hi ${data.name},\n\nThank you for your interest in Lead Hunter Club. Unfortunately, we are unable to approve your application at this time.\n\nIf you have questions, please contact support.`
  const html = wrapHtml(`
    <p style="margin:16px 0;font-size:15px;color:#ccc;line-height:1.6">Hi ${data.name},</p>
    <p style="margin:16px 0;font-size:15px;color:#ccc;line-height:1.6">Thank you for your interest in Lead Hunter Club. Unfortunately, we are unable to approve your application at this time.</p>
    <p style="margin:16px 0;font-size:15px;color:#ccc;line-height:1.6">If you have questions, please contact support.</p>
  `)
  return { subject, text, html }
}

export function renderSuspended(data: SuspendedData) {
  const subject = `Lead Hunter Club — Account suspended`
  const text = `Hi ${data.name},\n\nYour account has been suspended. If you believe this was done in error, please contact support.\n\n${data.appUrl}`
  const html = wrapHtml(`
    <p style="margin:16px 0;font-size:15px;color:#ccc;line-height:1.6">Hi ${data.name},</p>
    <p style="margin:16px 0;font-size:15px;color:#ccc;line-height:1.6">Your account has been suspended. If you believe this was done in error, please contact support.</p>
  `)
  return { subject, text, html }
}

export function renderApplicationReceived(data: ApplicationReceivedData) {
  const subject = `Application received — Lead Hunter Club`
  const text = `Hi ${data.name},\n\nWe've received your application. Our team will review it shortly and you'll hear back from us soon.\n\nIn the meantime, feel free to check your application status.\n\n${data.appUrl}/pending-approval`
  const html = wrapHtml(`
    <p style="margin:16px 0;font-size:15px;color:#ccc;line-height:1.6">Hi ${data.name},</p>
    <p style="margin:16px 0;font-size:15px;color:#ccc;line-height:1.6">We've received your application. Our team will review it shortly and you'll hear back from us soon.</p>
    <p style="margin:16px 0;font-size:15px;color:#ccc;line-height:1.6">In the meantime, feel free to check your application status.</p>
    <a href="${data.appUrl}/pending-approval" style="display:inline-block;margin:8px 0 16px;padding:12px 28px;background:#dc3b4c;color:#fff;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600">Check Status</a>
  `)
  return { subject, text, html }
}
