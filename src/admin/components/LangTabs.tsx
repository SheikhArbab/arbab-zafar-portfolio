import { Languages } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EditLang } from '../lib/translate'

interface Props {
  lang: EditLang
  onChange: (l: EditLang) => void
  progress: { done: number; total: number }
  className?: string
}

/** English / Deutsch switch for editors whose content has a German version (/de). */
export function LangTabs({ lang, onChange, progress, className }: Props) {
  const tabs: { id: EditLang; label: string; meta?: string }[] = [
    { id: 'en', label: 'English' },
    { id: 'de', label: 'Deutsch', meta: `${progress.done}/${progress.total}` },
  ]
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <div role="tablist" aria-label="Content language" className="inline-flex rounded-lg border border-line p-0.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={lang === t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              lang === t.id ? 'bg-accent/15 text-accent' : 'text-muted hover:text-fg',
            )}
          >
            {t.label}
            {t.meta && <span className="font-mono text-[0.65rem] text-dim">{t.meta}</span>}
          </button>
        ))}
      </div>
      {lang === 'de' && (
        <p className="flex items-center gap-1.5 text-xs text-dim">
          <Languages className="h-3.5 w-3.5" /> Shown on the German site (/de). Empty fields fall back to English.
        </p>
      )}
    </div>
  )
}
