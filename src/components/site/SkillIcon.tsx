import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Skill } from '@/types/content'

/** Uploaded icon → Simple Icons slug (CDN) → monogram fallback. */
export function SkillIcon({ skill, className }: { skill: Pick<Skill, 'name' | 'icon' | 'icon_url'>; className?: string }) {
  const [failed, setFailed] = useState(false)
  const src = skill.icon_url || (skill.icon ? `https://cdn.simpleicons.org/${encodeURIComponent(skill.icon)}/c9d3cf` : null)
  if (!src || failed) {
    const mono = skill.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2)
    return (
      <span aria-hidden className={cn('grid place-items-center rounded-md bg-white/[0.06] font-mono text-[0.6rem] font-semibold text-muted uppercase', className)}>
        {mono}
      </span>
    )
  }
  return <img src={src} alt="" aria-hidden loading="lazy" decoding="async" onError={() => setFailed(true)} className={cn('object-contain', className)} />
}

const LEVELS = { beginner: 1, intermediate: 2, advanced: 3 } as const

export function ProficiencyMeter({ skill }: { skill: Pick<Skill, 'proficiency' | 'proficiency_label'> }) {
  if (skill.proficiency === 'hidden') return null
  if (skill.proficiency === 'custom')
    return skill.proficiency_label ? <span className="font-mono text-[0.62rem] text-accent-2">{skill.proficiency_label}</span> : null
  const n = LEVELS[skill.proficiency]
  return (
    <span className="inline-flex items-center gap-1.5" title={skill.proficiency}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span key={i} className={cn('h-1 w-3 rounded-full', i <= n ? 'bg-accent' : 'bg-white/10')} />
        ))}
      </span>
      <span className="sr-only">{skill.proficiency}</span>
    </span>
  )
}
