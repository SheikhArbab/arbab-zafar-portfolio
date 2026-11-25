import type { PortfolioData, Project } from '@/types/content'
import { dict, localizePath, type Locale } from '@/i18n'

export interface HeadData {
  title: string
  description: string
  canonical: string
  image: string | null
  type: 'website' | 'article' | 'profile'
  keywords: string[]
  robots: string
  siteName: string
  twitter: string
  favicon: string | null
  jsonLd: Record<string, unknown>[]
  locale: Locale
  /** hreflang alternates (en, de, x-default) */
  alternates: { hreflang: string; href: string }[]
}

/** Language versions of one page, for <link rel="alternate" hreflang>. */
function alternatesFor(base: string, path: string) {
  return [
    { hreflang: 'en', href: `${base}${localizePath(path, 'en')}` },
    { hreflang: 'de', href: `${base}${localizePath(path, 'de')}` },
    { hreflang: 'x-default', href: `${base}${localizePath(path, 'en')}` },
  ]
}

const trimSlash = (u: string) => u.replace(/\/+$/, '')

export function siteUrl(data: PortfolioData) {
  const build = (import.meta.env.VITE_SITE_URL as string | undefined) || ''
  return trimSlash(build || data.settings.site_url || 'https://arbab-zafar.netlify.app')
}

function absolute(base: string, url: string | null | undefined) {
  if (!url) return null
  if (/^https?:/i.test(url)) return url
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

function personSchema(data: PortfolioData) {
  const base = siteUrl(data)
  const { profile, experiences, skills } = data
  const current = experiences.find((e) => e.is_current)
  const sameAs = profile.socials
    .filter((s) => s.visible && /^https?:/i.test(s.url) && s.platform !== 'portfolio')
    .map((s) => s.url)
  return {
    '@type': 'Person',
    '@id': `${base}/#person`,
    name: profile.full_name,
    url: base,
    jobTitle: current?.title || profile.title,
    description: profile.hero_description,
    image: absolute(base, profile.avatar_url) ?? undefined,
    email: profile.email ? `mailto:${profile.email}` : undefined,
    address: { '@type': 'PostalAddress', addressCountry: profile.location },
    worksFor: current ? { '@type': 'Organization', name: current.company } : undefined,
    knowsAbout: skills.slice(0, 24).map((s) => s.name),
    knowsLanguage: ['en', 'ur', 'de'],
    sameAs,
  }
}

export function homeHead(data: PortfolioData, locale: Locale = 'en'): HeadData {
  const { settings, profile } = data
  const base = siteUrl(data)
  return {
    title: settings.seo_title || `${profile.full_name}: ${profile.title}`,
    description: settings.seo_description || profile.hero_description,
    canonical: `${base}${localizePath('/', locale)}`,
    locale,
    alternates: alternatesFor(base, '/'),
    image: absolute(base, settings.og_image_url || profile.avatar_url || '/og-default.png'),
    type: 'profile',
    keywords: settings.seo_keywords,
    robots: settings.robots_index ? 'index, follow, max-image-preview:large' : 'noindex, nofollow',
    siteName: settings.site_name,
    twitter: settings.twitter_handle,
    favicon: settings.favicon_url,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${base}/#website`,
            url: base,
            name: settings.site_name,
            inLanguage: locale,
            publisher: { '@id': `${base}/#person` },
          },
          {
            '@type': 'ProfilePage',
            '@id': `${base}/#profile`,
            url: `${base}/`,
            name: settings.seo_title,
            isPartOf: { '@id': `${base}/#website` },
            mainEntity: { '@id': `${base}/#person` },
          },
          personSchema(data),
          {
            '@type': 'ItemList',
            name: 'Projects',
            itemListElement: data.projects.map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `${base}/projects/${p.slug}`,
              name: p.title,
            })),
          },
        ],
      },
    ],
  }
}

