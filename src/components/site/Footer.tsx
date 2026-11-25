import { Link } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import { usePortfolio } from '@/data/PortfolioContext'
import { navSections } from '@/data/sections'
import { safeUrl } from '@/lib/utils'
import { BrandMark } from './Navbar'
import { SectionLink, scrollToTop } from './SectionLink'
import { useLocalePath, useT } from '@/i18n'
import { SocialIcon, socialHref } from '@/components/ui/BrandIcons'

export function Footer() {
  const { data } = usePortfolio()
  const { profile, settings } = data
  const t = useT()
  const lp = useLocalePath()
  const year = new Date().getFullYear()
  // The Email entry may leave its URL empty and rely on the public profile email (same as Contact).
  const socials = profile.socials
    .map((s) => ({ ...s, url: s.platform === 'email' ? s.url || profile.email : s.url }))
    .filter((s) => s.visible && safeUrl(socialHref(s.platform, s.url)))

  return (
    <footer className="relative border-t border-line print:hidden">
      <div className="mx-auto grid grid-cols-1 max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_auto]">
        <div>
          <BrandMark />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{settings.content.footer.tagline}</p>
          <div className="mt-5 flex gap-2">
            {socials.map((s) => (
              <a
                key={s.platform + s.url}
                href={safeUrl(socialHref(s.platform, s.url))}
                target={s.platform === 'email' ? undefined : '_blank'}
                rel="noopener noreferrer me"
                aria-label={s.label}
                className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent/50 hover:text-accent"
              >
                <SocialIcon platform={s.platform} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <nav aria-label={t.footer.nav}>
          <p className="mb-3 font-mono text-[0.7rem] tracking-[0.18em] text-dim uppercase">{t.footer.index}</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {navSections(data).map((s) => (
              <li key={s.id}>
                <SectionLink id={s.id} className="text-muted transition-colors hover:text-fg">
                  {s.label}
                </SectionLink>
              </li>
            ))}
            {settings.sections.playground && (
              <li>
                <Link to={lp('/playground')} className="text-muted transition-colors hover:text-fg">
                  {t.footer.playground}
                </Link>
              </li>
            )}
            <li>
              <Link to={lp('/cv')} className="text-muted transition-colors hover:text-fg">
                {t.footer.cv}
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex items-start md:justify-end">
          <button
            type="button"
            onClick={() => {
              scrollToTop()
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 font-mono text-xs text-muted hover:border-accent/50 hover:text-accent"
          >
            <ArrowUp className="h-3.5 w-3.5" aria-hidden /> {t.footer.top}
          </button>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 font-mono text-[0.7rem] text-dim sm:flex-row sm:items-center sm:justify-between sm:px-8">
          {/* The year can differ between build time and the visitor's clock. */}
          <p suppressHydrationWarning>
            © {year} {profile.full_name}. {settings.content.footer.text}
          </p>
          <p className="flex items-center gap-4">
            <span>{profile.location}</span>
            {/* Discreet admin entry. The route itself is protected by Supabase Auth + RLS. */}
            <Link to="/admin" className="opacity-40 transition-opacity hover:opacity-100" rel="nofollow">
              ~/admin
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
