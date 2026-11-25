import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  session: Session | null
  isAdmin: boolean
  loading: boolean
  recovery: boolean
  clearRecovery: () => void
  signOut: () => Promise<void>
}

const AuthCtx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [recovery, setRecovery] = useState(false)

  // The user whose admin status has already been verified. Supabase re-emits SIGNED_IN when a tab
  // regains focus; for the same user we must NOT flip back to "loading", which would unmount the
  // dashboard and throw away unsaved edits in an open editor.
  const verifiedUser = useRef<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    const check = async (s: Session | null) => {
      if (!s) {
        verifiedUser.current = null
        setSession(null)
        setIsAdmin(false)
        setLoading(false)
        return
      }
      if (verifiedUser.current === s.user.id) {
        setSession(s) // same user, fresh tokens: no re-verification, no remount
        return
      }
      setLoading(true)
      // Authorization is decided by the database (admin_users table), not the client.
      const { data, error } = await supabase!.rpc('is_admin')
      verifiedUser.current = s.user.id
      setSession(s)
      setIsAdmin(!error && data === true)
      setLoading(false)
    }
    supabase.auth.getSession().then(({ data }) => check(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      if (event === 'TOKEN_REFRESHED') return setSession(s)
      void check(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase?.auth.signOut()
  }

  return (
    <AuthCtx.Provider value={{ session, isAdmin, loading, recovery, clearRecovery: () => setRecovery(false), signOut }}>{children}</AuthCtx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
