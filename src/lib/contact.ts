/**
 * Contact form validation, shared by the browser form and the Netlify function
 * (the server re-validates everything; client checks are only for UX).
 * Hand-written to keep the public bundle small.
 */
export interface ContactInput {
  name: string
  email: string
  subject: string
  message: string
}

export interface ContactEnvelope extends ContactInput {
  website: string // honeypot: must stay empty
  startedAt: number // form render timestamp (ms)
  token?: string // optional Cloudflare Turnstile token
}

export type ContactErrors = Partial<Record<keyof ContactInput, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const rules: Record<keyof ContactInput, [min: number, max: number, minMsg: string, maxMsg: string]> = {
  name: [2, 100, 'Please enter your name', 'Name is too long'],
  email: [3, 200, 'Please enter a valid email address', 'Email is too long'],
  subject: [3, 150, 'Please add a subject', 'Subject is too long'],
  message: [10, 5000, 'Message should be at least 10 characters', 'Message is too long (max 5000 characters)'],
}

export function normalizeContact(raw: Partial<Record<keyof ContactInput, unknown>>): ContactInput {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  return { name: str(raw.name), email: str(raw.email).toLowerCase(), subject: str(raw.subject), message: str(raw.message) }
}

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {}
  for (const key of Object.keys(rules) as (keyof ContactInput)[]) {
    const [min, max, minMsg, maxMsg] = rules[key]
    const v = input[key]
    if (v.length < min) errors[key] = minMsg
    else if (v.length > max) errors[key] = maxMsg
  }
  if (!errors.email && !EMAIL_RE.test(input.email)) errors.email = 'Please enter a valid email address'
  // Strip control characters used for header-injection style tricks
  if (/[\r\n]/.test(input.name) || /[\r\n]/.test(input.subject)) errors.subject ??= 'Line breaks are not allowed here'
  return errors
}

export function parseEnvelope(body: unknown): { ok: true; value: ContactEnvelope } | { ok: false; error: string; honeypot: boolean } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid request', honeypot: false }
  const b = body as Record<string, unknown>
  const honeypot = typeof b.website === 'string' && b.website.length > 0
  if (honeypot) return { ok: false, error: 'spam', honeypot: true }
  const startedAt = typeof b.startedAt === 'number' && Number.isFinite(b.startedAt) ? b.startedAt : NaN
  if (!startedAt) return { ok: false, error: 'Invalid request', honeypot: false }
  const input = normalizeContact(b)
  const errors = validateContact(input)
  const first = Object.values(errors)[0]
  if (first) return { ok: false, error: first, honeypot: false }
  const token = typeof b.token === 'string' && b.token.length <= 4096 ? b.token : undefined
  return { ok: true, value: { ...input, website: '', startedAt, token } }
}