export function projectHead(data: PortfolioData, project: Project, locale: Locale = 'en'): HeadData {
  const base = siteUrl(data)
  const home = homeHead(data, locale)
  const url = `${base}${localizePath(`/projects/${project.slug}`, locale)}`
  const description = project.seo_description || project.short_description || home.description
  return {
    ...home,
    title: project.seo_title || `${project.title}: ${dict(locale).seo.caseStudy} · ${data.profile.full_name}`,
    description,
    canonical: url,
    alternates: alternatesFor(base, `/projects/${project.slug}`),
    image: absolute(base, project.thumbnail_url) ?? home.image,
    type: 'article',
    keywords: [...project.technologies, data.profile.full_name],
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CreativeWork',
            '@id': `${url}#project`,
            name: project.title,
            headline: project.title,
            description,
            url,
            image: absolute(base, project.thumbnail_url) ?? undefined,
            keywords: project.technologies.join(', '),
            genre: project.category,
            dateCreated: project.started_on ?? undefined,
            datePublished: project.completed_on ?? undefined,
            author: { '@id': `${base}/#person` },
            sameAs: [project.live_url, project.repo_url].filter((u) => /^https?:/i.test(u)),
          },
          personSchema(data),
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
              { '@type': 'ListItem', position: 2, name: 'Projects', item: `${base}/#projects` },
              { '@type': 'ListItem', position: 3, name: project.title, item: url },
            ],
          },
        ],
      },
    ],
  }
}

export function playgroundHead(data: PortfolioData, locale: Locale = 'en'): HeadData {
  const base = siteUrl(data)
  const home = homeHead(data, locale)
  const t = dict(locale)
  const name = data.profile.full_name
  const games = (['typing', 'bugs', 'memory'] as const).map((k) => [t.playground.games[k].name, t.playground.games[k].blurb])
  return {
    ...home,
    title: t.seo.playgroundTitle(name),
    description: t.seo.playgroundDesc(name),
    canonical: `${base}${localizePath('/playground', locale)}`,
    alternates: alternatesFor(base, '/playground'),
    type: 'website',
    keywords: ['browser games', 'React games', 'typing game', name],
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': `${base}/playground#page`,
            url: `${base}${localizePath('/playground', locale)}`,
            name: 'Playground',
            inLanguage: locale,
            isPartOf: { '@id': `${base}/#website` },
            hasPart: games.map(([n, d]) => ({
              '@type': 'VideoGame',
              name: n,
              description: d,
              gamePlatform: 'Web browser',
              applicationCategory: 'Game',
              author: { '@id': `${base}/#person` },
            })),
          },
          personSchema(data),
        ],
      },
    ],
  }
}

export function cvHead(data: PortfolioData, locale: Locale = 'en'): HeadData {
  const base = siteUrl(data)
  const home = homeHead(data, locale)
  const t = dict(locale).cv
  const name = data.profile.full_name
  return {
    ...home,
    title: t.pageTitle(name),
    description: t.pageDesc(name),
    canonical: `${base}${localizePath('/cv', locale)}`,
    alternates: alternatesFor(base, '/cv'),
    type: 'profile',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        url: `${base}${localizePath('/cv', locale)}`,
        name: t.pageTitle(name),
        inLanguage: locale,
        mainEntity: { '@type': 'Person', name, jobTitle: data.profile.title, url: `${base}${localizePath('/', locale)}` },
      },
    ],
  }
}

export function maintenanceHead(data: PortfolioData, locale: Locale = 'en'): HeadData {
  return {
    ...homeHead(data, locale),
    title: `${dict(locale).maintenance.title} · ${data.settings.site_name}`,
    description: data.settings.maintenance_message,
    robots: 'noindex',
    alternates: [],
    jsonLd: [],
  }
}

