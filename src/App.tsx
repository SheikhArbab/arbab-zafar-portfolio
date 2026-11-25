import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from 'react'
import { Route, Routes } from 'react-router-dom'
import { PortfolioProvider, usePortfolio } from '@/data/PortfolioContext'
import { PublicLayout } from '@/components/site/PublicLayout'
import { PageLoader } from '@/components/site/PageLoader'
import { ErrorBoundary } from '@/components/site/ErrorBoundary'
import { storedAccessToken } from '@/lib/rest'
import Home from '@/pages/Home'
import ProjectPage from '@/pages/ProjectPage'
import NotFound from '@/pages/NotFound'
import Maintenance, { MaintenanceBanner } from '@/pages/Maintenance'
import Playground from '@/pages/Playground'
import type { PortfolioData } from '@/types/content'

// The admin dashboard is a separate chunk: never downloaded by regular visitors.
const AdminApp = lazy(() => import('@/admin/AdminApp'))
// The CV generator (templates + QR encoder) only loads on /cv.
const CvPage = lazy(() => import('@/pages/CvPage'))

const noop = () => () => {}
/**
 * The CV page is client-only: the server (and the hydration pass) render the loader, then the lazy
 * chunk loads. Rendering the lazy page during hydration would make React discard the server HTML (#419).
 */
function CvRoute() {
  const hydrated = useSyncExternalStore(noop, () => true, () => false)
  return hydrated ? (
    <Suspense fallback={<PageLoader />}>
      <CvPage />
    </Suspense>
  ) : (
    <PageLoader />
  )
}

function PublicApp() {
  const { data, ready } = usePortfolio()
  // 'checking' only while a signed-in browser is verified, so admins don't see the holding page flash.
  const [adminBypass, setAdminBypass] = useState<'no' | 'checking' | 'yes'>('no')
  const maintenance = data.settings.maintenance_mode

  useEffect(() => {
    if (!maintenance) return
    // Decided by the database: is_admin() is true only for an admin session that passed two-step login.
    // The real Supabase client (loaded only for signed-in browsers) refreshes an expired session first.
    if (!storedAccessToken()) return setAdminBypass('no')
    let cancelled = false
    setAdminBypass('checking')
    import('@/lib/supabase')
      .then(async ({ supabase }) => {
        const { data: s } = (await supabase?.auth.getSession()) ?? { data: { session: null } }
        if (!s.session || !supabase) return false
        const { data: ok } = await supabase.rpc('is_admin')
        return ok === true
      })
      .catch(() => false)
      .then((ok) => {
        if (!cancelled) setAdminBypass(ok ? 'yes' : 'no')
      })
    return () => {
      cancelled = true
    }
  }, [maintenance])

  if (!ready) return <PageLoader />
  if (maintenance && adminBypass === 'checking') return <PageLoader label="checking access" />
  if (maintenance && adminBypass !== 'yes') return <Maintenance />

  return (
    <PublicLayout>
      {maintenance && <MaintenanceBanner />}
      <Routes>
        {(['', '/de'] as const).map((prefix) => [
          <Route key={`${prefix}home`} path={prefix || '/'} element={<Home />} />,
          <Route key={`${prefix}project`} path={`${prefix}/projects/:slug`} element={<ProjectPage />} />,
          data.settings.sections.playground && <Route key={`${prefix}play`} path={`${prefix}/playground`} element={<Playground />} />,
          <Route key={`${prefix}cv`} path={`${prefix}/cv`} element={<CvRoute />} />,
        ])}
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
