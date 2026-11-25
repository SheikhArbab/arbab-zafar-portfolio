import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { requireSupabase } from '@/lib/supabase'
import type { Project, ProjectImage } from '@/types/content'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'
import { CollectionManager } from '../components/CollectionManager'
import { PageHeader } from '../components/PageHeader'
import { SortableList } from '../components/SortableList'
import { useConfirm } from '../components/Confirm'
import { removeFile, uploadFile, validateFile } from '../lib/storage'

type P = Project & Record<string, unknown>

function Gallery({ project }: { project: P | null }) {
  const [images, setImages] = useState<ProjectImage[]>([])
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const confirm = useConfirm()

  useEffect(() => {
    if (!project) return
    requireSupabase()
      .from('project_images')
      .select('*')
      .eq('project_id', project.id)
      .order('sort_order')
      .then(({ data }) => setImages((data ?? []) as ProjectImage[]))
  }, [project])

  if (!project)
    return (
      <div className="rounded-xl border border-dashed border-line-strong p-5 text-sm text-dim">
        <p className="mb-1 font-mono text-[0.7rem] tracking-[0.14em] text-muted uppercase">Gallery</p>
        Create the project first, then you can add gallery images.
      </div>
    )

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    const sb = requireSupabase()
    let order = images.length
    for (const file of Array.from(files)) {
      const err = validateFile(file, 'image')
      if (err) {
        toast.error(`${file.name}: ${err}`)
        continue
      }
      try {
        const { url } = await uploadFile('media', `projects/${project.slug || project.id}`, file)
        const { data, error } = await sb.from('project_images').insert({ project_id: project.id, url, alt: '', sort_order: order++ }).select().single()
        if (error) throw error
        setImages((im) => [...im, data as ProjectImage])
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Upload failed')
      }
    }
    setBusy(false)
    if (input.current) input.current.value = ''
  }

  const updateAlt = async (img: ProjectImage, alt: string) => {
    if (alt === img.alt) return
    setImages((im) => im.map((i) => (i.id === img.id ? { ...i, alt } : i)))
    const { error } = await requireSupabase().from('project_images').update({ alt }).eq('id', img.id)
    if (error) toast.error(error.message)
  }

  const remove = async (img: ProjectImage) => {
    if (!(await confirm({ title: 'Remove this image?' }))) return
    const { error } = await requireSupabase().from('project_images').delete().eq('id', img.id)
    if (error) return toast.error(error.message)
    void removeFile('media', img.url)
    setImages((im) => im.filter((i) => i.id !== img.id))
  }

  const reorder = async (next: ProjectImage[]) => {
    setImages(next.map((n, i) => ({ ...n, sort_order: i })))
    await Promise.all(next.map((n, i) => requireSupabase().from('project_images').update({ sort_order: i }).eq('id', n.id)))
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-[0.7rem] tracking-[0.14em] text-muted uppercase">Gallery · {images.length}</p>
        <Button size="sm" variant="outline" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? <Spinner /> : <ImagePlus className="h-3.5 w-3.5" />} Add images
        </Button>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
      </div>
      {images.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line-strong p-5 text-center text-sm text-dim">No gallery images yet.</p>
      ) : (
        <SortableList
          items={images}
          onReorder={reorder}
          render={(img, handle) => (
            <div className="flex items-center gap-3 rounded-xl border border-line p-2">
              {handle}
              <img src={img.url} alt="" className="h-12 w-20 shrink-0 rounded-md object-cover" />
              <Input defaultValue={img.alt} placeholder="Alt text (describe the image)" onBlur={(e) => updateAlt(img, e.target.value)} className="h-9" />
              <Button variant="ghost" size="icon" onClick={() => remove(img)} aria-label="Remove image">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        />
      )}
    </div>
  )
}

const statuses = ['', 'completed', 'in progress', 'maintained', 'prototype', 'archived'].map((v) => ({ value: v, label: v || '— not shown —' }))

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader
        title="Projects"
        description="Each project is a case study page (/projects/<slug>). Star = featured on the homepage (first 5 by order; the first gets the large tile). Eye = published. Drag to reorder."
      />
      <CollectionManager<P>
        table="projects"
        singular="Project"
        select="*, project_images(*)"
        visibilityKey="is_published"
        featuredKey="is_featured"
        searchKeys={['title', 'slug', 'category', 'short_description']}
        title={(r) => r.title}
        subtitle={(r) => [r.category, r.status, r.technologies.slice(0, 4).join(', ')].filter(Boolean).join(' · ')}
        thumb={(r) => r.thumbnail_url}
        toRow={(d) => {
          const { project_images: _omit, ...row } = d
          void _omit
          return row
        }}
        ownedFiles={(r) => [{ bucket: 'media', url: r.thumbnail_url }, ...(r.project_images ?? []).map((i) => ({ bucket: 'media' as const, url: i.url }))]}
        editorExtra={(saved) => <Gallery project={saved} />}
        blank={() => ({
          title: '',
          slug: '',
          short_description: '',
          description: '',
          thumbnail_url: null,
          technologies: [],
          category: 'Web App',
          live_url: '',
          repo_url: '',
          is_featured: false,
          status: '',
          started_on: null,
          completed_on: null,
          role: '',
          challenges: '',
          solutions: '',
          key_features: [],
          outcome: '',
          is_published: false,
          seo_title: '',
          seo_description: '',
        })}
        fields={[
          { name: 'title', label: 'Title', type: 'text', required: true, max: 120 },
          { name: 'slug', label: 'Slug (URL)', type: 'slug', from: 'title', required: true, help: 'Page lives at /projects/<slug>' },
          { name: 'category', label: 'Category', type: 'text', placeholder: 'Web App, Mobile App, Dashboard…', max: 40 },
          { name: 'status', label: 'Status', type: 'select', options: statuses },
          { name: 'short_description', label: 'Short description', type: 'textarea', rows: 2, required: true, max: 280 },
          { name: 'description', label: 'Case study: overview', type: 'textarea', rows: 7, help: 'What it is, who it is for, why it exists. Blank line = new paragraph.', max: 8000 },
          { name: 'role', label: 'Case study: my role', type: 'textarea', rows: 3, help: 'What you personally owned (e.g. frontend architecture, API, deployment).', max: 2000 },
          { name: 'thumbnail_url', label: 'Thumbnail', type: 'image', folder: 'projects' },
          { name: 'technologies', label: 'Technologies', type: 'tags' },
          { name: 'live_url', label: 'Live demo URL', type: 'url' },
          { name: 'repo_url', label: 'Repository URL', type: 'url' },
          { name: 'started_on', label: 'Start date', type: 'date' },
          { name: 'completed_on', label: 'Completion date', type: 'date' },
          { name: 'key_features', label: 'Key features', type: 'lines' },
          { name: 'challenges', label: 'Case study: the challenge', type: 'textarea', rows: 4, max: 4000 },
          { name: 'solutions', label: 'Case study: the solution', type: 'textarea', rows: 4, max: 4000 },
          { name: 'outcome', label: 'Case study: outcome & learnings', type: 'textarea', rows: 3, help: 'Results, impact or what you learned. Only real facts.', max: 4000 },
          { name: 'is_featured', label: 'Featured on homepage', type: 'switch' },
          { name: 'is_published', label: 'Published', type: 'switch' },
          { name: 'seo_title', label: 'SEO title', type: 'text', max: 80, help: 'Defaults to “Title: Project by Name”' },
          { name: 'seo_description', label: 'SEO description', type: 'textarea', rows: 2, max: 300, help: 'Defaults to the short description.' },
        ]}
      />
    </div>
  )
}
