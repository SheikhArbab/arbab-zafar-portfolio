import type { PortfolioData, Project } from '@/types/content'

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
}

const trimSlash = (u: string) => u.replace(/\/+$/, '')

export function siteUrl(data: PortfolioData) {
  const build = (import.meta.env.VITE_SITE_URL as string | undefined) || ''
  return trimSlash(build || data.settings.site_url || 'https://arbab-dev.netlify.app')
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

export function homeHead(data: PortfolioData): HeadData {
  const { settings, profile } = data
  const base = siteUrl(data)
  return {
    title: settings.seo_title || `${profile.full_name}: ${profile.title}`,
    description: settings.seo_description || profile.hero_description,
    canonical: `${base}/`,
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
            inLanguage: 'en',
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

export function projectHead(data: PortfolioData, project: Project): HeadData {
  const base = siteUrl(data)
  const home = homeHead(data)
  const url = `${base}/projects/${project.slug}`
  const description = project.seo_description || project.short_description || home.description
  return {
    ...home,
    title: project.seo_title || `${project.title}: Case Study · ${data.profile.full_name}`,
    description,
    canonical: url,
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

export function playgroundHead(data: PortfolioData): HeadData {
  const base = siteUrl(data)
  const home = homeHead(data)
  const name = data.profile.full_name
  const games = [
    ['Keystroke Sprint', 'A 30-second typing race using real developer commands and code.'],
    ['Bug Hunt', 'A reflex game: squash bugs before they ship, but spare the working features.'],
    ['Stack Match', 'A memory card game built from a full-stack developer\'s tech stack.'],
  ]
  return {
    ...home,
    title: `Playground: Mini Games · ${name}`,
    description: `Three small browser games built by ${name} with React and TypeScript: a code typing sprint, a bug-squashing reflex game and a tech-stack memory match.`,
    canonical: `${base}/playground`,
    type: 'website',
    keywords: ['browser games', 'React games', 'typing game', name],
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': `${base}/playground#page`,
            url: `${base}/playground`,
            name: 'Playground',
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

export function notFoundHead(data: PortfolioData): HeadData {
  return { ...homeHead(data), title: `Page not found · ${data.settings.site_name}`, robots: 'noindex', canonical: '', jsonLd: [] }
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const ld = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c')

/** Serialize head tags for the build-time prerenderer. */
export function renderHeadTags(h: HeadData): string {
  const tags = [
    `<title>${esc(h.title)}</title>`,
    `<meta name="description" content="${esc(h.description)}" />`,
    h.keywords.length ? `<meta name="keywords" content="${esc(h.keywords.join(', '))}" />` : '',
    `<meta name="robots" content="${esc(h.robots)}" />`,
    h.canonical ? `<link rel="canonical" href="${esc(h.canonical)}" />` : '',
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
  if (h.favicon) link('icon', h.favicon)
  document.head.querySelectorAll('script[type="application/ld+json"]').forEach((s) => s.remove())
  for (const o of h.jsonLd) {
    const s = document.createElement('script')
    s.type = 'application/ld+json'
    s.textContent = JSON.stringify(o)
    document.head.appendChild(s)
  }
}
