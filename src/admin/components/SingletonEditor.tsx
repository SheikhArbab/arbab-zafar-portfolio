import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { RotateCcw, Save } from 'lucide-react'
import { toast } from 'sonner'
import { AnimatePresence, m } from 'framer-motion'
import { requireSupabase } from '@/lib/supabase'
import { mergeProfile, mergeSettings } from '@/data/fetchPortfolio'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { FormRenderer, validate, type Errors, type FieldDef } from './FormFields'
import { Panel } from './PageHeader'
import { useTrackDirty } from '../lib/dirty'
import { deepEqual } from '../lib/paths'

function mergeRow(table: Props['table'], data: Record<string, unknown> | null): Record<string, unknown> {
  if (table === 'profile') return mergeProfile(data) as unknown as Record<string, unknown>
  if (table === 'site_settings') return mergeSettings(data) as unknown as Record<string, unknown>
  return { id: 1, notify_email: '', notify_enabled: true, ...(data ?? {}) }
}

export interface FieldGroup {
  title: string
  description?: ReactNode
  fields: FieldDef[]
  aside?: (values: Record<string, unknown>) => ReactNode
}

interface Props {
  table: 'profile' | 'site_settings' | 'private_settings'
  groups: FieldGroup[]
  onSaved?: (row: Record<string, unknown>) => void
  /** Extra content rendered under the groups (e.g. action buttons). */
  footer?: React.ReactNode
}

/** Editor for single-row tables (profile, site_settings). Only the columns used by `groups` are written. */
export function SingletonEditor({ table, groups, onSaved, footer }: Props) {
  const [original, setOriginal] = useState<Record<string, unknown> | null>(null)
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)

  const allFields = useMemo(() => groups.flatMap((g) => g.fields), [groups])
  const columns = useMemo(() => Array.from(new Set(allFields.map((f) => f.name.split('.')[0]))), [allFields])

  useEffect(() => {
    requireSupabase()
      .from(table)
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) toast.error(error.message)
        const merged = mergeRow(table, data)
        setOriginal(merged)
        setDraft(structuredClone(merged))
      })
  }, [table])

  const pick = (o: Record<string, unknown> | null) => Object.fromEntries(columns.map((c) => [c, o?.[c]]))
  const dirty = Boolean(original && draft && !deepEqual(pick(original), pick(draft)))
  useTrackDirty(`singleton:${table}:${columns.join()}`, dirty)

  const save = async () => {
    if (!draft) return
    const errs = validate(allFields, draft)
    setErrors(errs)
    if (Object.keys(errs).length) return toast.error('Please fix the highlighted fields')
    setSaving(true)
    const payload = { id: 1, ...pick(draft) }
    const { data, error } = await requireSupabase().from(table).upsert(payload).select('*').single()
    setSaving(false)
    if (error) return toast.error(error.message)
    const merged = mergeRow(table, data)
    setOriginal(merged)
    setDraft(structuredClone(merged))
    toast.success(table === 'private_settings' ? 'Saved.' : 'Saved. Changes are live on the portfolio.')
    onSaved?.(merged)
  }

  if (!draft)
    return (
      <div className="flex justify-center py-20 text-muted">
        <Spinner className="h-5 w-5" />
      </div>
    )

  return (
    <div className="space-y-6 pb-24">
      {groups.map((g) => (
        <Panel key={g.title} title={g.title} description={g.description}>
          <div className={g.aside ? 'grid gap-6 xl:grid-cols-[1fr_20rem]' : undefined}>
            <FormRenderer fields={g.fields} values={draft} onChange={setDraft} errors={errors} />
            {g.aside?.(draft)}
          </div>
        </Panel>
      ))}
      {footer}

      <AnimatePresence>
        {dirty && (
          <m.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="glass fixed right-4 bottom-4 left-4 z-40 flex items-center justify-between gap-3 rounded-xl px-4 py-3 shadow-2xl lg:left-[calc(16rem+1.5rem)]"
          >
            <p className="text-sm text-amber-300">● You have unsaved changes</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDraft(structuredClone(original!))}>
                <RotateCcw className="h-3.5 w-3.5" /> Discard
              </Button>
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? <Spinner /> : <Save className="h-3.5 w-3.5" />} Save
              </Button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
