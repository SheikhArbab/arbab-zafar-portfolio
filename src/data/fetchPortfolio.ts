import { restSelect } from '@/lib/rest'
import { defaultData } from '@/content/defaults'
import type { DocumentFile, Education, Experience, PortfolioData, Profile, Project, SiteSettings, Skill, SkillCategory } from '@/types/content'

const bySort = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order

/** Merge DB singleton rows with defaults so newly added fields always have a value. */
export function mergeProfile(row: Partial<Profile> | null | undefined): Profile {
  const d = defaultData.profile
  if (!row) return d
  return { ...d, ...stripNulls(row), german: { ...d.german, ...(row.german ?? {}) } } as Profile
}

export function mergeSettings(row: Partial<SiteSettings> | null | undefined): SiteSettings {
  const d = defaultData.settings
  if (!row) return d
  const content = { ...d.content } as Record<string, unknown>
  for (const [k, v] of Object.entries(row.content ?? {})) {
    content[k] = typeof v === 'object' && v ? { ...(content[k] as object), ...v } : v
  }
  return {
    ...d,
    ...stripNulls(row),
    sections: { ...d.sections, ...(row.sections ?? {}) },
    content: content as unknown as SiteSettings['content'],
  } as SiteSettings
}

function stripNulls<T extends object>(row: T): Partial<T> {
  const out: Partial<T> = {}
  for (const [k, v] of Object.entries(row)) {
    // keep explicit nulls for nullable media fields
    if (v !== undefined && (v !== null || /_url$/.test(k))) (out as Record<string, unknown>)[k] = v
  }
  return out
}

/**
 * Fetch every piece of PUBLIC portfolio content (anon role → RLS returns published rows only).
 * Filters are also applied explicitly as defence in depth.
 */
export async function fetchPortfolio(): Promise<PortfolioData> {
  const vis = { is_visible: 'eq.true', order: 'sort_order.asc', select: '*' }
  const [profile, settings, experiences, categories, skills, projects, education, documents] = await Promise.all([
    restSelect<Profile>('profile', { id: 'eq.1', select: '*' }),
    restSelect<SiteSettings>('site_settings', { id: 'eq.1', select: '*' }),
    restSelect<Experience>('experiences', vis),
    restSelect<SkillCategory>('skill_categories', vis),
    restSelect<Skill>('skills', vis),
    restSelect<Project>('projects', { is_published: 'eq.true', order: 'sort_order.asc', select: '*,project_images(*)' }),
    restSelect<Education>('education', vis),
    restSelect<DocumentFile>('documents', { is_visible: 'eq.true', select: '*' }),
  ])

  const visibleCats = new Set(categories.map((c) => c.id))

  return {
    profile: mergeProfile(profile[0]),
    settings: mergeSettings(settings[0]),
    experiences,
    categories,
    skills: skills.filter((s) => !s.category_id || visibleCats.has(s.category_id)),
    // role/outcome default to '' if migration 0004 hasn't been applied yet
    projects: projects.map((p) => ({ ...p, role: p.role ?? '', outcome: p.outcome ?? '', project_images: (p.project_images ?? []).sort(bySort) })),
    education,
    documents,
  }
}
