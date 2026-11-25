import { useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Cpu,
  ExternalLink,
  FileText,
  FolderGit2,
  Globe,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Type,
  User,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '../lib/auth'
import { confirmDiscard, useDirtyGuard } from '../lib/dirty'

const NAV = [
  { to: '/admin', label: 'Overview', Icon: LayoutDashboard, end: true },
  { to: '/admin/profile', label: 'Profile', Icon: User },
  { to: '/admin/content', label: 'Website content', Icon: Type },
  { to: '/admin/experience', label: 'Experience', Icon: Briefcase },
  { to: '/admin/projects', label: 'Projects', Icon: FolderGit2 },
  { to: '/admin/skills', label: 'Skills', Icon: Cpu },
  { to: '/admin/education', label: 'Education', Icon: GraduationCap },
  { to: '/admin/documents', label: 'CV & documents', Icon: FileText },
  { to: '/admin/messages', label: 'Messages', Icon: Inbox },
  { to: '/admin/seo', label: 'SEO', Icon: Globe },
  { to: '/admin/settings', label: 'Site settings', Icon: Settings },
]

export function AdminLayout({ children, unread }: { children: ReactNode; unread: number }) {
  const { session, signOut } = useAuth()
  const { isDirty } = useDirtyGuard()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  const guard = (e: React.MouseEvent, to: string) => {
    if (to !== pathname && isDirty() && !confirmDiscard()) e.preventDefault()
    else setOpen(false)
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-line px-5 font-mono">
        <span className="grid h-8 w-8 place-items-center rounded-md border border-accent/40 bg-accent/[0.06] text-xs font-semibold text-accent">az</span>
        <div className="leading-tight">
          <p className="text-sm text-fg">control.panel</p>
          <p className="text-[0.62rem] text-dim">portfolio cms</p>
        </div>
      </div>
      <nav className="scrollbar-thin flex-1 overflow-y-auto p-3" aria-label="Admin">
        <ul className="space-y-0.5">
          {NAV.map(({ to, label, Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={(e) => guard(e, to)}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive ? 'bg-accent/[0.08] text-white' : 'text-muted hover:bg-white/[0.04] hover:text-fg',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full bg-accent" />}
                    <Icon className={cn('h-4 w-4', isActive && 'text-accent')} />
                    {label}
                    {to === '/admin/messages' && unread > 0 && (
                      <span className="ml-auto rounded-full bg-accent px-1.5 font-mono text-[0.62rem] font-semibold text-black">{unread}</span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="space-y-1 border-t border-line p-3">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/[0.04] hover:text-fg">
          <ExternalLink className="h-4 w-4" /> View portfolio
        </a>
        <button
          onClick={async () => {
            if (isDirty() && !confirmDiscard()) return
            await signOut()
            navigate('/admin/login')
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/[0.04] hover:text-fg"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
        <p className="truncate px-3 pt-1 font-mono text-[0.62rem] text-dim">{session?.user.email}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#070a0b]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-[#090c0d] lg:block">{sidebar}</aside>
      {/* mobile */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-[#090c0d]/90 px-4 backdrop-blur lg:hidden">
        <span className="font-mono text-sm text-fg">
          control<span className="text-accent">.panel</span>
        </span>
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-fg hover:bg-white/5" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-line bg-[#090c0d]">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-3 rounded-lg p-1.5 text-muted hover:text-fg" aria-label="Close navigation">
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">{children}</div>
      </main>
    </div>
  )
}
