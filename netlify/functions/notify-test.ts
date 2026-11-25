import type { Config } from '@netlify/functions'
import { json, originAllowed, requireAdmin, serviceClient } from './_shared'
import { notificationRecipient, sendMail } from './_mail'

/** Admin-only: sends a test email to the configured notification address. */
export default async (req: Request) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })
  if (!originAllowed(req)) return json(403, { error: 'Forbidden origin' })
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.res

  const to = await notificationRecipient(serviceClient())
  if (!to) return json(400, { error: 'No notification email set (or notifications are switched off).' })

  const sent = await sendMail({
    to,
    subject: '[Portfolio] Test notification ✓',
    text: 'Your portfolio contact form notifications are working. New messages will arrive at this address.',
    html: '<p style="font-family:system-ui">✅ Your portfolio contact form notifications are working.<br>New messages will arrive at this address.</p>',
  })
  if (!sent.ok) return json(502, { error: sent.error })
  return json(200, { ok: true, to, provider: sent.provider })
}

export const config: Config = { path: '/api/notify-test' }
