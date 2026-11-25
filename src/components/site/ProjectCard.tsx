import { Link } from 'react-router-dom'
import { ArrowUpRight, FolderGit2 } from 'lucide-react'
import { cn, liveLinkLabel, safeUrl } from '@/lib/utils'
import { Tag } from '@/components/ui/Tag'
import { GithubIcon } from '@/components/ui/BrandIcons'
import type { Project } from '@/types/content'

/** Generated cover for projects that don't have a screenshot yet. */
function ProjectCover({ project }: { project: Project }) {
  const initials = project.title
    .split(/\s+/)
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
  return (
    <div aria-hidden className="bg-grid-fine relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute top-1/4 right-1/4 h-2/3 w-2/3 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute -bottom-1/3 -left-1/4 h-2/3 w-2/3 rounded-full bg-accent-2/10 blur-3xl" />
      <div className="absolute inset-6 rounded-xl border border-line" />
      <span className="absolute top-9 left-9 font-mono text-[0.62rem] tracking-[0.2em] text-dim uppercase">{project.category || 'project'}</span>
      <span className="absolute top-9 right-9 flex gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-accent/70" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
      </span>
      <span className="relative font-mono text-6xl font-semibold tracking-tighter text-white/85 md:text-7xl">
        {initials || <FolderGit2 className="h-10 w-10 text-dim" />}
        <span className="text-accent">_</span>
      </span>
      <span className="absolute bottom-9 left-9 max-w-[70%] truncate font-mono text-[0.65rem] text-muted">~/projects/{project.slug}</span>
    </div>
  )
}

export function ProjectThumb({ project, className, eager }: { project: Project; className?: string; eager?: boolean }) {
  return (
    <div className={cn('relative overflow-hidden bg-elev', className)}>
      {project.thumbnail_url ? (
        <img
          src={project.thumbnail_url}
          alt={`${project.title} screenshot`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-cover object-top transition duration-700 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <ProjectCover project={project} />
      )}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-transparent opacity-90" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="h-1/2 w-full animate-scan bg-gradient-to-b from-transparent via-accent/10 to-transparent" />
      </div>
    </div>
  )
}

export function ProjectLinks({ project, compact }: { project: Project; compact?: boolean }) {
  const live = safeUrl(project.live_url)
  const repo = safeUrl(project.repo_url)
  return (
    <div className="relative z-10 flex items-center gap-2">
      {live && (
        <a
          href={live}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent/[0.07] px-2.5 py-1.5 font-mono text-[0.7rem] text-accent transition-colors hover:bg-accent/15"
          aria-label={`${liveLinkLabel(live)}: ${project.title}`}
        >
          {liveLinkLabel(live).replace('View on ', '').replace('Live demo', 'live').toLowerCase()} <ArrowUpRight className="h-3 w-3" />
        </a>
      )}
      {repo && (
        <a
          href={repo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-line-strong px-2.5 py-1.5 font-mono text-[0.7rem] text-muted transition-colors hover:border-fg/40 hover:text-fg"
          aria-label={`Source code of ${project.title}`}
        >
          <GithubIcon className="h-3 w-3" /> {!compact && 'code'}
        </a>
      )}
    </div>
  )
}

interface CardProps {
  project: Project
  index: number
  large?: boolean
  horizontal?: boolean
  /** Show live/code buttons on the card (admin setting “project links”). */
  showLinks?: boolean
}

export function ProjectCard({ project, index, large, horizontal, showLinks = false }: CardProps) {
  return (
    <article
      className={cn(
        horizontal && 'lg:flex-row',
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white/[0.015] transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_24px_60px_-30px_color-mix(in_oklab,var(--accent)_35%,transparent)]',
      )}
    >
      <ProjectThumb
        project={project}
        className={cn(
          'aspect-[16/10]',
          large && 'aspect-[16/9] lg:aspect-auto lg:min-h-[300px] lg:flex-1',
          horizontal && 'lg:aspect-auto lg:min-h-[320px] lg:w-[55%] lg:shrink-0',
        )}
      />
      <div className={cn('relative flex flex-col p-5 md:p-6', large ? 'flex-none' : 'flex-1', horizontal && 'lg:justify-center lg:p-8')}>
        <div className="mb-3 flex items-center justify-between gap-3 font-mono text-[0.65rem] tracking-wider text-dim uppercase">
          <span>
            <span className="text-accent">{String(index + 1).padStart(2, '0')}</span> · {project.category || 'project'}
          </span>
          {project.status && <span className="text-accent-2">{project.status}</span>}
        </div>
        <h3 className={cn('font-semibold tracking-tight text-white', large || horizontal ? 'text-2xl md:text-3xl' : 'text-xl')}>
          {/* Stretched link: whole card opens the case study */}
          <Link to={`/projects/${project.slug}`} className="after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-accent">
            {project.title}
          </Link>
        </h3>
        <p className={cn('mt-2 leading-relaxed text-muted', large || horizontal ? 'text-base' : 'line-clamp-3 text-sm')}>{project.short_description}</p>
        {project.technologies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.technologies.slice(0, large ? 8 : 5).map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        )}
        <div className={cn('flex items-center justify-between gap-3 pt-6', !horizontal && 'mt-auto')}>
          {showLinks ? <ProjectLinks project={project} /> : <span />}
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/[0.06] px-3 py-1.5 font-mono text-[0.7rem] text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-black">
            read case study <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </article>
  )
}
