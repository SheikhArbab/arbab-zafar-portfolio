import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { LazyMotion } from 'framer-motion'
import App from './App'

const loadFeatures = () => import('./lib/motionFeatures').then((r) => r.default)
import './index.css'
import type { PortfolioData } from './types/content'

const root = document.getElementById('root')!
// Prerendered pages embed their content as a non-executable JSON block (CSP-friendly).
const dataEl = document.getElementById('__portfolio')
const prerendered = dataEl?.dataset.path
let initialData: PortfolioData | null = null
try {
  initialData = dataEl?.textContent ? (JSON.parse(dataEl.textContent) as PortfolioData) : null
} catch {
  initialData = null
}

const app = (
  <StrictMode>
    <BrowserRouter>
      <LazyMotion features={loadFeatures} strict>
        <App initialData={prerendered === window.location.pathname ? initialData : null} />
      </LazyMotion>
    </BrowserRouter>
  </StrictMode>
)

// Hydrate only when this exact path was prerendered at build time; otherwise render fresh.
if (prerendered && prerendered === window.location.pathname && root.hasChildNodes()) {
  hydrateRoot(root, app)
} else {
  root.innerHTML = ''
  createRoot(root).render(app)
}
