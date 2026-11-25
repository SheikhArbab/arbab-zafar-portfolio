import { useEffect, useMemo, useState } from 'react'
import { RotateCcw, Save, Search } from 'lucide-react'
import { toast } from 'sonner'
import { AnimatePresence, m } from 'framer-motion'
import { requireSupabase } from '@/lib/supabase'
import { dict, type Locale } from '@/i18n'
import { flattenDict, type UiEntry } from '@/i18n/overrides'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader } from '../components/PageHeader'
import { useTrackDirty } from '../lib/dirty'
import { deepEqual } from '../lib/paths'
import { triggerRebuild } from '../lib/rebuild'

type Overrides = Record<Locale, Record<string, string>>

const GROUPS: Record<string, string> = {
  common: 'General',
  hero: 'Hero',
  terminal: 'Terminal',
  about: 'About',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  links: 'Project links',
  caseStudy: 'Case study pages',
  german: 'German learning strip',
  playgroundTeaser: 'Playground teaser',
  contact: 'Contact form',
  footer: 'Footer',
  notFound: '404 page',
  maintenance: 'Maintenance',
  error: 'Error screen',
  playground: 'Playground',
  games: 'Games',
  cv: 'CV generator',
  whatsapp: 'WhatsApp chat',
  seo: 'Page titles (SEO)',
  langName: 'Language name',
  langShort: 'Language name',
}

const humanize = (path: string) =>
  path
    .split('.')
    .slice(1)
    .map((p) => (/^\d+$/.test(p) ? `#${Number(p) + 1}` : p.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()))
    .join(' › ') || path

const clean = (o: Record<string, string>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v.trim() !== ''))

