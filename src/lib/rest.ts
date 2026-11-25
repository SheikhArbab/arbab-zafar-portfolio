import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env'

/**
 * Minimal read-only PostgREST client for the public site (~1 KB instead of supabase-js).
 * Requests run as the `anon` role, so RLS guarantees only published content is returned.
 */
/**
 * Works with both key styles: legacy anon JWTs (also sent as Bearer) and the newer
 * `sb_publishable_…` keys, which are not JWTs and must only travel in the apikey header.
 */
function anonHeaders(): Record<string, string> {
  const key = SUPABASE_ANON_KEY!
  return key.startsWith('eyJ') ? { apikey: key, Authorization: `Bearer ${key}` } : { apikey: key }
}

export async function restSelect<T>(table: string, query: Record<string, string>): Promise<T[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Supabase not configured')
  const params = new URLSearchParams(query)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: { ...anonHeaders(), Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text().catch(() => '')}`)
  return (await res.json()) as T[]
}

/** Reads the admin session token persisted by supabase-js (if any), without loading supabase-js. */
export function storedAccessToken(): string | null {
  if (typeof window === 'undefined' || !SUPABASE_URL) return null
  try {
    const ref = new URL(SUPABASE_URL).hostname.split('.')[0]
    const raw = localStorage.getItem(`sb-${ref}-auth-token`)
    return raw ? ((JSON.parse(raw) as { access_token?: string }).access_token ?? null) : null
  } catch {
    return null
  }
}

export async function rpcAsUser<T>(fn: string, token: string): Promise<T | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: '{}',
  })
  return res.ok ? ((await res.json()) as T) : null
}
