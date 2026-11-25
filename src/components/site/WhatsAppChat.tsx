import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { Send, X } from 'lucide-react'
import { usePortfolio } from '@/data/PortfolioContext'
import { useT } from '@/i18n'
import { useLiquidLens } from '@/lib/liquidGlass'
import { SocialIcon } from '@/components/ui/BrandIcons'

/** Digits of the WhatsApp number from the profile's WhatsApp link ("+92 300 …" or "https://wa.me/92300…"). */
export function whatsappNumber(url: string): string | null {
  const fromLink = /wa\.me\/(\d{7,15})/.exec(url)?.[1]
  if (fromLink) return fromLink
  if (/^\+?[\d\s()-]{7,22}$/.test(url.trim())) {
    const digits = url.replace(/\D/g, '').replace(/^00/, '')
    return digits.length >= 7 && digits.length <= 15 ? digits : null
  }
  return null
}

/**
 * Floating WhatsApp chat. Only appears when a visible WhatsApp link with a valid number is set in
 * /admin → Profile → Social links. Messages are never sent from the site: "Open WhatsApp" hands the
 * text to wa.me, so the visitor sends it from their own WhatsApp.
 */
export function WhatsAppChat() {
  const { data } = usePortfolio()
  const t = useT().whatsapp
  const social = data.profile.socials.find((s) => s.platform === 'whatsapp' && s.visible)
  const number = social ? whatsappNumber(social.url) : null
  const firstName = data.profile.short_name || data.profile.full_name.split(' ')[0]

  const [open, setOpen] = useState(false)
  const [typing, setTyping] = useState(true)
  const [text, setText] = useState('')
  const button = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLTextAreaElement>(null)
  const titleId = useId()
  useLiquidLens(button, { strength: 12, bezel: 18, blur: 3 })

  // A short "typing…" beat before the greeting, then focus the message field.
  useEffect(() => {
    if (!open) return
    setTyping(true)
    const timer = setTimeout(() => setTyping(false), 700)
    field.current?.focus({ preventScroll: true })
    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (!panel.current?.contains(target) && !button.current?.contains(target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  if (!number) return null

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const message = text.trim() || t.chips[2].text(firstName)
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed right-4 bottom-4 z-40 print:hidden sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {open && (
          <m.div
            ref={panel}
            role="dialog"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="glass absolute right-0 bottom-[calc(100%+0.75rem)] w-[min(22rem,calc(100vw-2rem))] origin-bottom-right overflow-hidden rounded-2xl [--glass-blur:28px] [--panel:rgb(11_15_16/0.88)]"
          >
            <div className="flex items-center gap-3 border-b border-white/10 bg-[#25d366]/[0.08] px-4 py-3">
              <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#25d366]/15 text-[#25d366]">
                <SocialIcon platform="whatsapp" className="h-4.5 w-4.5" />
                <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-bg bg-[#25d366]" />
              </span>
              <div className="min-w-0 flex-1">
                <p id={titleId} className="truncate text-sm font-semibold text-white">
                  {data.profile.full_name}
                </p>
                <p className="truncate text-xs text-muted">{t.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  button.current?.focus()
                }}
                aria-label={t.close}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 px-4 py-4" aria-live="polite">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-fg">
                {typing ? (
                  <span className="flex items-center gap-1 py-1" aria-label={t.typing}>
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                ) : (
                  t.greeting(firstName)
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {t.chips.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => {
                      setText(c.text(firstName))
                      field.current?.focus()
                    }}
                    className="rounded-full border border-[#25d366]/30 bg-[#25d366]/[0.06] px-3 py-1 text-xs text-[#7ee2a8] transition-colors hover:bg-[#25d366]/15"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={submit} className="border-t border-white/10 p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={field}
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 1000))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      e.currentTarget.form?.requestSubmit()
                    }
                  }}
                  rows={2}
                  aria-label={t.placeholder}
                  placeholder={t.placeholder}
                  className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-fg outline-none placeholder:text-dim focus:border-[#25d366]/50"
                />
                <button
                  type="submit"
                  aria-label={t.send}
                  title={t.send}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#25d366] text-black transition-transform hover:-translate-y-px"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-[0.68rem] text-dim">{t.note}</p>
            </form>
          </m.div>
        )}
      </AnimatePresence>

      <button
        ref={button}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={open ? t.close : t.open}
        title={t.open}
        className="glass glass-clear group relative grid h-14 w-14 place-items-center rounded-full text-[#25d366] transition-transform hover:-translate-y-0.5 [--panel:rgb(37_211_102/0.14)]"
      >
        <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full border border-[#25d366]/40 [animation-iteration-count:3]" />
        {open ? <X className="h-6 w-6" /> : <SocialIcon platform="whatsapp" className="h-6 w-6" />}
      </button>
    </div>
  )
}
