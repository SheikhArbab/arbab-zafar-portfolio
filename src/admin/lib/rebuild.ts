import { requireSupabase } from '@/lib/supabase'

/** Asks Netlify (via /api/rebuild) to rebuild the prerendered pages. Throws with a readable message. */
export async function triggerRebuild() {
  const { data } = await requireSupabase().auth.getSession()
  const res = await fetch('/api/rebuild', { method: 'POST', headers: { Authorization: `Bearer ${data.session?.access_token}` } })
  const body = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) throw new Error(body.error || `Rebuild failed (${res.status})`)
}
