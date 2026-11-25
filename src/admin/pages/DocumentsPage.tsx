import { useEffect, useRef, useState } from 'react'
import { Download, Eye, EyeOff, FileText, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { requireSupabase } from '@/lib/supabase'
import { formatBytes } from '@/lib/utils'
import type { DocumentFile, DocumentKind } from '@/types/content'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState, PageHeader, Panel } from '../components/PageHeader'
import { useConfirm } from '../components/Confirm'
import { removeFile, uploadFile, validateFile } from '../lib/storage'

function useDocuments() {
  const [docs, setDocs] = useState<DocumentFile[] | null>(null)
  const load = async () => {
    const { data, error } = await requireSupabase().from('documents').select('*').order('updated_at', { ascending: false })
    if (error) toast.error(error.message)
    setDocs((data ?? []) as DocumentFile[])
  }
  useEffect(() => {
    void load()
  }, [])
  return { docs, load }
}

async function storeDocument(kind: DocumentKind, file: File, existing: DocumentFile | undefined, title: string) {
  const err = validateFile(file, kind === 'other' ? 'any' : 'pdf')
  if (err) throw new Error(err)
  const { path, url } = await uploadFile('documents', kind === 'other' ? 'files' : 'cv', file)
  const row = { kind, title, file_path: path, file_url: url, file_name: file.name, file_size: file.size, is_visible: existing?.is_visible ?? true }
  const sb = requireSupabase()
  const { error } = existing ? await sb.from('documents').update(row).eq('id', existing.id) : await sb.from('documents').insert(row)
  if (error) {
    await removeFile('documents', path)
    throw error
  }
  if (existing?.file_path) await removeFile('documents', existing.file_path) // replaced → remove old object
}

function CvCard({ kind, doc, onChange }: { kind: 'cv_en' | 'cv_de'; doc?: DocumentFile; onChange: () => void }) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const confirm = useConfirm()
  const label = kind === 'cv_en' ? 'English CV' : 'German CV (Lebenslauf)'

  const upload = async (file?: File) => {
    if (!file) return
    setBusy(true)
    try {
      await storeDocument(kind, file, doc, label)
      toast.success(`${label} ${doc ? 'replaced' : 'uploaded'}`)
      onChange()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  const remove = async () => {
    if (!doc || !(await confirm({ title: `Remove the ${label}?`, description: 'The download button disappears from the site.' }))) return
    const { error } = await requireSupabase().from('documents').delete().eq('id', doc.id)
    if (error) return toast.error(error.message)
    await removeFile('documents', doc.file_path)
    toast.success('Removed')
    onChange()
  }

  const toggle = async () => {
    if (!doc) return
    const { error } = await requireSupabase().from('documents').update({ is_visible: !doc.is_visible }).eq('id', doc.id)
    if (error) toast.error(error.message)
    onChange()
  }

  return (
    <div
      className="rounded-2xl border border-line bg-white/[0.015] p-5"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        void upload(e.dataTransfer.files[0])
      }}
    >
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-accent/25 bg-accent/[0.06] font-mono text-xs font-semibold text-accent">{kind === 'cv_en' ? 'EN' : 'DE'}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-white">{label}</h3>
          {doc ? (
            <p className="mt-0.5 truncate text-xs text-muted">
              {doc.file_name} · {formatBytes(doc.file_size)} · updated {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : ''}
              {!doc.is_visible && <span className="ml-1 text-amber-300">· hidden</span>}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-dim">Not uploaded: the button is hidden on the site.</p>
          )}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? <Spinner /> : <Upload className="h-3.5 w-3.5" />} {doc ? 'Replace PDF' : 'Upload PDF'}
        </Button>
        {doc && (
          <>
            <a href={doc.file_url} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-strong px-3 text-xs text-fg hover:border-accent/50">
              <Download className="h-3.5 w-3.5" /> Preview
            </a>
            <Button size="sm" variant="ghost" onClick={toggle}>
              {doc.is_visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {doc.is_visible ? 'Hide' : 'Show'}
            </Button>
            <Button size="sm" variant="ghost" onClick={remove}>
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </Button>
          </>
        )}
      </div>
      <input ref={input} type="file" accept="application/pdf" hidden onChange={(e) => upload(e.target.files?.[0])} />
    </div>
  )
}

export default function DocumentsPage() {
  const { docs, load } = useDocuments()
  const confirm = useConfirm()
  const input = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)

  if (!docs)
    return (
      <div className="flex justify-center py-24 text-muted">
        <Spinner className="h-5 w-5" />
      </div>
    )

  const others = docs.filter((d) => d.kind === 'other')

  const uploadOther = async (file?: File) => {
    if (!file) return
    setBusy(true)
    try {
      await storeDocument('other', file, undefined, title.trim() || file.name)
      setTitle('')
      toast.success('Uploaded')
      void load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  const removeOther = async (d: DocumentFile) => {
    if (!(await confirm({ title: `Delete “${d.title}”?` }))) return
    const { error } = await requireSupabase().from('documents').delete().eq('id', d.id)
    if (error) return toast.error(error.message)
    await removeFile('documents', d.file_path)
    void load()
  }

  return (
    <div className="space-y-8">
      <PageHeader title="CV & documents" description="Upload, replace or remove your CV PDFs. Visitors get a Download CV button (with an EN/DE choice when both exist)." />
      <div className="grid gap-4 md:grid-cols-2">
        <CvCard kind="cv_en" doc={docs.find((d) => d.kind === 'cv_en')} onChange={load} />
        <CvCard kind="cv_de" doc={docs.find((d) => d.kind === 'cv_de')} onChange={load} />
      </div>

      <Panel title="Other documents" description="Reference letters, certificates, etc. Get a shareable public link for each.">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" />
          <Button variant="outline" onClick={() => input.current?.click()} disabled={busy}>
            {busy ? <Spinner /> : <Upload className="h-4 w-4" />} Upload file
          </Button>
          <input ref={input} type="file" accept="application/pdf,image/*" hidden onChange={(e) => uploadOther(e.target.files?.[0])} />
        </div>
        {others.length === 0 ? (
          <EmptyState title="No other documents" />
        ) : (
          <ul className="divide-y divide-line">
            {others.map((d) => (
              <li key={d.id} className="flex items-center gap-3 py-3">
                <FileText className="h-4 w-4 shrink-0 text-accent" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-fg">{d.title}</p>
                  <p className="truncate text-xs text-dim">
                    {d.file_name} · {formatBytes(d.file_size)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    void navigator.clipboard.writeText(d.file_url)
                    toast.success('Link copied')
                  }}
                >
                  Copy link
                </Button>
                <Button size="icon" variant="ghost" onClick={() => removeOther(d)} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
