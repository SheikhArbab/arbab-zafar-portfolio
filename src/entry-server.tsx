import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { LazyMotion } from 'framer-motion'
import App from './App'

const loadFeatures = () => import('./lib/motionFeatures').then((r) => r.default)
import { fetchPortfolio } from './data/fetchPortfolio'
import { defaultData } from './content/defaults'
import { homeHead, playgroundHead, projectHead, renderHeadTags } from './seo/head'
import { isSupabaseConfigured } from './lib/env'
import type { PortfolioData } from './types/content'

export async function loadData(): Promise<{ data: PortfolioData; source: 'supabase' | 'defaults' }> {
  if (!isSupabaseConfigured) return { data: defaultData, source: 'defaults' }
  try {
    return { data: await fetchPortfolio(), source: 'supabase' }
  } catch (e) {
    console.warn('[prerender] Supabase fetch failed, using defaults:', e)
    return { data: defaultData, source: 'defaults' }
  }
}

export function render(url: string, data: PortfolioData) {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <LazyMotion features={loadFeatures} strict>
          <App initialData={data} />
        </LazyMotion>
      </StaticRouter>
    </StrictMode>,
  )
  const slug = url.startsWith('/projects/') ? url.split('/')[2] : null
  const project = slug ? data.projects.find((p) => p.slug === slug) : null
  const head = renderHeadTags(project ? projectHead(data, project) : url === '/playground' ? playgroundHead(data) : homeHead(data))
  return { html, head }
}
