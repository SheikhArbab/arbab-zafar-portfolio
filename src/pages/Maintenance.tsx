import { Link } from 'react-router-dom'
import { Mail, Wrench } from 'lucide-react'
import { usePortfolio } from '@/data/PortfolioContext'
import { useLocale, useT } from '@/i18n'
import { maintenanceHead } from '@/seo/head'
import { useHead } from '@/seo/useHead'

/** Holding page shown to visitors while maintenance mode is on. */
export default function Maintenance() {
  const { data } = usePortfolio()
  const t = useT()
  const locale = useLocale()
  useHead(maintenanceHead(data, locale))
  const email = data.profile.email
  return (
    <main id="main" className="bg-grid mask-radial flex min-h-screen items-center justify-center px-6">
      <div className="glass hud max-w-md rounded-2xl p-8 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{t.maintenance.status}</p>
        <h1 className="mt-4 text-2xl font-semibold text-white">{data.profile.full_name}</h1>
        <p className="mt-3 text-muted">{data.settings.maintenance_message}</p>
        {email && (
          <a href={`mailto:${email}`} className="mt-6 inline-flex items-center gap-2 font-mono text-xs text-accent hover:underline">
            <Mail className="h-3.5 w-3.5" /> {email}
          </a>
        )}
      </div>
    </main>
  )
}

/** Shown on the site to an admin who bypasses maintenance, so it is obvious visitors see something else. */
export function MaintenanceBanner() {
  const t = useT()
  return (
    <div role="status" className="fixed inset-x-0 bottom-0 z-[60] flex items-center justify-center gap-3 border-t border-amber-300/30 bg-[#1c1606]/95 px-4 py-2 text-xs text-amber-200 backdrop-blur print:hidden">
      <Wrench className="h-3.5 w-3.5 shrink-0" />
      <span>{t.maintenance.adminBanner}</span>
      <Link to="/admin/settings" className="shrink-0 font-medium text-amber-100 underline underline-offset-2">
        {t.maintenance.turnOff}
      </Link>
    </div>
  )
}
