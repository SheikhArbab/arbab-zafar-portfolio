/**
 * Build-time prerendering for SEO.
 *  1. Imports the SSR bundle (dist-ssr/entry-server.js)
 *  2. Fetches published content from Supabase (falls back to bundled defaults)
 *  3. Writes fully rendered HTML + per-page <head> (title, meta, OG, canonical, JSON-LD)
 *     for "/" and every "/projects/:slug", in English and German ("/de", "/de/projects/:slug")
 *  4. Writes spa.html (shell for /admin and anything not prerendered), sitemap.xml, robots.txt
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const ssrEntry = join(root, 'dist-ssr', 'entry-server.js')

type Data = import('../src/types/content.ts').PortfolioData
interface ServerEntry {
  loadData: () => Promise<{ data: Data; source: string }>
  render: (url: string, data: Data) => { html: string; head: string; locale: 'en' | 'de' }
}

const { loadData, render } = (await import(pathToFileURL(ssrEntry).href)) as ServerEntry
const template = readFileSync(join(dist, 'index.html'), 'utf8')
if (!template.includes('<!--app-html-->') || !template.includes('<!--app-head-->') || !template.includes('<html lang="en">')) {
  throw new Error('dist/index.html has no render placeholders. Run the client build (vite build) before prerendering.')
}
const { data, source } = await loadData()

const siteUrl = (process.env.SITE_URL || data.settings.site_url || 'https://arbab-dev.netlify.app').replace(/\/+$/, '')
data.settings.site_url = siteUrl

const safeJson = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')

function page(url: string) {
  const { html, head, locale } = render(url, data)
  // Non-executable JSON block: not subject to script-src, so the CSP needs no 'unsafe-inline' for scripts.
  const dataScript = `<script type="application/json" id="__portfolio" data-path="${url.replace(/"/g, '&quot;')}">${safeJson(data)}</script>`
  return template.replace('<html lang="en">', `<html lang="${locale}">`).replace('<!--app-head-->', head).replace('<!--app-html-->', html).replace('<!--app-data-->', dataScript)
}

function write(rel: string, content: string) {
  const file = join(dist, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, content)
}

// Pages (English at the root, German under /de) ---------------------------------
const hasPlayground = data.settings.sections.playground !== false
const paths = ['/', ...data.projects.map((p) => `/projects/${p.slug}`), ...(hasPlayground ? ['/playground'] : [])]
for (const path of paths) {
  write(path === '/' ? 'index.html' : `${path.slice(1)}.html`, page(path))
  const de = path === '/' ? '/de' : `/de${path}`
  write(`${de.slice(1)}.html`, page(de))
}

// SPA shells: no prerendered markup or data; the client fetches content itself.
// spa.html serves the admin and not-yet-prerendered projects; 404.html is returned with HTTP 404.
const escHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const shell = (extraHead = '') =>
  template
    .replace(
      '<!--app-head-->',
      `<title>${escHtml(data.settings.site_name)}</title>\n    <meta name="description" content="${escHtml(data.settings.seo_description)}" />${extraHead}`,
    )
    .replace('<!--app-html-->', '')
    .replace('<!--app-data-->', '')
write('spa.html', shell())
write('404.html', shell('\n    <meta name="robots" content="noindex" />'))

// Sitemap & robots -----------------------------------------------------------
const lastmod = (d?: string) => (d ? `\n    <lastmod>${new Date(d).toISOString().slice(0, 10)}</lastmod>` : '')
// Every page is listed in both languages, each entry naming its alternates (hreflang).
const entries: { path: string; updated?: string; freq: string; priority: string }[] = [
  { path: '/', updated: data.profile.updated_at, freq: 'weekly', priority: '1.0' },
  ...(hasPlayground ? [{ path: '/playground', freq: 'yearly', priority: '0.3' }] : []),
  ...data.projects.map((p) => ({ path: `/projects/${p.slug}`, updated: p.updated_at, freq: 'monthly', priority: '0.7' })),
]
const enUrl = (path: string) => `${siteUrl}${path}`
const deUrl = (path: string) => `${siteUrl}${path === '/' ? '/de' : `/de${path}`}`
const urls = entries.flatMap((e) => {
  const alts = [
    `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl(e.path)}" />`,
    `    <xhtml:link rel="alternate" hreflang="de" href="${deUrl(e.path)}" />`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl(e.path)}" />`,
  ].join('\n')
  return [enUrl(e.path), deUrl(e.path)].map(
    (loc) => `  <url>\n    <loc>${loc}</loc>${lastmod(e.updated)}\n    <changefreq>${e.freq}</changefreq>\n    <priority>${e.priority}</priority>\n${alts}\n  </url>`,
  )
})
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`,
)
write(
  'robots.txt',
  data.settings.robots_index
    ? `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`,
)

// Security headers (CSP) generated from the configured Supabase origin, so a custom Supabase
// domain (or a local stack) works without loosening the policy for everyone.
const supabaseOrigin = (() => {
  try {
    return new URL(process.env.VITE_SUPABASE_URL || '').origin
  } catch {
    return ''
  }
})()
const wsOrigin = supabaseOrigin.replace(/^http/, 'ws')
// Netlify injects its "Powered by Netlify" badge/owner toolbar into free-plan sites; it renders in a
// srcdoc iframe with one fixed inline script. Allow exactly that script by hash (no 'unsafe-inline').
// If Netlify updates the badge, add the new hash via CSP_EXTRA_SCRIPT_SRC (space-separated) in Netlify env.
const NETLIFY_BADGE_HASH = "'sha256-BkKP2XO6WOEc3kXOiLr2ZoY83hamalKjPY9xBcbXVuw='"
const extraScriptSrc = (process.env.CSP_EXTRA_SCRIPT_SRC || '').trim()
const csp = [
  "default-src 'self'",
  `script-src 'self' https://challenges.cloudflare.com ${NETLIFY_BADGE_HASH} ${extraScriptSrc}`.trim(),
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  `img-src 'self' data: blob: https: ${supabaseOrigin}`.trim(),
  `media-src 'self' https: ${supabaseOrigin}`.trim(),
  `connect-src 'self' ${supabaseOrigin} ${wsOrigin} https://challenges.cloudflare.com`.replace(/\s+/g, ' '),
  'frame-src https://challenges.cloudflare.com',
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')
write('_headers', `/*\n  Content-Security-Policy: ${csp}\n`)

rmSync(join(root, 'dist-ssr'), { recursive: true, force: true })
console.log(`✓ prerendered ${paths.length * 2} pages (EN + DE) from ${source} · sitemap.xml · robots.txt · spa.html · 404.html · _headers (CSP${supabaseOrigin ? ' + ' + supabaseOrigin : ''})`)
