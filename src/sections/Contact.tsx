import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { AlertTriangle, ArrowUpRight, CheckCircle2, Download, FileText, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePortfolio } from '@/data/PortfolioContext'
import { normalizeContact, validateContact, type ContactErrors, type ContactInput } from '@/lib/contact'
import { cn, safeUrl } from '@/lib/utils'
import { SectionHeading } from '@/components/site/SectionHeading'
import { Reveal } from '@/components/site/Reveal'
import { Button } from '@/components/ui/Button'
import { FieldError, Input, Label, Textarea } from '@/components/ui/Field'
import { SocialIcon, socialHref } from '@/components/ui/BrandIcons'
import { Spinner } from '@/components/ui/Spinner'
import { useLocale, useLocalePath, useT } from '@/i18n'

type Status = 'idle' | 'sending' | 'success' | 'error'
type Errors = ContactErrors

const TURNSTILE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id?: string) => void }
  }
}

function useTurnstile() {
  const ref = useRef<HTMLDivElement>(null)
  const [token, setToken] = useState<string>('')
  const widget = useRef<string>('')
  useEffect(() => {
    if (!TURNSTILE_KEY || !ref.current) return
    const render = () => {
      if (!window.turnstile || !ref.current || widget.current) return
      widget.current = window.turnstile.render(ref.current, {
        sitekey: TURNSTILE_KEY,
        theme: 'dark',
        callback: (t: string) => setToken(t),
        'expired-callback': () => setToken(''),
      })
    }
    if (window.turnstile) return render()
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true
    s.onload = render
    document.head.appendChild(s)
  }, [])
  const reset = () => {
    setToken('')
    window.turnstile?.reset(widget.current)
  }
  return { ref, token, reset, enabled: Boolean(TURNSTILE_KEY) }
}

