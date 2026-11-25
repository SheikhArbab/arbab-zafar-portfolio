import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

/**
 * - 'enroll':    admin account without an authenticator yet: must set one up before anything else
 * - 'challenge': admin account with an authenticator: must enter a code
 * - 'ok':        session verified with the second factor (aal2)
 * The database enforces the same rule (is_admin() requires aal2), this only drives the UI.
 */
export type MfaStep = 'enroll' | 'challenge' | 'ok'

interface AuthState {
  session: Session | null
  /** Signed-in account is listed in admin_users (it may still need its second factor). */
  isAdminAccount: boolean
  /** Full admin: admin account AND second factor verified. */
  isAdmin: boolean
  mfa: MfaStep
  loading: boolean
  recovery: boolean
  clearRecovery: () => void
  /** Re-evaluate after enrolling / verifying a factor. */
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthCtx = createContext<AuthState | null>(null)

/** Assurance level of a session, read from its (already verified) access token. */
function aalOf(s: Session): string {
  try {
    const part = s.access_token.split('.')[1] ?? ''
    return (JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))) as { aal?: string }).aal ?? 'aal1'
  } catch {
    return 'aal1'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isAdminAccount, setIsAdminAccount] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mfa, setMfa] = useState<MfaStep>('enroll')
  const [loading, setLoading] = useState(true)
  const [recovery, setRecovery] = useState(false)

  // The user + assurance level already verified. Supabase re-emits SIGNED_IN when a tab regains
  // focus; for the same user and level we must NOT flip back to "loading", which would unmount the
  // dashboard and throw away unsaved edits in an open editor.
  const verified = useRef<string | null>(null)

  const check = useCallback(async (s: Session | null, force = false) => {
    const sb = supabase
    if (!sb) return
    if (!s) {
      verified.current = null
      setSession(null)
      setIsAdminAccount(false)
      setIsAdmin(false)
      setMfa('enroll')
      setLoading(false)
      return
    }
    const key = `${s.user.id}:${aalOf(s)}`
    if (!force && verified.current === key) {
      setSession(s) // same user and level, fresh tokens: no re-verification, no remount
      return
    }
    setLoading(true)
    // Authorization is decided by the database (admin_users + aal2), not the client.
    const [{ data: account }, { data: admin }, { data: level }] = await Promise.all([
      sb.rpc('is_admin_account'),
      sb.rpc('is_admin'),
      sb.auth.mfa.getAuthenticatorAssuranceLevel(),
    ])
    verified.current = key
    setSession(s)
    setIsAdminAccount(account === true)
    setIsAdmin(admin === true)
    setMfa(level?.currentLevel === 'aal2' ? 'ok' : level?.nextLevel === 'aal2' ? 'challenge' : 'enroll')
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => check(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      if (event === 'TOKEN_REFRESHED' && s && verified.current === `${s.user.id}:${aalOf(s)}`) return setSession(s)
      // Run outside the auth callback: calling Supabase from inside it can deadlock the client.
      setTimeout(() => void check(s), 0)
    })
    return () => sub.subscription.unsubscribe()
  }, [check])

  const refresh = useCallback(async () => {
    const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } }
    await check(data.session, true)
  }, [check])

  const signOut = async () => {
    await supabase?.auth.signOut()
  }

  return (
    <AuthCtx.Provider
      value={{ session, isAdminAccount, isAdmin, mfa, loading, recovery, clearRecovery: () => setRecovery(false), refresh, signOut }}
    >
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
