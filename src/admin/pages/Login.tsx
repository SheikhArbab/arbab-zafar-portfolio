import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { requireSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { FieldError, Input, Label } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '../lib/auth'
import MfaGate from './MfaGate'

export default function Login() {
  const { session, mfa, loading, recovery, clearRecovery } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  // Signed in: /admin shows the two-step screen, the dashboard, or "access denied".
  if (!loading && session && !recovery) return <Navigate to="/admin" replace />
  // Password reset for an account with an authenticator: verify the code before changing the password.
  if (!loading && session && recovery && mfa === 'challenge') return <MfaGate />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    const sb = requireSupabase()
    try {
      if (recovery) {
        if (password.length < 10) throw new Error('Use at least 10 characters.')
        const { error } = await sb.auth.updateUser({ password })
        if (error) throw error
        clearRecovery()
        navigate('/admin')
      } else if (mode === 'reset') {
        const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/admin/login` })
        if (error) throw error
        setInfo('If that address belongs to an admin, a reset link is on its way.')
      } else {
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw new Error(error.code === 'invalid_credentials' ? 'Invalid credentials.' : error.message)
        navigate('/admin')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-grid relative flex min-h-screen items-center justify-center p-5">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(600px_400px_at_50%_30%,color-mix(in_oklab,var(--accent)_8%,transparent),transparent)]" />
      <form onSubmit={submit} className="glass hud relative w-full max-w-sm rounded-2xl p-7">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-accent/30 bg-accent/[0.07] text-accent">
            <Lock className="h-4 w-4" />
          </span>
          <div>
            <h1 className="font-semibold text-white">{recovery ? 'Set a new password' : mode === 'reset' ? 'Reset password' : 'Admin access'}</h1>
            <p className="font-mono text-[0.65rem] text-dim">auth://supabase · encrypted session</p>
          </div>
        </div>

        <div className="space-y-4">
          {!recovery && (
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          )}
          {(recovery || mode === 'login') && (
            <div>
              <Label htmlFor="password">{recovery ? 'New password' : 'Password'}</Label>
              <Input id="password" type="password" autoComplete={recovery ? 'new-password' : 'current-password'} required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
          <FieldError>{error}</FieldError>
          {info && <p className="text-xs text-accent">{info}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Spinner />}
            {recovery ? 'Update password' : mode === 'reset' ? 'Send reset link' : 'Sign in'}
          </Button>
          {!recovery && (
            <button type="button" onClick={() => setMode(mode === 'login' ? 'reset' : 'login')} className="w-full text-center font-mono text-xs text-muted hover:text-accent">
              {mode === 'login' ? 'forgot password?' : '← back to sign in'}
            </button>
          )}
        </div>
        <a href="/" className="mt-6 block text-center font-mono text-[0.65rem] text-dim hover:text-fg">
          ← back to portfolio
        </a>
      </form>
    </div>
  )
}
