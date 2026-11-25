import { createClient } from '@supabase/supabase-js'

// Server-only secrets. These are NEVER prefixed with VITE_, so Vite never bundles them.
export function serviceClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Server is missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export function json(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  })
}

/** Allow same-site requests only (production URL, deploy previews, custom domain, local dev). */
export function originAllowed(req: Request) {
  const origin = req.headers.get('origin')
  if (!origin) return true // non-browser clients; other checks still apply
  let host: string
  try {
    host = new URL(origin).host
  } catch {
    return false
  }
  const allowed = [process.env.URL, process.env.DEPLOY_PRIME_URL, process.env.DEPLOY_URL, process.env.SITE_URL, ...(process.env.ALLOWED_ORIGINS ?? '').split(',')]
    .filter(Boolean)
    .map((u) => {
      try {
        return new URL(u!.trim()).host
      } catch {
        return ''
      }
    })
  return allowed.includes(host) || /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)
}

export async function sha256(input: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Verifies the caller's Supabase access token AND their admin_users row. */
export async function requireAdmin(req: Request): Promise<{ ok: true } | { ok: false; res: Response }> {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return { ok: false, res: json(401, { error: 'Not signed in' }) }
  let sb
  try {
    sb = serviceClient()
  } catch {
    return { ok: false, res: json(500, { error: 'Server is not configured' }) }
  }
  const { data: user, error } = await sb.auth.getUser(token)
  if (error || !user.user) return { ok: false, res: json(401, { error: 'Invalid session' }) }
  const { data: admin } = await sb.from('admin_users').select('user_id').eq('user_id', user.user.id).maybeSingle()
  if (!admin) return { ok: false, res: json(403, { error: 'Not an admin' }) }
  return { ok: true }
}