export function Contact({ index }: { index: number }) {
  const { data } = usePortfolio()
  const { profile, settings, documents } = data
  const t = useT()
  const T = t.contact
  const lp = useLocalePath()
  const locale = useLocale()
  const copy = settings.content.contact
  const [values, setValues] = useState<ContactInput>({ name: '', email: '', subject: '', message: '' })
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState('')
  const startedAt = useRef(Date.now())
  const turnstile = useTurnstile()

  const socials = profile.socials.filter((s) => s.visible && safeUrl(socialHref(s.platform, s.platform === 'email' ? s.url || profile.email : s.url)))
  const cvs = documents.filter((d) => (d.kind === 'cv_en' || d.kind === 'cv_de') && safeUrl(d.file_url))
    .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === (locale === 'de' ? 'cv_de' : 'cv_en') ? -1 : 1))

  const set = (k: keyof ContactInput) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const clean = normalizeContact(values)
    const errs = validateContact(clean)
    if (Object.keys(errs).length) {
      // Show the validation messages in the page's language (same rules as the server).
      const localized: Errors = {}
      for (const k of Object.keys(errs) as (keyof ContactInput)[]) {
        localized[k] = /line break/i.test(errs[k] ?? '') ? T.errors.linebreak : T.errors[k]
      }
      setErrors(localized)
      // Focus the first invalid field in form order.
      const first = (['name', 'email', 'subject', 'message'] as const).find((k) => errs[k])
      if (first) document.getElementById(`contact-${first}`)?.focus()
      return
    }
    if (turnstile.enabled && !turnstile.token) {
      setServerError(T.verify)
      setStatus('error')
      return
    }
    setStatus('sending')
    setServerError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...clean, website: honeypot, startedAt: startedAt.current, token: turnstile.token || undefined }),
      })
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`)
      setStatus('success')
      setTimeout(() => {
        document.getElementById('contact-success')?.focus()
      }, 50)
      setValues({ name: '', email: '', subject: '', message: '' })
      turnstile.reset()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : T.failed)
      setStatus('error')
      turnstile.reset()
    }
  }

  const field = (k: keyof ContactInput) => ({
    id: `contact-${k}`,
    name: k,
    value: values[k],
    onChange: set(k),
    'aria-invalid': Boolean(errors[k]) || undefined,
    'aria-describedby': errors[k] ? `contact-${k}-err` : undefined,
    disabled: status === 'sending',
  })

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative py-24 md:py-32">
      <div aria-hidden className="bg-grid mask-radial absolute inset-0 -z-10 opacity-40" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading id="contact-title" index={index} eyebrow={copy.eyebrow} heading={copy.heading} description={copy.description} className="mb-10 md:mb-10" />

            {profile.is_available && (
              <Reveal>
                <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/[0.06] px-3 py-1.5 font-mono text-xs text-accent">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> {profile.availability_text}
                </p>
              </Reveal>
            )}

            <ul className="space-y-2">
              {socials.map((s, i) => {
                const raw = s.platform === 'email' ? s.url || profile.email : s.url
                const href = safeUrl(socialHref(s.platform, raw))!
                const display = raw.replace(/^mailto:/, '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
                return (
                  <Reveal as="li" key={s.platform + i} delay={i * 0.05}>
                    <a
                      href={href}
                      target={s.platform === 'email' ? undefined : '_blank'}
                      rel="noopener noreferrer me"
                      className="group flex items-center gap-4 rounded-xl border border-line bg-white/[0.015] px-4 py-3.5 transition-colors hover:border-accent/35"
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors group-hover:text-accent">
                        <SocialIcon platform={s.platform} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-[0.62rem] tracking-widest text-dim uppercase">{s.label}</span>
                        <span className="block truncate text-sm text-fg">{display}</span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-dim transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                    </a>
                  </Reveal>
                )
              })}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
                {cvs.map((d) => (
                  <a
                    key={d.id}
                    href={d.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-3 py-2 font-mono text-xs text-fg hover:border-accent/50 hover:text-accent"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {d.kind === 'cv_de' ? T.resumeDe : T.resumeEn}
                  </a>
                ))}
                <Link
                  to={lp('/cv')}
                  className="inline-flex items-center gap-2 rounded-lg border border-line-strong px-3 py-2 font-mono text-xs text-fg hover:border-accent/50 hover:text-accent"
                >
                  <FileText className="h-3.5 w-3.5" />
                  {t.cv.toolbarTitle}
                </Link>
              </div>
          </div>

          <Reveal>
            <div className="glass hud relative overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-[0.7rem] text-dim">
                <span>
                  <span className="text-accent">●</span> {T.channel}
                </span>
                <span>{T.channelMeta}</span>
              </div>

              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <m.div
                    key="ok"
                    id="contact-success"
                    tabIndex={-1}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center outline-none"
                    role="status"
                  >
                    <CheckCircle2 className="h-12 w-12 text-accent" aria-hidden />
                    <p className="mt-5 font-mono text-sm text-accent">{T.success}</p>
                    <p className="mt-2 max-w-sm text-muted">{copy.success_message}</p>
                    <Button variant="outline" className="mt-8" onClick={() => {
                        setStatus('idle')
                        setTimeout(() => {
                          document.getElementById('contact-name')?.focus()
                        }, 50)
                      }}>
                      {T.sendAnother}
                    </Button>
                  </m.div>
                ) : (
                  <m.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={submit} noValidate className="space-y-5 p-5 md:p-7">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="contact-name">{T.name}</Label>
                        <Input {...field('name')} autoComplete="name" placeholder={T.namePh} maxLength={100} />
                        <FieldError>{errors.name && <span id="contact-name-err">{errors.name}</span>}</FieldError>
                      </div>
                      <div>
                        <Label htmlFor="contact-email">{T.email}</Label>
                        <Input {...field('email')} type="email" autoComplete="email" placeholder={T.emailPh} maxLength={200} />
                        <FieldError>{errors.email && <span id="contact-email-err">{errors.email}</span>}</FieldError>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="contact-subject">{T.subject}</Label>
                      <Input {...field('subject')} placeholder={T.subjectPh} maxLength={150} />
                      <FieldError>{errors.subject && <span id="contact-subject-err">{errors.subject}</span>}</FieldError>
                    </div>
                    <div>
                      <Label htmlFor="contact-message">{T.message}</Label>
                      <Textarea {...field('message')} rows={6} placeholder={T.messagePh} maxLength={5000} />
                      <div className="flex justify-between">
                        <FieldError>{errors.message && <span id="contact-message-err">{errors.message}</span>}</FieldError>
                        <span className="mt-1.5 ml-auto font-mono text-[0.65rem] text-dim">{[...values.message].length}/5000</span>
                      </div>
                    </div>

                    {/* Honeypot: invisible to people, tempting to bots */}
                    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                      <label>
                        Website
                        <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="website" />
                      </label>
                    </div>

                    {turnstile.enabled && <div ref={turnstile.ref} className="min-h-[65px]" />}

                    {status === 'error' && serverError && (
                      <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-400/[0.06] px-3 py-2.5 text-sm text-red-300">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {serverError}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                      <p className="font-mono text-[0.65rem] text-dim">{T.privacy}</p>
                      <Button type="submit" size="lg" disabled={status === 'sending'} className={cn(status === 'sending' && 'opacity-80')}>
                        {status === 'sending' ? (
                          <>
                            <Spinner /> {T.transmitting}
                          </>
                        ) : (
                          <>
                            {copy.submit_label} <Send className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </m.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
