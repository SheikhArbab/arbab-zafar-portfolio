import type { Config } from '@netlify/functions'
import { json, originAllowed, requireAdmin } from './_shared'

/**
 * Admin-only: triggers a Netlify build hook so prerendered SEO pages + sitemap
 * pick up the latest content. Verifies the caller's Supabase session AND admin row.
 */
export default async (req: Request) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' })
  if (!originAllowed(req)) return json(403, { error: 'Forbidden origin' })
  const hook = process.env.NETLIFY_BUILD_HOOK_URL
  if (!hook) return json(501, { error: 'NETLIFY_BUILD_HOOK_URL is not configured' })
  const auth = await requireAdmin(req)
  if (!auth.ok) return auth.res

  const res = await fetch(`${hook}?trigger_title=${encodeURIComponent('Admin publish')}`, { method: 'POST' })
  if (!res.ok) return json(502, { error: `Build hook failed (${res.status})` })
  return json(200, { ok: true })
}

export const config: Config = { path: '/api/rebuild' }
