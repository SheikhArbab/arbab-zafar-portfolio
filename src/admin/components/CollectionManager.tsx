import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Eye, EyeOff, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { requireSupabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { Dialog } from '@/components/ui/Dialog'
import { Spinner } from '@/components/ui/Spinner'
import { FormRenderer, validate, type Errors, type FieldDef } from './FormFields'
import { SortableList } from './SortableList'
import { useConfirm } from './Confirm'
import { EmptyState } from './PageHeader'
import { confirmDiscard, useTrackDirty } from '../lib/dirty'
import { deepEqual } from '../lib/paths'
import { removeFile } from '../lib/storage'

type Row = { id: string; sort_order: number } & Record<string, unknown>
type OwnedFile = { bucket: 'media' | 'documents'; url: string | null | undefined }

export interface CollectionConfig<T extends Row> {
  table: string
  singular: string
  fields: FieldDef[]
  blank: () => Partial<T>
  title: (row: T) => string
  subtitle?: (row: T) => ReactNode
  thumb?: (row: T) => string | null | undefined
  visibilityKey?: 'is_visible' | 'is_published'
  featuredKey?: string
  select?: string
  searchKeys?: (keyof T)[]
  filter?: { key: keyof T; label: string; options: { value: string; label: string }[] }
  /** Strip joined/derived columns before writing. */
  toRow?: (draft: T) => Record<string, unknown>
  /** Extra editor UI, e.g. a gallery. Receives the saved row (null when creating). */
  editorExtra?: (saved: T | null) => ReactNode
  /** Storage objects owned by a row, removed after the row is deleted. */
  ownedFiles?: (row: T) => OwnedFile[] | Promise<OwnedFile[]>
  onChanged?: (rows: T[]) => void
}

export function CollectionManager<T extends Row>(cfg: CollectionConfig<T>) {
  const { table, singular, fields, visibilityKey, featuredKey } = cfg
  const confirm = useConfirm()
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('')
  const [editing, setEditing] = useState<{ original: T | null; baseline: T; draft: T } | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const { data, error } = await requireSupabase().from(table).select(cfg.select ?? '*').order('sort_order')
    if (error) toast.error(error.message)
    else setRows((data ?? []) as unknown as T[])
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, cfg.select])

  useEffect(() => {
    void load()
  }, [load])
  useEffect(() => {
    cfg.onChanged?.(rows)
  }, [rows]) // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = Boolean(editing && !deepEqual(editing.draft, editing.baseline))
  useTrackDirty(`collection:${table}`, dirty)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (filter && cfg.filter && String(r[cfg.filter.key as string] ?? '') !== filter) return false
      if (!q) return true
      const keys = (cfg.searchKeys as string[] | undefined) ?? Object.keys(r)
      return keys.some((k) => String(r[k] ?? '').toLowerCase().includes(q))
    })
  }, [rows, query, filter, cfg.filter, cfg.searchKeys])

  const canReorder = !query && !filter

  const openNew = () => {
    setErrors({})
    const draft = { ...cfg.blank(), id: '', sort_order: rows.length } as T
    setEditing({ original: null, baseline: structuredClone(draft), draft })
  }
  const openEdit = (row: T) => {
    setErrors({})
    setEditing({ original: row, baseline: structuredClone(row), draft: structuredClone(row) })
  }
  const close = () => {
    if (dirty && !confirmDiscard()) return
    setEditing(null)
  }

  const toRow = (d: T) => {
    const base = cfg.toRow ? cfg.toRow(d) : { ...d }
    delete (base as Record<string, unknown>).created_at
    delete (base as Record<string, unknown>).updated_at
    return base
  }

  const save = async () => {
    if (!editing) return
    const errs = validate(fields, editing.draft)
    setErrors(errs)
    if (Object.keys(errs).length) return toast.error('Please fix the highlighted fields')
    setSaving(true)
    const sb = requireSupabase()
    const payload = toRow(editing.draft)
    const isNew = !editing.original
    if (isNew) delete (payload as Record<string, unknown>).id
    const q = isNew ? sb.from(table).insert(payload) : sb.from(table).update(payload).eq('id', editing.draft.id)
    const { data, error } = await q.select(cfg.select ?? '*').single()
    setSaving(false)
    if (error) return toast.error(error.code === '23505' ? 'That value must be unique (e.g. slug already used).' : error.message)
    const saved = data as unknown as T
    setRows((rs) => (isNew ? [...rs, saved] : rs.map((r) => (r.id === saved.id ? saved : r))))
    toast.success(`${singular} ${isNew ? 'created' : 'saved'}`)
    // Keep the editor open on create so gallery/children can be added immediately.
    setEditing(isNew && cfg.editorExtra ? { original: saved, baseline: structuredClone(saved), draft: structuredClone(saved) } : null)
  }

  const remove = async (row: T) => {
    const ok = await confirm({ title: `Delete “${cfg.title(row)}”?`, description: `This permanently removes the ${singular.toLowerCase()}.` })
    if (!ok) return
    // Resolve owned files BEFORE deleting: child rows (e.g. gallery images) cascade away with the row.
    const owned = (await cfg.ownedFiles?.(row)) ?? []
    const { error } = await requireSupabase().from(table).delete().eq('id', row.id)
    if (error) return toast.error(error.message)
    for (const f of owned) void removeFile(f.bucket, f.url)
    setRows((rs) => rs.filter((r) => r.id !== row.id))
    if (editing?.original?.id === row.id) setEditing(null)
    toast.success(`${singular} deleted`)
  }

  const patch = async (row: T, change: Partial<T>) => {
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, ...change } : r)))
    const { error } = await requireSupabase().from(table).update(change as Record<string, unknown>).eq('id', row.id)
    if (error) {
      toast.error(error.message)
      void load()
    }
  }

  const reorder = async (next: T[]) => {
    const updated = next.map((r, i) => ({ ...r, sort_order: i }))
    setRows(updated)
    const changed = updated.filter((r, i) => rows[i]?.id !== r.id || rows[i]?.sort_order !== i)
    const results = await Promise.all(changed.map((r) => requireSupabase().from(table).update({ sort_order: r.sort_order }).eq('id', r.id)))
    const err = results.find((r) => r.error)?.error
    if (err) {
      toast.error(err.message)
      void load()
    } else toast.success('Order saved')
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-dim" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${singular.toLowerCase()}s…`} className="pl-9" aria-label="Search" />
        </div>
        {cfg.filter && (
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="sm:w-56" aria-label={cfg.filter.label}>
            <option value="">All {cfg.filter.label.toLowerCase()}</option>
            {cfg.filter.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        )}
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> New {singular.toLowerCase()}
        </Button>
      </div>
      {!canReorder && rows.length > 1 && <p className="mb-3 text-xs text-dim">Clear search and filters to drag-and-drop reorder.</p>}

      {loading ? (
        <div className="flex justify-center py-16 text-muted">
          <Spinner className="h-5 w-5" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          title={rows.length ? 'No matches' : `No ${singular.toLowerCase()}s yet`}
          description={rows.length ? 'Try a different search or filter.' : `Create your first ${singular.toLowerCase()} to show it on the portfolio.`}
          action={!rows.length && <Button onClick={openNew}>Create {singular.toLowerCase()}</Button>}
        />
      ) : (
        <SortableList
          items={visible}
          onReorder={reorder}
          disabled={!canReorder}
          render={(row, handle) => {
            const isOn = visibilityKey ? Boolean(row[visibilityKey]) : true
            const thumb = cfg.thumb?.(row)
            return (
              <div className={cn('flex items-center gap-3 rounded-xl border border-line bg-white/[0.015] p-2.5 pr-3 transition-colors hover:border-line-strong', !isOn && 'opacity-55')}>
                {handle}
                {cfg.thumb && (
                  <div className="hidden h-11 w-16 shrink-0 overflow-hidden rounded-md border border-line bg-elev sm:block">
                    {thumb && <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />}
                  </div>
                )}
                <button className="min-w-0 flex-1 text-left" onClick={() => openEdit(row)}>
                  <p className="truncate text-sm font-medium text-fg">{cfg.title(row) || <span className="text-dim">Untitled</span>}</p>
                  {cfg.subtitle && <div className="truncate text-xs text-muted">{cfg.subtitle(row)}</div>}
                </button>
                <div className="flex shrink-0 items-center gap-0.5">
                  {featuredKey && (
                    <Button variant="ghost" size="icon" onClick={() => patch(row, { [featuredKey]: !row[featuredKey] } as Partial<T>)} aria-label="Toggle featured" title="Featured">
                      <Star className={cn('h-4 w-4', row[featuredKey] ? 'fill-amber-300 text-amber-300' : '')} />
                    </Button>
                  )}
                  {visibilityKey && (
                    <Button variant="ghost" size="icon" onClick={() => patch(row, { [visibilityKey]: !isOn } as Partial<T>)} aria-label={isOn ? 'Hide' : 'Show'} title={isOn ? 'Visible: click to hide' : 'Hidden: click to show'}>
                      {isOn ? <Eye className="h-4 w-4 text-accent" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(row)} aria-label="Delete">
                    <Trash2 className="h-4 w-4 hover:text-red-400" />
                  </Button>
                </div>
              </div>
            )
          }}
        />
      )}

      <Dialog
        side
        open={Boolean(editing)}
        onClose={close}
        title={editing?.original ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}
        description={dirty ? <span className="text-amber-300">● Unsaved changes</span> : editing?.original ? 'All changes saved' : undefined}
        footer={
          <>
            {editing?.original && (
              <Button variant="ghost" className="mr-auto text-red-300" onClick={() => remove(editing.original!)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            )}
            <Button variant="ghost" onClick={close}>
              {dirty ? 'Cancel' : 'Close'}
            </Button>
            <Button onClick={save} disabled={saving || (!dirty && Boolean(editing?.original))}>
              {saving && <Spinner />} {editing?.original ? 'Save changes' : `Create ${singular.toLowerCase()}`}
            </Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-8">
            <FormRenderer fields={fields} values={editing.draft} onChange={(draft) => setEditing((e) => (e ? { ...e, draft } : e))} errors={errors} />
            {cfg.editorExtra?.(editing.original)}
          </div>
        )}
      </Dialog>
    </div>
  )
}
