import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, FileDown, Info } from 'lucide-react'
import { usePortfolio } from '@/data/PortfolioContext'
import { cvHead } from '@/seo/head'
import { useHead } from '@/seo/useHead'
import { intlLocale, localizePath, useLocale, useLocalePath, useT, type Locale } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { buildCv } from '@/cv/model'
import { EuropassCv, LebenslaufCv, ModernCv } from '@/cv/templates'

type Template = 'modern' | 'lebenslauf' | 'europass'
const TEMPLATES: Template[] = ['modern', 'lebenslauf', 'europass']
const A4_PX = 793.7 // 210mm at 96 dpi

/** Scale the fixed-width A4 sheet down to fit narrow screens (printing always uses 100%). */
function useFitZoom() {
  const ref = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setZoom(Math.min(1, el.clientWidth / A4_PX))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return { ref, zoom }
}

export default function CvPage() {
  const { data } = usePortfolio()
  const t = useT()
  const locale = useLocale()
  const lp = useLocalePath()
  const [params, setParams] = useSearchParams()
  const q = params.get('t')
  const template: Template = TEMPLATES.includes(q as Template) ? (q as Template) : locale === 'de' ? 'lebenslauf' : 'modern'
  const model = useMemo(() => buildCv(data, locale), [data, locale])
  const { ref, zoom } = useFitZoom()
  useHead(cvHead(data, locale))

  // Today's date only on the client (a prerendered date would go stale).
  const [today, setToday] = useState('')
  useEffect(() => {
    setToday(new Intl.DateTimeFormat(intlLocale(locale), { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date()))
  }, [locale])

  // The print dialog suggests document.title as the PDF file name.
  useEffect(() => {
    let previous = ''
    const name = data.profile.full_name.trim().replace(/\s+/g, '-')
    const before = () => {
      previous = document.title
      document.title = `${name}-${template === 'lebenslauf' ? 'Lebenslauf' : template === 'europass' ? 'Europass-CV' : 'CV'}-${locale.toUpperCase()}`
    }
    const after = () => {
      if (previous) document.title = previous
    }
    window.addEventListener('beforeprint', before)
    window.addEventListener('afterprint', after)
    return () => {
      window.removeEventListener('beforeprint', before)
      window.removeEventListener('afterprint', after)
    }
  }, [data.profile.full_name, template, locale])

  // Print: the Modern sidebar colour is painted on the page canvas so it continues on page 2+.
  useEffect(() => {
    document.documentElement.dataset.cv = template
    return () => {
      delete document.documentElement.dataset.cv
    }
  }, [template])

  const choose = (tpl: Template) =>
    setParams(
      (p) => {
        p.set('t', tpl)
        return p
      },
      { replace: true },
    )

  return (
    <main id="main" className="px-4 pt-24 pb-16 sm:px-6 print:p-0">
      <div className="mx-auto mb-6 max-w-[210mm] print:hidden">
        <Link to={lp('/')} className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-accent">
          <ArrowLeft className="h-3.5 w-3.5" /> ~/{data.profile.short_name.toLowerCase() || 'home'}
        </Link>
        <div className="glass hud mt-3 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-white">{t.cv.toolbarTitle}</h1>
              <p className="mt-1 text-sm text-muted">{t.cv.toolbarHint}</p>
            </div>
            <Button onClick={() => window.print()}>
              <FileDown className="h-4 w-4" /> {t.cv.print}
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.68rem] tracking-[0.14em] text-dim uppercase">{t.cv.template}</span>
              <div role="group" aria-label={t.cv.template} className="inline-flex rounded-lg border border-line p-0.5">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    aria-pressed={template === tpl}
                    onClick={() => choose(tpl)}
                    className={cn('rounded-md px-3 py-1.5 text-xs font-medium transition-colors', template === tpl ? 'bg-accent/15 text-accent' : 'text-muted hover:text-fg')}
                  >
                    {tpl === 'modern' ? t.cv.modern : tpl === 'lebenslauf' ? t.cv.lebenslauf : t.cv.europass}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.68rem] tracking-[0.14em] text-dim uppercase">{t.cv.language}</span>
              <div role="group" aria-label={t.cv.language} className="inline-flex rounded-lg border border-line p-0.5">
                {(['en', 'de'] as Locale[]).map((l) => (
                  <Link
                    key={l}
                    to={localizePath(`/cv?t=${template}`, l)}
                    hrefLang={l}
                    aria-current={l === locale ? 'true' : undefined}
                    className={cn('rounded-md px-3 py-1.5 text-xs font-medium transition-colors', l === locale ? 'bg-accent/15 text-accent' : 'text-muted hover:text-fg')}
                  >
                    {l === 'en' ? 'English' : 'Deutsch'}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-4 flex items-start gap-1.5 text-xs text-dim">
            <Info className="mt-px h-3.5 w-3.5 shrink-0" /> {t.cv.printTip}
          </p>
        </div>
      </div>

      <div ref={ref} className="mx-auto max-w-[210mm] overflow-hidden print:max-w-none print:overflow-visible">
        <div className="cv-zoom w-[210mm] shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7)] print:shadow-none" style={{ ['--cv-zoom' as string]: zoom }}>
          {template === 'modern' ? <ModernCv m={model} /> : template === 'europass' ? <EuropassCv m={model} /> : <LebenslaufCv m={model} today={today} />}
        </div>
      </div>
    </main>
  )
}
