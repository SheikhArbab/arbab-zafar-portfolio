/**
 * Build-time prerendering for SEO.
 *  1. Imports the SSR bundle (dist-ssr/entry-server.js)
 *  2. Fetches published content from Supabase (falls back to bundled defaults)
 *  3. Writes fully rendered HTML + per-page <head> (title, meta, OG, canonical, JSON-LD)
 *     for "/" and every "/projects/:slug"
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
  render: (url: string, data: Data) => { html: string; head: string }
}

const { loadData, render } = (await import(pathToFileURL(ssrEntry).href)) as ServerEntry
const template = readFileSync(join(dist, 'index.html'), 'utf8')
if (!template.includes('<!--app-html-->') || !template.includes('<!--app-head-->')) {
  throw new Error('dist/index.html has no render placeholders. Run the client build (vite build) before prerendering.')
}
const { data, source } = await loadData()

const siteUrl = (process.env.SITE_URL || data.settings.site_url || 'https://arbab-dev.netlify.app').replace(/\/+$/, '')
data.settings.site_url = siteUrl

const safeJson = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')

function page(url: string) {
  const { html, head } = render(url, data)
  // Non-executable JSON block: not subject to script-src, so the CSP needs no 'unsafe-inline' for scripts.
  const dataScript = `<script type="application/json" id="__portfolio" data-path="${url.replace(/"/g, '&quot;')}">${safeJson(data)}</script>`
  return template.replace('<!--app-head-->', head).replace('<!--app-html-->', html).replace('<!--app-data-->', dataScript)
}

function write(rel: string, content: string) {
  const file = join(dist, rel)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, content)
}

// Pages -------------------------------------------------------------------
write('index.html', page('/'))
for (const p of data.projects) write(`projects/${p.slug}.html`, page(`/projects/${p.slug}`))
const hasPlayground = data.settings.sections.playground !== false
if (hasPlayground) write('playground.html', page('/playground'))

// SPA shell: no prerendered markup or data; the client fetches content itself.
write(
  'spa.html',
  template
    .replace('<!--app-head-->', `<title>${data.settings.site_name}</title>\n    <meta name="description" content="${data.settings.seo_description.replace(/"/g, '&quot;')}" />`)
    .replace('<!--app-html-->', '')
    .replace('<!--app-data-->', ''),
)

// Sitemap & robots -----------------------------------------------------------
const lastmod = (d?: string) => (d ? `\n    <lastmod>${new Date(d).toISOString().slice(0, 10)}</lastmod>` : '')
const urls = [
  `  <url>\n    <loc>${siteUrl}/</loc>${lastmod(data.profile.updated_at)}\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
  ...(hasPlayground ? [`  <url>\n    <loc>${siteUrl}/playground</loc>\n    <changefreq>yearly</changefreq>\n    <priority>0.3</priority>\n  </url>`] : []),
  ...data.projects.map(
    (p) => `  <url>\n    <loc>${siteUrl}/projects/${p.slug}</loc>${lastmod(p.updated_at)}\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
  ),
]
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`)
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
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
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
console.log(`✓ prerendered ${1 + data.projects.length + (hasPlayground ? 1 : 0)} pages from ${source} · sitemap.xml · robots.txt · spa.html · _headers (CSP${supabaseOrigin ? ' + ' + supabaseOrigin : ''})`)
