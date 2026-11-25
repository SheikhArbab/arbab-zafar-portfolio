import { lazy, Suspense, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { PortfolioProvider, usePortfolio } from '@/data/PortfolioContext'
import { PublicLayout } from '@/components/site/PublicLayout'
import { PageLoader } from '@/components/site/PageLoader'
import { ErrorBoundary } from '@/components/site/ErrorBoundary'
import { rpcAsUser, storedAccessToken } from '@/lib/rest'
import Home from '@/pages/Home'
import ProjectPage from '@/pages/ProjectPage'
import NotFound from '@/pages/NotFound'
import Maintenance from '@/pages/Maintenance'
import Playground from '@/pages/Playground'
import type { PortfolioData } from '@/types/content'

// The admin dashboard is a separate chunk: never downloaded by regular visitors.
const AdminApp = lazy(() => import('@/admin/AdminApp'))

function PublicApp() {
  const { data, ready } = usePortfolio()
  const [adminBypass, setAdminBypass] = useState(false)

  useEffect(() => {
    if (!data.settings.maintenance_mode) return
    const token = storedAccessToken()
    if (token) void rpcAsUser<boolean>('is_admin', token).then((ok) => setAdminBypass(ok === true))
  }, [data.settings.maintenance_mode])

  if (!ready) return <PageLoader />
  if (data.settings.maintenance_mode && !adminBypass) return <Maintenance />

  return (
    <PublicLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        {data.settings.sections.playground && <Route path="/playground" element={<Playground />} />}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PublicLayout>
  )
}

export default function App({ initialData }: { initialData?: PortfolioData | null }) {
  useEffect(() => {
    try {
      sessionStorage.removeItem('az-chunk-reload')
    } catch {
      /* storage unavailable */
    }
  }, [])
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <ErrorBoundary area="admin">
            <Suspense fallback={<PageLoader label="booting admin" />}>
              <AdminApp />
            </Suspense>
          </ErrorBoundary>
        }
      />
      <Route
        path="*"
        element={
          <ErrorBoundary area="portfolio">
            <PortfolioProvider initialData={initialData}>
              <PublicApp />
            </PortfolioProvider>
          </ErrorBoundary>
        }
      />
    </Routes>
  )
}
