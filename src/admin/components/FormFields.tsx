import { useRef, useState, type KeyboardEvent } from 'react'
import { ArrowDown, ArrowUp, FileText, ImagePlus, Link2, Plus, Trash2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatBytes, slugify } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { FieldError, Input, Label, Select, Switch, Textarea } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'
import { getPath, setPath } from '../lib/paths'
import { uploadFile, validateFile, type Bucket } from '../lib/storage'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'url'
  | 'email'
  | 'number'
  | 'date'
  | 'color'
  | 'switch'
  | 'select'
  | 'tags'
  | 'lines'
  | 'image'
  | 'file'
  | 'repeater'
  | 'slug'

export interface FieldDef {
  name: string
  label: string
  type: FieldType
  help?: string
  placeholder?: string
  required?: boolean
  rows?: number
  max?: number
  options?: { value: string; label: string }[]
  fields?: FieldDef[]
  itemLabel?: string
  from?: string
  folder?: string
  bucket?: Bucket
  span?: 1 | 2
  showIf?: (values: Record<string, unknown>) => boolean
}

export type Errors = Record<string, string>

const URL_RE = /^(https?:\/\/|mailto:|tel:|\/)/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validate(fields: FieldDef[], values: Record<string, unknown>): Errors {
  const errors: Errors = {}
  for (const f of fields) {
    if (f.showIf && !f.showIf(values)) continue
    const v = getPath(values, f.name)
    const empty = v == null || v === '' || (Array.isArray(v) && v.length === 0)
    if (f.required && empty) errors[f.name] = `${f.label} is required`
    else if (!empty && f.type === 'url' && !URL_RE.test(String(v))) errors[f.name] = 'Must start with https://'
    else if (!empty && f.type === 'email' && !EMAIL_RE.test(String(v))) errors[f.name] = 'Invalid email address'
    else if (!empty && f.type === 'slug' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(v))) errors[f.name] = 'Lowercase letters, numbers and dashes only'
    else if (!empty && f.type === 'color' && !/^#[0-9a-f]{6}$/i.test(String(v))) errors[f.name] = 'Use a hex colour like #3dff9a'
    else if (f.max && typeof v === 'string' && v.length > f.max) errors[f.name] = `Max ${f.max} characters`
  }
  return errors
}

interface RendererProps<T> {
  fields: FieldDef[]
  values: T
  onChange: (next: T) => void
  errors?: Errors
}

export function FormRenderer<T extends Record<string, unknown>>({ fields, values, onChange, errors = {} }: RendererProps<T>) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map((f) => {
        if (f.showIf && !f.showIf(values)) return null
        const wide = f.span === 2 || ['textarea', 'lines', 'repeater', 'image', 'file', 'tags'].includes(f.type)
        return (
          <div key={f.name} className={cn(wide && 'sm:col-span-2')}>
            <FieldControl field={f} value={getPath(values, f.name)} values={values} onChange={(v) => onChange(setPath(values, f.name, v))} error={errors[f.name]} />
          </div>
        )
      })}
    </div>
  )
}

interface ControlProps {
  field: FieldDef
  value: unknown
  values: Record<string, unknown>
  onChange: (v: unknown) => void
  error?: string
}

