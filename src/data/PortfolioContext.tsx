import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { defaultData } from '@/content/defaults'
import { fetchPortfolio } from '@/data/fetchPortfolio'
import { isSupabaseConfigured } from '@/lib/env'
import type { PortfolioData } from '@/types/content'

interface PortfolioState {
  data: PortfolioData
  ready: boolean
  error: string | null
  refresh: () => Promise<void>
}

const PortfolioCtx = createContext<PortfolioState | null>(null)

export function PortfolioProvider({ initialData, children }: { initialData?: PortfolioData | null; children: ReactNode }) {
  const [data, setData] = useState<PortfolioData>(initialData ?? defaultData)
  // Prerendered pages ship their data inline -> ready immediately. A bare SPA shell waits for Supabase.
  const [ready, setReady] = useState<boolean>(Boolean(initialData) || !isSupabaseConfigured)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    if (!isSupabaseConfigured) return
    try {
      const fresh = await fetchPortfolio()
      setData(fresh)
      setError(null)
    } catch (e) {
      console.warn('[portfolio] falling back to bundled content:', e)
      setError(e instanceof Error ? e.message : 'Failed to load content')
    } finally {
      setReady(true)
    }
  }

  useEffect(() => {
    // Revalidate in the background so admin edits show up without waiting for a rebuild.
    void refresh()
  }, [])

  const value = useMemo(() => ({ data, ready, error, refresh }), [data, ready, error])
  return <PortfolioCtx.Provider value={value}>{children}</PortfolioCtx.Provider>
}

export function usePortfolio() {
  const ctx = useContext(PortfolioCtx)
  if (!ctx) throw new Error('usePortfolio must be used inside <PortfolioProvider>')
  return ctx
}
