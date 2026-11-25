import type { Config, Context } from '@netlify/functions'
import { parseEnvelope } from '../../src/lib/contact'
import { escapeHtml, json, originAllowed, serviceClient, sha256 } from './_shared'
import { notificationRecipient, sendMail } from './_mail'

const MIN_FILL_MS = 3000 // humans need > 3s to fill the form
const LIMIT_10_MIN = 3
const LIMIT_24_H = 10
const MAX_BODY = 20_000

async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // optional layer
  if (!token) return false
  const form = new URLSearchParams({ secret, response: token, remoteip: ip })
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form })
  const data = (await res.json().catch(() => ({}))) as { success?: boolean }
  return data.success === true
}

function notificationMail(msg: { name: string; email: string; subject: string; message: string }, to: string) {
  const html = `<div style="font-family:system-ui,sans-serif;max-width:600px">
<p style="color:#3dff9a;font-family:monospace;margin:0 0 8px">● new message from your portfolio</p>
<h2 style="margin:0 0 12px">${escapeHtml(msg.subject)}</h2>
<p style="margin:0 0 4px"><b>From:</b> ${escapeHtml(msg.name)} &lt;${escapeHtml(msg.email)}&gt;</p>
<pre style="white-space:pre-wrap;font-family:inherit;background:#f4f6f5;padding:12px;border-radius:8px">${escapeHtml(msg.message)}</pre>
<p style="color:#666;font-size:12px">Reply to this email to answer ${escapeHtml(msg.name)} directly. All messages are also in Admin → Messages.</p></div>`
  const text = `New portfolio message\n\nFrom: ${msg.name} <${msg.email}>\nSubject: ${msg.subject}\n\n${msg.message}`
  return { to, replyTo: msg.email, subject: `[Portfolio] ${msg.subject}`.slice(0, 200), html, text }
}

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' }, { Allow: 'POST' })
  if (!originAllowed(req)) return json(403, { error: 'Forbidden origin' })
  if (!(req.headers.get('content-type') ?? '').includes('application/json')) return json(415, { error: 'Expected JSON' })

  const raw = await req.text()
  if (raw.length > MAX_BODY) return json(413, { error: 'Message too large' })

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }

  const parsed = parseEnvelope(body)
  if (!parsed.ok) {
    // Honeypot filled → pretend success so bots learn nothing.
    if (parsed.honeypot) return json(200, { ok: true })
    return json(422, { error: parsed.error })
  }
  const { name, email, subject, message, startedAt, token } = parsed.value

  // Submitted implausibly fast → silently accept & drop.
  if (Date.now() - startedAt < MIN_FILL_MS) return json(200, { ok: true })

  // Link-spam heuristic
  if ((message.match(/https?:\/\//gi) ?? []).length > 4) return json(422, { error: 'Please limit links in your message.' })

  const ip = context.ip || req.headers.get('x-nf-client-connection-ip') || 'unknown'
  if (!(await verifyTurnstile(token, ip))) return json(400, { error: 'Verification failed. Please try again.' })

  let sb
  try {
    sb = serviceClient()
  } catch (e) {
    console.error(e)
    return json(500, { error: 'Contact form is not configured yet.' })
  }

  // Privacy-preserving rate limiting: we only store a salted hash of the IP.
  const ipHash = await sha256(`${ip}:${process.env.IP_HASH_SALT ?? 'portfolio'}`)
  const since = (ms: number) => new Date(Date.now() - ms).toISOString()
  const [recent, daily] = await Promise.all([
    sb.from('contact_messages').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', since(10 * 60_000)),
    sb.from('contact_messages').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', since(24 * 3600_000)),
  ])
  if ((recent.count ?? 0) >= LIMIT_10_MIN || (daily.count ?? 0) >= LIMIT_24_H) {
    return json(429, { error: 'Too many messages. Please try again later.' }, { 'Retry-After': '600' })
  }

  const { error } = await sb.from('contact_messages').insert({
    name,
    email,
    subject,
    message,
    ip_hash: ipHash,
    user_agent: (req.headers.get('user-agent') ?? '').slice(0, 400),
  })
  if (error) {
    console.error('insert failed', error)
    return json(500, { error: 'Could not send your message. Please try again.' })
  }

  // Email notification (never fails the submission: the message is already saved)
  const to = await notificationRecipient(sb).catch(() => null)
  if (to) {
    const sent = await sendMail(notificationMail({ name, email, subject, message }, to))
    if (!sent.ok) console.error('notification email failed:', sent.error)
  }
  return json(200, { ok: true })
}

export const config: Config = { path: '/api/contact' }