function FieldControl({ field: f, value, values, onChange, error }: ControlProps) {
  const id = `f-${f.name.replace(/\./g, '-')}`
  const label = (
    <Label htmlFor={id}>
      {f.label}
      {f.required && <span className="ml-1 text-accent">*</span>}
    </Label>
  )
  const help = f.help && <p className="mt-1.5 text-xs text-dim">{f.help}</p>
  const common = { id, 'aria-invalid': Boolean(error) || undefined, placeholder: f.placeholder }

  switch (f.type) {
    case 'switch':
      return (
        <div className="flex h-full flex-col justify-center rounded-lg border border-line px-3 py-2.5">
          <Switch id={id} checked={Boolean(value)} onChange={onChange} label={f.label} />
          {help}
        </div>
      )
    case 'textarea':
      return (
        <div>
          {label}
          <Textarea {...common} rows={f.rows ?? 4} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
          <div className="flex justify-between">
            <FieldError>{error}</FieldError>
            {f.max && <span className="mt-1.5 ml-auto font-mono text-[0.65rem] text-dim">{String(value ?? '').length}/{f.max}</span>}
          </div>
          {help}
        </div>
      )
    case 'select':
      return (
        <div>
          {label}
          <Select {...common} value={String(value ?? '')} onChange={(e) => onChange(e.target.value || null)}>
            {f.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <FieldError>{error}</FieldError>
          {help}
        </div>
      )
    case 'color':
      return (
        <div>
          {label}
          <div className="flex gap-2">
            <input type="color" aria-label={`${f.label} picker`} value={String(value || '#000000')} onChange={(e) => onChange(e.target.value)} className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-line-strong bg-transparent p-1" />
            <Input {...common} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className="font-mono" />
          </div>
          <FieldError>{error}</FieldError>
          {help}
        </div>
      )
    case 'tags':
      return (
        <div>
          {label}
          <TagsInput id={id} value={(value as string[]) ?? []} onChange={onChange} placeholder={f.placeholder} />
          <FieldError>{error}</FieldError>
          {help ?? <p className="mt-1.5 text-xs text-dim">Press Enter or comma to add.</p>}
        </div>
      )
    case 'lines':
      return (
        <div>
          {label}
          <ListInput id={id} value={(value as string[]) ?? []} onChange={onChange} placeholder={f.placeholder} />
          <FieldError>{error}</FieldError>
          {help}
        </div>
      )
    case 'image':
    case 'file':
      return (
        <div>
          {label}
          <UploadField
            value={(value as string | null) ?? ''}
            onChange={onChange}
            kind={f.type === 'image' ? 'image' : 'any'}
            bucket={f.bucket ?? (f.type === 'image' ? 'media' : 'documents')}
            folder={f.folder ?? 'uploads'}
          />
          <FieldError>{error}</FieldError>
          {help}
        </div>
      )
    case 'repeater':
      return (
        <div>
          {label}
          <Repeater field={f} value={(value as Record<string, unknown>[]) ?? []} onChange={onChange} />
          {help}
        </div>
      )
    case 'slug': {
      const source = f.from ? String(getPath(values, f.from) ?? '') : ''
      return (
        <div>
          {label}
          <div className="flex gap-2">
            <Input {...common} value={String(value ?? '')} onChange={(e) => onChange(slugify(e.target.value))} className="font-mono" />
            {source && (
              <Button variant="outline" onClick={() => onChange(slugify(source))} title="Generate from title">
                Generate
              </Button>
            )}
          </div>
          <FieldError>{error}</FieldError>
          {help}
        </div>
      )
    }
    default: {
      const type = f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'email' ? 'email' : f.type === 'url' ? 'url' : 'text'
      return (
        <div>
          {label}
          <Input
            {...common}
            type={type}
            value={value == null ? '' : String(value)}
            maxLength={f.max}
            onChange={(e) => {
              const v = e.target.value
              onChange(f.type === 'number' ? (v === '' ? null : Number(v)) : f.type === 'date' ? v || null : v)
            }}
          />
          <FieldError>{error}</FieldError>
          {help}
        </div>
      )
    }
  }
}

export function TagsInput({ id, value, onChange, placeholder }: { id?: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState('')
  const add = (raw: string) => {
    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean)
    const next = [...value]
    for (const p of parts) if (!next.some((x) => x.toLowerCase() === p.toLowerCase())) next.push(p)
    onChange(next)
    setDraft('')
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (draft.trim()) add(draft)
    } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1))
  }
  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-line-strong bg-black/30 px-2 py-1.5 focus-within:border-accent/70">
      {value.map((t, i) => (
        <span key={t + i} className="inline-flex items-center gap-1 rounded-md bg-white/[0.07] py-0.5 pr-1 pl-2 text-xs text-fg">
          {t}
          <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="rounded p-0.5 text-muted hover:text-red-300" aria-label={`Remove ${t}`}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => draft.trim() && add(draft)}
        placeholder={value.length ? '' : placeholder ?? 'Add…'}
        className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-fg outline-none placeholder:text-dim"
      />
    </div>
  )
}

