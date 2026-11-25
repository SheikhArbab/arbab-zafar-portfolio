import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ShieldAlert } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/site/PageLoader'
import { AuthProvider, useAuth } from './lib/auth'
import { DirtyProvider } from './lib/dirty'
import { ConfirmProvider } from './components/Confirm'
import { AdminLayout } from './components/AdminLayout'
import Login from './pages/Login'

const Overview = lazy(() => import('./pages/Overview'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const ContentPage = lazy(() => import('./pages/ContentPage'))
const ExperiencePage = lazy(() => import('./pages/ExperiencePage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const SkillsPage = lazy(() => import('./pages/SkillsPage'))
const EducationPage = lazy(() => import('./pages/EducationPage'))
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))
const SeoPage = lazy(() => import('./pages/SeoPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

function SetupRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="glass hud max-w-lg rounded-2xl p-8">
        <p className="font-mono text-xs text-amber-300">config error</p>
        <h1 className="mt-2 text-xl font-semibold text-white">Supabase is not configured</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Set <code className="text-accent">VITE_SUPABASE_URL</code> and <code className="text-accent">VITE_SUPABASE_ANON_KEY</code> in your environment (see <code>.env.example</code> and the README), then rebuild.
        </p>
      </div>
    </div>
  )
}

function Denied() {
  const { session, signOut } = useAuth()
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="glass max-w-md rounded-2xl p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-red-400" />
        <h1 className="mt-4 text-xl font-semibold text-white">Access denied</h1>
        <p className="mt-2 text-sm text-muted">
          <span className="font-mono text-fg">{session?.user.email}</span> is signed in but is not listed in <code>admin_users</code>.
        </p>
        <Button variant="outline" className="mt-6" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </div>
  )
}

function useUnreadCount(enabled: boolean) {
  const [n, setN] = useState(0)
  const { pathname } = useLocation()
  useEffect(() => {
    if (!enabled || !supabase) return
    supabase
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'unread')
      .then(({ count }) => setN(count ?? 0))
  }, [enabled, pathname])
  return n
}

function Protected() {
  const { session, isAdmin, loading, recovery } = useAuth()
  const unread = useUnreadCount(isAdmin)
  if (loading) return <PageLoader label="verifying session" />
  if (!session || recovery) return <Navigate to="/admin/login" replace />
  if (!isAdmin) return <Denied />
  return (
    <AdminLayout unread={unread}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route index element={<Overview />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="experience" element={<ExperiencePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="education" element={<EducationPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="seo" element={<SeoPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    </AdminLayout>
  )
}

export default function AdminApp() {
  useEffect(() => {
    document.title = 'Admin · Portfolio'
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.appendChild(robots)
    }
    robots.content = 'noindex, nofollow'
  }, [])

  if (!isSupabaseConfigured) return <SetupRequired />
  return (
    <AuthProvider>
      <DirtyProvider>
        <ConfirmProvider>
          <Routes>
            <Route path="login" element={<Login />} />
            <Route path="*" element={<Protected />} />
          </Routes>
          <Toaster theme="dark" position="bottom-right" toastOptions={{ style: { background: '#0e1314', border: '1px solid rgba(255,255,255,0.1)', color: '#eef3f1' } }} />
        </ConfirmProvider>
      </DirtyProvider>
    </AuthProvider>
  )
}
