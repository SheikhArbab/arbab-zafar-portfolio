import { Link, useLocation } from 'react-router-dom'
import { localizePath, useLocale, useT, type Locale } from '@/i18n'
import { cn } from '@/lib/utils'

/** EN | DE toggle that opens the same page in the other language (no automatic redirects). */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale()
  const t = useT()
  const { pathname, search, hash } = useLocation()
  const target = (l: Locale) => localizePath(`${pathname}${search}${hash}`, l)
  return (
    <div role="group" aria-label={t.common.switchLanguage} className={cn('flex items-center rounded-lg border border-line p-0.5 font-mono text-[0.68rem]', className)}>
      {(['en', 'de'] as Locale[]).map((l) => (
        <Link
          key={l}
          to={target(l)}
          hrefLang={l}
          lang={l}
          aria-current={l === locale ? 'true' : undefined}
          aria-label={l === 'en' ? 'English' : 'Deutsch'}
          onClick={() => {
            try {
              localStorage.setItem('az-lang', l)
            } catch {
              /* ignore */
            }
          }}
          className={cn('rounded-md px-2 py-1 transition-colors', l === locale ? 'bg-accent/15 text-accent' : 'text-muted hover:text-fg')}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  )
}
