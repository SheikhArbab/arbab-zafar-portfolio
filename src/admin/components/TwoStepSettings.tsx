import { useCallback, useEffect, useState } from 'react'
import { Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Factor } from '@supabase/supabase-js'
import { requireSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Panel } from './PageHeader'
import { useConfirm } from './Confirm'
import { EnrollSteps, startEnrollment } from '../pages/MfaGate'

/** Authenticators on this admin account: add a backup device, remove extras (never the last one). */
export function TwoStepSettings() {
  const confirm = useConfirm()
  const [factors, setFactors] = useState<Factor[] | null>(null)
  const [adding, setAdding] = useState<{ id: string; uri: string; secret: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data } = await requireSupabase().auth.mfa.listFactors()
    setFactors((data?.totp ?? []).filter((f) => f.status === 'verified'))
  }, [])
  useEffect(() => {
    void load()
  }, [load])

  const add = async () => {
    setBusy(true)
    try {
      setAdding(await startEnrollment('Backup authenticator'))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start setup')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (f: Factor) => {
    if ((factors?.length ?? 0) <= 1) return toast.error('Keep at least one authenticator: two-step login is required.')
    if (!(await confirm({ title: `Remove “${f.friendly_name || 'authenticator'}”?`, description: 'Codes from that device will stop working.' }))) return
    const { error } = await requireSupabase().auth.mfa.unenroll({ factorId: f.id })
    if (error) return toast.error(error.message)
    toast.success('Authenticator removed')
    void load()
  }

  return (
    <Panel
      title="Two-step login"
      description="Required for this admin. Add a second authenticator (another phone or a password manager) so losing one device never locks you out."
    >
      {factors === null ? (
        <Spinner />
      ) : (
        <ul className="space-y-2">
          {factors.map((f) => (
            <li key={f.id} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-fg">{f.friendly_name || 'Authenticator app'}</span>
                <span className="block font-mono text-[0.65rem] text-dim">added {new Date(f.created_at).toLocaleDateString('en-GB')}</span>
              </span>
              <Button variant="ghost" size="icon" onClick={() => void remove(f)} aria-label="Remove authenticator" disabled={factors.length <= 1}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {adding ? (
        <div className="mt-5 max-w-sm rounded-xl border border-line p-4">
          <EnrollSteps
            enrollment={adding}
            onVerified={() => {
              setAdding(null)
              toast.success('Backup authenticator added')
              void load()
            }}
          />
        </div>
      ) : (
        <Button variant="outline" className="mt-4" onClick={() => void add()} disabled={busy}>
          {busy ? <Spinner /> : <Plus className="h-4 w-4" />} Add backup authenticator
        </Button>
      )}
    </Panel>
  )
}