export function notFoundHead(data: PortfolioData, locale: Locale = 'en'): HeadData {
  return { ...homeHead(data, locale), title: `${dict(locale).seo.notFound} · ${data.settings.site_name}`, robots: 'noindex', canonical: '', alternates: [], jsonLd: [] }
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const ld = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c')

/** Serialize head tags for the build-time prerenderer. */
const OG_LOCALE: Record<Locale, string> = { en: 'en_GB', de: 'de_DE' }

export function renderHeadTags(h: HeadData): string {
  const tags = [
    `<title>${esc(h.title)}</title>`,
    `<meta name="description" content="${esc(h.description)}" />`,
    h.keywords.length ? `<meta name="keywords" content="${esc(h.keywords.join(', '))}" />` : '',
    `<meta name="robots" content="${esc(h.robots)}" />`,
    h.canonical ? `<link rel="canonical" href="${esc(h.canonical)}" />` : '',
    ...h.alternates.map((a) => `<link rel="alternate" hreflang="${esc(a.hreflang)}" href="${esc(a.href)}" />`),
    `<meta property="og:locale" content="${OG_LOCALE[h.locale]}" />`,
    `<meta property="og:locale:alternate" content="${OG_LOCALE[h.locale === 'de' ? 'en' : 'de']}" />`,
    `<meta property="og:type" content="${h.type === 'article' ? 'article' : h.type}" />`,
    `<meta property="og:site_name" content="${esc(h.siteName)}" />`,
    `<meta property="og:title" content="${esc(h.title)}" />`,
    `<meta property="og:description" content="${esc(h.description)}" />`,
    `<meta property="og:url" content="${esc(h.canonical)}" />`,
    h.image ? `<meta property="og:image" content="${esc(h.image)}" />` : '',
    `<meta name="twitter:card" content="${h.image ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${esc(h.title)}" />`,
    `<meta name="twitter:description" content="${esc(h.description)}" />`,
    h.image ? `<meta name="twitter:image" content="${esc(h.image)}" />` : '',
    h.twitter ? `<meta name="twitter:site" content="${esc(h.twitter)}" />` : '',
    h.favicon ? `<link rel="icon" href="${esc(h.favicon)}" />` : '',
    ...h.jsonLd.map((o) => `<script type="application/ld+json">${ld(o)}</script>`),
  ]
  return tags.filter(Boolean).join('\n    ')
}

/** Client-side head management (keeps tags in sync on SPA navigation). */
export function applyHead(h: HeadData) {
  if (typeof document === 'undefined') return
  document.title = h.title
  const meta = (attr: 'name' | 'property', key: string, content: string | null) => {
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
    if (!content) {
      el?.remove()
      return
    }
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, key)
      document.head.appendChild(el)
    }
    el.content = content
  }
  const link = (rel: string, href: string | null) => {
    let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
    if (!href) {
      el?.remove()
      return
    }
    if (!el) {
      el = document.createElement('link')
      el.rel = rel
      document.head.appendChild(el)
    }
    el.href = href
  }
  meta('name', 'description', h.description)
  meta('name', 'keywords', h.keywords.join(', ') || null)
  meta('name', 'robots', h.robots)
  meta('property', 'og:type', h.type)
  meta('property', 'og:title', h.title)
  meta('property', 'og:description', h.description)
  meta('property', 'og:url', h.canonical)
  meta('property', 'og:site_name', h.siteName)
  meta('property', 'og:image', h.image)
  meta('name', 'twitter:card', h.image ? 'summary_large_image' : 'summary')
  meta('name', 'twitter:title', h.title)
  meta('name', 'twitter:description', h.description)
  meta('name', 'twitter:image', h.image)
  link('canonical', h.canonical)
  meta('property', 'og:locale', OG_LOCALE[h.locale])
  meta('property', 'og:locale:alternate', OG_LOCALE[h.locale === 'de' ? 'en' : 'de'])
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((l) => l.remove())
  for (const a of h.alternates) {
    const l = document.createElement('link')
    l.rel = 'alternate'
    l.hreflang = a.hreflang
    l.href = a.href
    document.head.appendChild(l)
  }
  if (h.favicon) link('icon', h.favicon)
  document.head.querySelectorAll('script[type="application/ld+json"]').forEach((s) => s.remove())
  for (const o of h.jsonLd) {
    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.textContent = JSON.stringify(o)
    document.head.appendChild(s)
  }
}
