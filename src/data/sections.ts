import type { PortfolioData } from '@/types/content'

export interface NavSection {
  id: string
  label: string
}

/** Sections that are enabled in settings AND have content to show. */
export function navSections(data: PortfolioData): NavSection[] {
  const { settings, experiences, skills, education } = data
  const s = settings.sections
  const n = settings.content.nav
  const list: (NavSection | false)[] = [
    { id: 'home', label: n.home },
    s.about && { id: 'about', label: n.about },
    s.experience && experiences.length > 0 && { id: 'experience', label: n.experience },
    s.skills && skills.length > 0 && { id: 'skills', label: n.skills },
    s.projects && { id: 'projects', label: n.projects },
    s.education && education.length > 0 && { id: 'education', label: n.education },
    s.contact && { id: 'contact', label: n.contact },
  ]
  return list.filter(Boolean) as NavSection[]
}
