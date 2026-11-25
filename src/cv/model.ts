import type { PortfolioData } from '@/types/content'
import { dictFor, intlLocale, localizePath, type Dict, type Locale } from '@/i18n'
import { siteUrl } from '@/seo/head'
import { dateRange, safeUrl } from '@/lib/utils'
import { socialHref } from '@/components/ui/BrandIcons'

export interface CvItem {
  label: string
  value: string
  href?: string
}

export interface CvModel {
  locale: Locale
  /** Interface text incl. admin overrides. */
  t: Dict
  name: string
  title: string
  summary: string
  photo: string | null
  initials: string
  contact: CvItem[]
  personal: CvItem[]
  experience: {
    id: string
    title: string
    company: string
    meta: string
    period: string
    description: string
    bullets: string[]
    tech: string[]
  }[]
  projects: { id: string; title: string; category: string; summary: string; tech: string[]; url: string }[]
  skills: { group: string; items: string[] }[]
  education: { id: string; title: string; institution: string; period: string; description: string }[]
  motherTongue: string
  languages: { name: string; level: string; skills: [string, string, string, string, string] | null }[]
  interests: string[]
  portfolioUrl: string
  place: string
  showQr: boolean
}

/** "https://github.com/SheikhArbab/" → "github.com/SheikhArbab" */
const pretty = (url: string) => url.replace(/^mailto:/, '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '')

/** Everything the CV templates render, from the (already localized) portfolio data. Invents nothing. */
export function buildCv(data: PortfolioData, locale: Locale): CvModel {
  const t = dictFor(data, locale)
  const { profile } = data
  const cv = profile.cv
  const base = siteUrl(data)
  const portfolioUrl = `${base}${localizePath('/', locale)}`
  const intl = intlLocale(locale)

  const contact: CvItem[] = []
  if (profile.email) contact.push({ label: t.cv.email, value: profile.email, href: `mailto:${profile.email}` })
  if (cv.phone) contact.push({ label: t.cv.phone, value: cv.phone, href: `tel:${cv.phone.replace(/[^\d+]/g, '')}` })
  const location = cv.address || profile.location
  if (location) contact.push({ label: t.cv.location, value: location })
  contact.push({ label: t.cv.portfolio, value: pretty(portfolioUrl), href: portfolioUrl })
  for (const s of profile.socials) {
    // The CV links this portfolio itself; other "portfolio" links would read as duplicates.
    if (!s.visible || s.platform === 'email' || s.platform === 'whatsapp' || s.platform === 'portfolio') continue
    const href = safeUrl(socialHref(s.platform, s.url))
    if (!href || pretty(href) === pretty(base)) continue
    contact.push({ label: s.label, value: pretty(href), href })
  }

  const personal: CvItem[] = [
    { label: t.cv.birth, value: cv.birth_date },
    { label: t.cv.nationality, value: cv.nationality },
    { label: t.cv.licence, value: cv.driving_licence },
  ].filter((p) => p.value.trim())

  const experience = data.experiences.map((e) => ({
    id: e.id,
    title: e.title,
    company: e.company,
    meta: [t.experience.employment[e.employment_type] ?? e.employment_type, e.location].filter(Boolean).join(' · '),
    period: dateRange(e.start_date, e.end_date, e.is_current, intl, t.common.present, t.common.until),
    description: e.description,
    bullets: [...e.responsibilities, ...e.achievements].filter((b) => b.trim()),
    tech: e.technologies,
  }))

  const projects = [...data.projects]
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order)
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      summary: p.short_description,
      tech: p.technologies.slice(0, 6),
      url: `${base}${localizePath(`/projects/${p.slug}`, locale)}`,
    }))

  const skills = [
    ...data.categories.map((c) => ({ group: c.name, items: data.skills.filter((s) => s.category_id === c.id).map((s) => s.name) })),
    { group: t.skills.other, items: data.skills.filter((s) => !s.category_id).map((s) => s.name) },
  ].filter((g) => g.items.length)

  const education = data.education.map((e) => ({ id: e.id, title: e.title, institution: e.institution, period: e.date_label, description: e.description }))

  // Languages entered in the admin win; otherwise German comes from the "Deutsch lernen" profile section.
  const languages: CvModel['languages'] = cv.languages
    .filter((l) => l.name.trim())
    .map((l) => {
      const per = [l.listening, l.reading, l.spoken_interaction, l.spoken_production, l.writing].map((v) => (v ?? '').trim())
      return { name: l.name, level: l.level, skills: per.some(Boolean) ? (per as [string, string, string, string, string]) : null }
    })
  if (!languages.length && profile.german.enabled && profile.german.level) {
    languages.push({ name: t.cv.german, level: t.cv.germanLevel(profile.german.level, profile.german.goal), skills: null })
  }

  const initials = profile.full_name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return {
    locale,
    t,
    name: profile.full_name,
    title: profile.title,
    summary: cv.summary || profile.about_lead || profile.hero_description,
    photo: cv.show_photo ? (profile.avatar_url ?? null) : null,
    initials,
    contact,
    personal,
    experience,
    projects,
    skills,
    education,
    languages,
    motherTongue: (cv.mother_tongue ?? '').trim(),
    interests: cv.interests.filter((i) => i.trim()),
    portfolioUrl,
    place: (cv.address || profile.location).split(',')[0].trim(),
    showQr: cv.show_qr,
  }
}