export default function TextsPage() {
  const [baseline, setBaseline] = useState<Overrides | null>(null)
  const [draft, setDraft] = useState<Overrides>({ en: {}, de: {} })
  const [lang, setLang] = useState<Locale>('en')
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    requireSupabase()
      .from('site_settings')
      .select('ui_text')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) toast.error(error.message)
        const ui = (data?.ui_text ?? {}) as Partial<Overrides>
        const loaded = { en: { ...(ui.en ?? {}) }, de: { ...(ui.de ?? {}) } }
        setBaseline(loaded)
        setDraft(structuredClone(loaded))
      })
  }, [])

  const entries = useMemo(() => ({ en: flattenDict(dict('en')), de: flattenDict(dict('de')) }), [])
  const dirty = Boolean(baseline && !deepEqual({ en: clean(draft.en), de: clean(draft.de) }, { en: clean(baseline.en), de: clean(baseline.de) }))
  useTrackDirty('ui-text', dirty)

  const q = query.trim().toLowerCase()
  const visible = entries[lang].filter(
    (e) => !q || e.path.toLowerCase().includes(q) || e.value.toLowerCase().includes(q) || (draft[lang][e.path] ?? '').toLowerCase().includes(q),
  )
  const groups = visible.reduce<Record<string, UiEntry[]>>((acc, e) => {
    const g = GROUPS[e.path.split('.')[0]] ?? 'Other'
    ;(acc[g] ??= []).push(e)
    return acc
  }, {})

  const setValue = (path: string, value: string) => setDraft((d) => ({ ...d, [lang]: { ...d[lang], [path]: value } }))
  const count = (l: Locale) => Object.keys(clean(draft[l])).length

  const save = async () => {
    setSaving(true)
    const ui_text = { en: clean(draft.en), de: clean(draft.de) }
    const { error } = await requireSupabase().from('site_settings').update({ ui_text }).eq('id', 1)
    setSaving(false)
    if (error) return toast.error(error.message)
    setBaseline(structuredClone(ui_text))
    setDraft(structuredClone(ui_text))
    toast.success('Saved. Visitors see the new text now.')
    // Keep the prerendered pages (first paint, search engines) in sync.
    triggerRebuild()
      .then(() => toast.success('Static pages refresh in ~1–2 minutes.'))
      .catch((e: unknown) => toast.error(`Rebuild failed: ${e instanceof Error ? e.message : 'unknown error'}. Use “Publish SEO build” on the Overview.`))
  }

  if (!baseline)
    return (
      <div className="flex justify-center py-20 text-muted">
        <Spinner className="h-5 w-5" />
      </div>
    )

  return (
    <div className="pb-24">
      <PageHeader
        title="Interface text"
        description="Every button, label and message on the public site, in English and German. Leave a field empty to use the built-in text. Values like {1} are filled in automatically (a name, a number, …)."
      />

      <div className="sticky top-0 z-20 -mx-1 mb-5 flex flex-col gap-3 bg-bg/90 px-1 py-3 backdrop-blur sm:flex-row sm:items-center">
        <div role="tablist" aria-label="Language" className="inline-flex rounded-lg border border-line p-0.5">
          {(['en', 'de'] as Locale[]).map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={lang === l}
              onClick={() => setLang(l)}
              className={cn('flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium', lang === l ? 'bg-accent/15 text-accent' : 'text-muted hover:text-fg')}
            >
              {l === 'en' ? 'English' : 'Deutsch'}
              <span className="font-mono text-[0.65rem] text-dim">{count(l)} edited</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-dim" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search texts…" className="pl-9" aria-label="Search texts" />
        </div>
      </div>

      {Object.keys(groups).length === 0 && <p className="py-10 text-center text-sm text-dim">No text matches “{query}”.</p>}

      <div className="space-y-3">
        {Object.entries(groups).map(([group, items]) => {
          const edited = items.filter((e) => (draft[lang][e.path] ?? '').trim()).length
          return (
            <details key={`${lang}:${group}`} open={Boolean(q)} className="group rounded-2xl border border-line bg-white/[0.015]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
                <span className="font-medium text-fg">{group}</span>
                <span className="font-mono text-[0.68rem] text-dim">
                  {items.length} texts{edited ? ` · ${edited} edited` : ''}
                </span>
              </summary>
              <div className="space-y-4 border-t border-line px-5 py-5">
                {items.map((e) => {
                  const id = `ui-${lang}-${e.path.replace(/[^a-zA-Z0-9]/g, '-')}`
                  const value = draft[lang][e.path] ?? ''
                  const long = e.value.length > 70
                  return (
                    <div key={e.path}>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <label htmlFor={id} className="text-xs text-muted">
                          {humanize(e.path)} <span className="font-mono text-[0.62rem] text-dim">{e.path}</span>
                        </label>
                        {value.trim() && (
                          <button type="button" onClick={() => setValue(e.path, '')} className="font-mono text-[0.65rem] text-dim hover:text-accent">
                            reset
                          </button>
                        )}
                      </div>
                      {long ? (
                        <Textarea id={id} rows={2} value={value} placeholder={e.value} onChange={(ev) => setValue(e.path, ev.target.value)} />
                      ) : (
                        <Input id={id} value={value} placeholder={e.value} onChange={(ev) => setValue(e.path, ev.target.value)} />
                      )}
                      {e.template && <p className="mt-1 text-[0.68rem] text-dim">Keep {e.value.match(/\{\d\}/g)?.join(', ')} where the value should appear.</p>}
                    </div>
                  )
                })}
              </div>
            </details>
          )
        })}
      </div>

      <AnimatePresence>
        {dirty && (
          <m.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="glass fixed right-4 bottom-4 left-4 z-40 flex items-center justify-between gap-3 rounded-xl px-4 py-3 lg:left-[calc(16rem+1.5rem)]"
          >
            <p className="text-sm text-amber-300">● Unsaved text changes</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDraft(structuredClone(baseline))}>
                <RotateCcw className="h-3.5 w-3.5" /> Discard
              </Button>
              <Button size="sm" onClick={() => void save()} disabled={saving}>
                {saving ? <Spinner /> : <Save className="h-3.5 w-3.5" />} Save
              </Button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
