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
import { cleanupReplacedFiles, clearDraft, friendlyDbError, loadDraft, saveDraft } from '../lib/formHelpers'
import { deFields, translationProgress, type EditLang } from '../lib/translate'
import { LangTabs } from './LangTabs'

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
  /** Field names in this group that also get a German version (translations.de.<name>). */
  translate?: string[]
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
  const [lang, setLang] = useState<EditLang>('en')

  const baseFields = useMemo(() => groups.flatMap((g) => g.fields), [groups])
  const translatable = useMemo(() => groups.flatMap((g) => g.translate ?? []), [groups])
  const columns = useMemo(
    () => Array.from(new Set([...baseFields.map((f) => f.name.split('.')[0]), ...(translatable.length ? ['translations'] : [])])),
    [baseFields, translatable],
  )
  const fieldsFor = (values: Record<string, unknown> | null) =>
    translatable.length && values ? [...baseFields, ...deFields(baseFields, translatable, values)] : baseFields
  const allFields = fieldsFor(draft)

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
  const draftKey = `singleton:${table}:${columns.join()}`
  useTrackDirty(draftKey, dirty)

  // Unsaved edits survive the browser Back button / reload (sessionStorage, this tab only).
  const [pendingDraft, setPendingDraft] = useState<Record<string, unknown> | null>(null)
  useEffect(() => {
    if (dirty && draft) saveDraft(draftKey, pick(draft))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dirty, draft, draftKey])
  useEffect(() => {
    if (!original) return
    const stored = loadDraft<Record<string, unknown>>(draftKey)
    if (stored && !deepEqual(stored, pick(original))) setPendingDraft(stored)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [original === null, draftKey])

  const save = async () => {
    if (!draft) return
    const errs = validate(allFields, draft)
    setErrors(errs)
    const keys = Object.keys(errs)
    if (keys.length) {
      if (keys.every((k) => k.startsWith('translations.'))) setLang('de')
      else if (keys.every((k) => !k.startsWith('translations.'))) setLang('en')
      return toast.error('Please fix the highlighted fields')
    }
    setSaving(true)
    const payload = { id: 1, ...pick(draft) }
    const { data, error } = await requireSupabase().from(table).upsert(payload).select('*').single()
    setSaving(false)
    if (error) return toast.error(friendlyDbError(error, allFields))
    const merged = mergeRow(table, data)
    clearDraft(draftKey)
    // Only after a successful save: delete uploads that were replaced or removed.
    void cleanupReplacedFiles(allFields, original, merged)
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
      {pendingDraft && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/30 bg-amber-300/[0.06] px-4 py-3 text-sm">
          <span className="text-amber-200">You have unsaved changes on this page from earlier.</span>
          <span className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setDraft({ ...draft, ...pendingDraft })
                setPendingDraft(null)
              }}
            >
              Restore
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                clearDraft(draftKey)
                setPendingDraft(null)
              }}
            >
              Discard
            </Button>
          </span>
        </div>
      )}
      {translatable.length > 0 && <LangTabs lang={lang} onChange={setLang} progress={translationProgress(translatable, draft)} />}
      {groups
        .filter((g) => lang === 'en' || g.translate?.length)
        .map((g) => (
          <Panel key={`${lang}:${g.title}`} title={g.title} description={lang === 'de' ? undefined : g.description}>
            <div className={g.aside && lang === 'en' ? 'grid gap-6 xl:grid-cols-[1fr_20rem]' : undefined}>
              <FormRenderer
                fields={lang === 'de' ? deFields(g.fields, g.translate ?? [], draft) : g.fields}
                values={draft}
                onChange={(next) => {
                  setDraft(next)
                  if (Object.keys(errors).length) setErrors(validate(fieldsFor(next), next))
                }}
                errors={errors}
              />
              {lang === 'en' && g.aside?.(draft)}
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
            className="glass fixed right-4 bottom-4 left-4 z-40 flex items-center justify-between gap-3 rounded-xl px-4 py-3 [--glass-drop:0_25px_50px_-12px_rgb(0_0_0/0.6)] lg:left-[calc(16rem+1.5rem)]"
          >
            <p className="text-sm text-amber-300">● You have unsaved changes</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearDraft(draftKey)
                  setDraft(structuredClone(original!))
                }}
              >
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
