import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Briefcase, Cpu, FolderGit2, Inbox, Rocket, ShieldCheck, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { requireSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { PageHeader, Panel } from '../components/PageHeader'
import { triggerRebuild } from '../lib/rebuild'
import type { ContactMessage } from '@/types/content'

interface Stats {
  projects: number
  published: number
  skills: number
  experiences: number
  messages: number
  unread: number
  maintenance: boolean
  available: boolean
  lastUpdated: { table: string; at: string } | null
  cvs: string[]
  recent: ContactMessage[]
}

const TABLES = ['profile', 'site_settings', 'experiences', 'projects', 'skills', 'skill_categories', 'education', 'documents'] as const

const ago = (iso: string) => {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  return new Date(iso).toLocaleDateString()
}

export default function Overview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    const sb = requireSupabase()
    const count = (t: string, f?: [string, unknown]) => {
      let q = sb.from(t).select('id', { count: 'exact', head: true })
      if (f) q = q.eq(f[0], f[1])
      return q.then((r) => r.count ?? 0)
    }
    void (async () => {
      const [projects, published, skills, experiences, messages, unread, settings, profile, docs, recent, ...latest] = await Promise.all([
        count('projects'),
        count('projects', ['is_published', true]),
        count('skills'),
        count('experiences'),
        count('contact_messages'),
        count('contact_messages', ['status', 'unread']),
        sb.from('site_settings').select('maintenance_mode').eq('id', 1).maybeSingle(),
        sb.from('profile').select('is_available').eq('id', 1).maybeSingle(),
        sb.from('documents').select('kind').in('kind', ['cv_en', 'cv_de']),
        sb.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(4),
        ...TABLES.map((t) => sb.from(t).select('updated_at').order('updated_at', { ascending: false }).limit(1).maybeSingle()),
      ])
      const lastUpdated = latest
        .map((r, i) => ({ table: TABLES[i], at: (r.data as { updated_at?: string } | null)?.updated_at ?? '' }))
        .filter((x) => x.at)
        .sort((a, b) => b.at.localeCompare(a.at))[0] ?? null
      setStats({
        projects,
        published,
        skills,
        experiences,
        messages,
        unread,
        maintenance: Boolean(settings.data?.maintenance_mode),
        available: Boolean(profile.data?.is_available),
        lastUpdated,
        cvs: (docs.data ?? []).map((d) => d.kind),
        recent: (recent.data ?? []) as ContactMessage[],
      })
    })()
  }, [])

  const publish = async () => {
    setPublishing(true)
    try {
      await triggerRebuild()
      toast.success('Rebuild triggered. SEO pages & sitemap will refresh in ~1–2 minutes.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Rebuild failed')
    } finally {
      setPublishing(false)
    }
  }

  if (!stats)
    return (
      <div className="flex justify-center py-24 text-muted">
        <Spinner className="h-5 w-5" />
      </div>
    )

  const cards = [
    { label: 'Projects', value: stats.projects, sub: `${stats.published} published`, to: '/admin/projects', Icon: FolderGit2 },
    { label: 'Skills', value: stats.skills, sub: 'across categories', to: '/admin/skills', Icon: Cpu },
    { label: 'Experience', value: stats.experiences, sub: 'timeline entries', to: '/admin/experience', Icon: Briefcase },
    { label: 'Messages', value: stats.messages, sub: `${stats.unread} unread`, to: '/admin/messages', Icon: Inbox },
  ]

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Live numbers from your database. Content edits go live instantly; publish to refresh prerendered SEO pages."
        actions={
          <Button onClick={publish} disabled={publishing}>
            {publishing ? <Spinner /> : <Rocket className="h-4 w-4" />} Publish SEO build
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({ label, value, sub, to, Icon }) => (
          <Link key={label} to={to} className="group rounded-2xl border border-line bg-white/[0.015] p-5 transition-colors hover:border-accent/30">
            <div className="flex items-center justify-between text-muted">
              <span className="font-mono text-[0.65rem] tracking-widest uppercase">{label}</span>
              <Icon className="h-4 w-4 group-hover:text-accent" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
            <p className="mt-1 text-xs text-dim">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Panel title="System status">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted">
                <ShieldCheck className="h-4 w-4" /> Portfolio visibility
              </span>
              {stats.maintenance ? <span className="font-mono text-xs text-amber-300">maintenance mode</span> : <span className="font-mono text-xs text-accent">● public</span>}
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted">
                <Wrench className="h-4 w-4" /> Availability badge
              </span>
              <span className={`font-mono text-xs ${stats.available ? 'text-accent' : 'text-dim'}`}>{stats.available ? 'open to work' : 'hidden'}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted">CV files</span>
              <span className="font-mono text-xs text-fg">
                EN {stats.cvs.includes('cv_en') ? '✓' : '—'} · DE {stats.cvs.includes('cv_de') ? '✓' : '—'}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted">Last updated</span>
              <span className="font-mono text-xs text-fg">{stats.lastUpdated ? `${stats.lastUpdated.table} · ${ago(stats.lastUpdated.at)}` : 'never'}</span>
            </li>
          </ul>
        </Panel>

        <Panel
          title="Recent messages"
          actions={
            <Link to="/admin/messages" className="inline-flex items-center gap-1 font-mono text-xs text-accent hover:underline">
              inbox <ArrowUpRight className="h-3 w-3" />
            </Link>
          }
        >
          {stats.recent.length === 0 ? (
            <p className="text-sm text-dim">No messages yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {stats.recent.map((m) => (
                <li key={m.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${m.status === 'unread' ? 'bg-accent' : 'bg-white/15'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-fg">
                      {m.name} <span className="text-dim">· {m.subject}</span>
                    </p>
                    <p className="truncate text-xs text-muted">{m.message}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[0.65rem] text-dim">{ago(m.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}
