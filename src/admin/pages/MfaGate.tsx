import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Check, Copy, KeyRound, ShieldCheck, Smartphone } from 'lucide-react'
import { requireSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { FieldError, Input, Label } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'
import { QrCode } from '@/cv/QrCode'
import { useAuth } from '../lib/auth'

interface Enrollment {
  id: string
  uri: string
  secret: string
}

/** 6-digit code field: numeric keyboard on phones, autofill from authenticator apps, submits when complete. */
function CodeInput({ value, onChange, onComplete }: { value: string; onChange: (v: string) => void; onComplete: (v: string) => void }) {
  return (
    <Input
      id="mfa-code"
      value={value}
      onChange={(e) => {
        const v = e.target.value.replace(/\D/g, '').slice(0, 6)
        onChange(v)
        if (v.length === 6) onComplete(v)
      }}
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9]{6}"
      maxLength={6}
      placeholder="123456"
      autoFocus
      className="text-center font-mono text-2xl tracking-[0.5em]"
      aria-describedby="mfa-help"
    />
  )
}

/** Creates a fresh TOTP factor (dropping abandoned, unverified ones first). */
export async function startEnrollment(friendlyName: string): Promise<Enrollment> {
  const sb = requireSupabase()
  const { data: list } = await sb.auth.mfa.listFactors()
  for (const f of list?.all ?? []) {
    if (f.status === 'unverified') await sb.auth.mfa.unenroll({ factorId: f.id })
  }
  const { data, error } = await sb.auth.mfa.enroll({ factorType: 'totp', friendlyName: `${friendlyName} · ${new Date().toISOString().slice(0, 16).replace('T', ' ')}` })
  if (error || !data) throw error ?? new Error('Could not start setup')
  return { id: data.id, uri: data.totp.uri, secret: data.totp.secret }
}

export function EnrollSteps({ enrollment, onVerified }: { enrollment: Enrollment; onVerified: () => void }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const verify = async (value = code) => {
    if (value.length !== 6 || busy) return
    setBusy(true)
    setError('')
    const { error } = await requireSupabase().auth.mfa.challengeAndVerify({ factorId: enrollment.id, code: value })
    setBusy(false)
    if (error) {
      setError(error.code === 'mfa_verification_failed' ? 'That code is not right. Check the time on your phone and try the newest code.' : error.message)
      setCode('')
      return
    }
    onVerified()
  }

  return (
    <div className="space-y-5">
      <ol className="space-y-4 text-sm text-muted">
        <li className="flex gap-3">
          <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <span>Open an authenticator app on your phone (Google Authenticator, Microsoft Authenticator, Authy, 1Password…).</span>
        </li>
        <li className="flex gap-3">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <span>Scan this QR code, or type the key by hand.</span>
        </li>
      </ol>
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-xl bg-white p-2">
          <QrCode value={enrollment.uri} title="Authenticator setup QR code" className="h-44 w-44" />
        </div>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(enrollment.secret).then(() => setCopied(true))
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 font-mono text-xs break-all text-fg hover:border-accent/50"
          aria-label="Copy setup key"
        >
          <span data-testid="mfa-secret">{enrollment.secret.replace(/(.{4})/g, '$1 ').trim()}</span>
          {copied ? <Check className="h-3.5 w-3.5 shrink-0 text-accent" /> : <Copy className="h-3.5 w-3.5 shrink-0" />}
        </button>
      </div>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          void verify()
        }}
        className="space-y-3"
      >
        <Label htmlFor="mfa-code">Enter the 6-digit code the app shows</Label>
        <CodeInput value={code} onChange={setCode} onComplete={(v) => void verify(v)} />
        <FieldError>{error}</FieldError>
        <Button type="submit" className="w-full" disabled={busy || code.length !== 6}>
          {busy && <Spinner />} Turn on two-step login
        </Button>
      </form>
    </div>
  )
}

/** Shown after the password step: set up an authenticator (first time) or enter its code. */
export default function MfaGate() {
  const { mfa, refresh, signOut, session } = useAuth()
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const started = useRef(false)

  useEffect(() => {
    if (mfa !== 'enroll' || started.current) return
    started.current = true
    startEnrollment('Admin authenticator')
      .then(setEnrollment)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not start setup'))
  }, [mfa])

  const verify = async (value = code) => {
    if (value.length !== 6 || busy) return
    setBusy(true)
    setError('')
    const sb = requireSupabase()
    const { data: list } = await sb.auth.mfa.listFactors()
    const factor = list?.totp.find((f) => f.status === 'verified')
    if (!factor) {
      setBusy(false)
      return setError('No authenticator found for this account.')
    }
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: factor.id, code: value })
    setBusy(false)
    if (error) {
      setError(error.code === 'mfa_verification_failed' ? 'Wrong code. Use the newest code from your authenticator app.' : error.message)
      setCode('')
      return
    }
    await refresh()
  }

  return (
    <div className="bg-grid relative flex min-h-screen items-center justify-center p-5">
      <div className="glass hud relative w-full max-w-sm rounded-2xl p-7">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-accent/30 bg-accent/[0.07] text-accent">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <h1 className="font-semibold text-white">{mfa === 'enroll' ? 'Set up two-step login' : 'Two-step verification'}</h1>
            <p className="font-mono text-[0.65rem] text-dim">{session?.user.email}</p>
          </div>
        </div>

        {mfa === 'enroll' ? (
          enrollment ? (
            <EnrollSteps enrollment={enrollment} onVerified={() => void refresh()} />
          ) : error ? (
            <FieldError>{error}</FieldError>
          ) : (
            <div className="flex justify-center py-10 text-muted">
              <Spinner className="h-5 w-5" />
            </div>
          )
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void verify()
            }}
            className="space-y-3"
          >
            <Label htmlFor="mfa-code">Code from your authenticator app</Label>
            <CodeInput value={code} onChange={setCode} onComplete={(v) => void verify(v)} />
            <FieldError>{error}</FieldError>
            <Button type="submit" className="w-full" disabled={busy || code.length !== 6}>
              {busy && <Spinner />} Verify
            </Button>
            <p id="mfa-help" className="text-xs leading-relaxed text-dim">
              Lost your phone? Use a backup authenticator if you added one. Otherwise the factor can be removed in the Supabase dashboard (Authentication → Users).
            </p>
          </form>
        )}

        <button type="button" onClick={() => void signOut()} className="mt-6 w-full text-center font-mono text-xs text-muted hover:text-accent">
          sign out
        </button>
      </div>
    </div>
  )
}