function ListInput({ id, value, onChange, placeholder }: { id?: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const update = (i: number, v: string) => onChange(value.map((x, k) => (k === i ? v : x)))
  const move = (i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= value.length) return
    const next = [...value]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div className="space-y-2">
      {value.map((v, i) => (
        <div key={i} className="flex gap-1.5">
          <Input id={i === 0 ? id : undefined} value={v} onChange={(e) => update(i, e.target.value)} placeholder={placeholder} />
          <Button variant="ghost" size="icon" onClick={() => move(i, -1)} aria-label="Move up" disabled={i === 0}>
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => move(i, 1)} aria-label="Move down" disabled={i === value.length - 1}>
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Remove">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="subtle" size="sm" onClick={() => onChange([...value, ''])}>
        <Plus className="h-3.5 w-3.5" /> Add item
      </Button>
    </div>
  )
}

function Repeater({ field, value, onChange }: { field: FieldDef; value: Record<string, unknown>[]; onChange: (v: Record<string, unknown>[]) => void }) {
  const blank = () => Object.fromEntries((field.fields ?? []).map((f) => [f.name, f.type === 'switch' ? true : '']))
  const move = (i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= value.length) return
    const next = [...value]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        <div key={i} className="rounded-xl border border-line bg-white/[0.015] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[0.68rem] text-dim">
              {field.itemLabel ?? 'item'} #{i + 1}
            </span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down">
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Remove">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <FormRenderer
            fields={(field.fields ?? []).map((f) => ({ ...f }))}
            values={item}
            onChange={(next) => onChange(value.map((x, k) => (k === i ? next : x)))}
          />
        </div>
      ))}
      <Button variant="subtle" size="sm" onClick={() => onChange([...value, blank()])}>
        <Plus className="h-3.5 w-3.5" /> Add {field.itemLabel ?? 'item'}
      </Button>
    </div>
  )
}

interface UploadProps {
  value: string
  onChange: (url: string | null) => void
  kind: 'image' | 'pdf' | 'any'
  bucket: Bucket
  folder: string
}

export function UploadField({ value, onChange, kind, bucket, folder }: UploadProps) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [meta, setMeta] = useState<{ name: string; size: number } | null>(null)
  const isImage = kind === 'image' || /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i.test(value)

  const pick = async (file: File | undefined) => {
    if (!file) return
    const err = validateFile(file, kind)
    if (err) return toast.error(err)
    setBusy(true)
    try {
      const { url } = await uploadFile(bucket, folder, file)
      onChange(url)
      setMeta({ name: file.name, size: file.size })
      toast.success('Uploaded')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div
      className="rounded-xl border border-dashed border-line-strong bg-black/20 p-3"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        void pick(e.dataTransfer.files[0])
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="grid h-20 w-full shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-elev sm:w-32">
          {value ? (
            isImage ? (
              <img src={value} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <FileText className="h-7 w-7 text-accent" />
            )
          ) : kind === 'image' ? (
            <ImagePlus className="h-6 w-6 text-dim" />
          ) : (
            <Upload className="h-6 w-6 text-dim" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          {value && (
            <a href={value} target="_blank" rel="noreferrer" className="block truncate font-mono text-xs text-accent-2 hover:underline">
              {meta ? `${meta.name} · ${formatBytes(meta.size)}` : value}
            </a>
          )}
          {mode === 'url' ? (
            <div className="flex gap-2">
              <Input placeholder="https://…" defaultValue={value} onBlur={(e) => onChange(e.target.value.trim() || null)} className="h-9" />
              <Button variant="ghost" size="sm" onClick={() => setMode('upload')}>
                Done
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => input.current?.click()} disabled={busy}>
                {busy ? <Spinner /> : <Upload className="h-3.5 w-3.5" />} {value ? 'Replace' : 'Upload'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setMode('url')}>
                <Link2 className="h-3.5 w-3.5" /> Use URL
              </Button>
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Only detach here; the stored object is cleaned up when the record is deleted.
                    onChange(null)
                    setMeta(null)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </Button>
              )}
            </div>
          )}
          <p className="text-[0.7rem] text-dim">{kind === 'image' ? 'PNG, JPG, WebP, AVIF, GIF or SVG · max 5 MB · drag & drop supported' : 'PDF or image · max 10 MB'}</p>
        </div>
      </div>
      <input ref={input} type="file" hidden accept={kind === 'image' ? 'image/*' : kind === 'pdf' ? 'application/pdf' : 'image/*,application/pdf'} onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  )
}
