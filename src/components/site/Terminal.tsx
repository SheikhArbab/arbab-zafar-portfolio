import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react'
import { m } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { usePortfolio } from '@/data/PortfolioContext'
import { useLocalePath, useT } from '@/i18n'
import { cn } from '@/lib/utils'
import { useLiquidLens } from '@/lib/liquidGlass'

/**
 * A decorative, sandboxed "terminal". It only understands a fixed list of
 * commands that print portfolio content. Nothing is evaluated or sent anywhere.
 */

type Line = { id: number; kind: 'in' | 'out' | 'sys'; content: ReactNode }

let uid = 0
const next = () => ++uid

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function Terminal({ className, animate = true }: { className?: string; animate?: boolean }) {
  const { data } = usePortfolio()
  const { profile, settings, skills, projects, documents } = data
  const [lines, setLines] = useState<Line[]>([])
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [, setCursor] = useState(-1)
  const body = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const input = useRef<HTMLInputElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  useLiquidLens(frame, { strength: 22, bezel: 26, blur: 10 })

  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight, behavior: 'smooth' })
  }, [lines])

  const t = useT()
  const T = t.terminal
  const lp = useLocalePath()
  const print = (...content: ReactNode[]) =>
    setLines((l) => [...l, ...content.map((c) => ({ id: next(), kind: 'out' as const, content: c }))].slice(-60))

  const commands: Record<string, { help: string; run: () => void }> = {
    help: {
      help: T.help.help,
      run: () =>
        print(
          <span className="text-muted">{T.available}</span>,
          ...Object.entries(commands).map(([k, c]) => (
            <span key={k}>
              <span className="text-accent">{k.padEnd(11, ' ')}</span>
              <span className="text-muted">{c.help}</span>
            </span>
          )),
        ),
    },
    whoami: {
      help: T.help.whoami,
      run: () => print(`${profile.full_name}, ${profile.title}`, <span className="text-muted">{profile.location}</span>),
    },
    skills: {
      help: T.help.skills,
      run: () => {
        print(skills.slice(0, 18).map((s) => s.name).join(' · ') || T.noSkills)
        scrollToId('skills')
      },
    },
    projects: {
      help: T.help.projects,
      run: () => {
        print(...(projects.length ? projects.slice(0, 8).map((p) => `▸ ${p.title}`) : [T.noProjects]))
        scrollToId('projects')
      },
    },
    experience: {
      help: T.help.experience,
      run: () => {
        print('→ /experience')
        scrollToId('experience')
      },
    },
    contact: {
      help: T.help.contact,
      run: () => {
        print(profile.email ? `mail → ${profile.email}` : T.openingContact)
        scrollToId('contact')
      },
    },
    cv: {
      help: T.help.cv,
      run: () => {
        const cvs = documents.filter((d) => d.kind === 'cv_en' || d.kind === 'cv_de')
        if (!cvs.length) {
          // Nothing uploaded: open the generated CV instead.
          print(T.openingCv)
          setTimeout(() => navigate(lp('/cv')), 350)
          return
        }
        const openGenerator = (e: MouseEvent) => {
          e.preventDefault()
          navigate(lp('/cv'))
        }
        print(
          ...cvs.map((d) => (
            <a key={d.id} className="text-accent-2 underline underline-offset-2" href={d.file_url} target="_blank" rel="noopener noreferrer">
              {d.kind === 'cv_de' ? T.cvDe : T.cvEn}: {d.file_name || 'download'}
            </a>
          )),
          <a key="generator" className="text-accent-2 underline underline-offset-2" href={lp('/cv')} onClick={openGenerator}>
            {T.cvGenerator}
          </a>,
        )
      },
    },
    deutsch: {
      help: T.help.deutsch,
      run: () => print(T.deutsch(profile.german.badge, profile.german.level, profile.german.goal)),
    },
    play: {
      help: T.help.play,
      run: () => {
        const arg = value.trim().toLowerCase().split(/\s+/)[1]
        const game = arg === 'bugs' || arg === 'memory' ? arg : 'typing'
        if (!settings.sections.playground) return print(T.playgroundOffline)
        print(T.launching(game))
        setTimeout(() => navigate(lp(`/playground?game=${game}`)), 350)
      },
    },
    sudo: { help: T.help.sudo, run: () => print(<span className="text-amber-300">{T.sudo}</span>) },
    clear: { help: T.help.clear, run: () => setLines([]) },
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const cmd = value.trim().toLowerCase().slice(0, 40)
    setValue('')
    setCursor(-1)
    if (!cmd) return
    setHistory((h) => [cmd, ...h].slice(0, 20))
    setLines((l) => [...l, { id: next(), kind: 'in', content: cmd }])
    const key = cmd.split(/\s+/)[0]
    const handler = commands[key]
    if (handler) handler.run()
    else print(<span className="text-red-300">{T.notFound(key)}</span>)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => {
        const n = Math.max(-1, Math.min(history.length - 1, c + (e.key === 'ArrowUp' ? 1 : -1)))
        setValue(n === -1 ? '' : history[n])
        return n
      })
    } else if (e.key === 'Tab') {
      const match = Object.keys(commands).find((k) => value && k.startsWith(value.toLowerCase()))
      if (match) {
        e.preventDefault()
        setValue(match)
      }
    }
  }

  return (
    <div
      ref={frame}
      className={cn('glass overflow-hidden rounded-xl font-mono text-[0.78rem] [--glass-drop:0_30px_80px_-30px_rgb(0_0_0/0.9)]', className)}
      onClick={() => input.current?.focus({ preventScroll: true })}
    >
      <div className="flex items-center gap-2 border-b border-line bg-white/[0.02] px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
        <span className="ml-2 truncate text-[0.7rem] text-dim">{settings.content.hero.terminal_title}</span>
        <span className="ml-auto text-[0.65rem] text-dim">zsh</span>
      </div>
      <div ref={body} className="scrollbar-thin h-[228px] overflow-y-auto px-4 py-3 leading-[1.7]">
        <p>
          <span className="text-accent">❯</span> <span className="text-fg">whoami --verbose</span>
        </p>
        {profile.terminal_lines.map((l, i) => (
          <m.p
            key={`${l.key}-${i}`}
            initial={animate ? { opacity: 0, x: -6 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.18, duration: 0.3 }}
            className="truncate"
          >
            <span className="text-accent-2">{l.key}</span>
            <span className="text-dim">: </span>
            <span className="text-fg">{l.value}</span>
          </m.p>
        ))}
        <p className="text-dim">
          <span className="text-muted">{T.hint[0]}</span> <span className="text-accent">{T.hint[1]}</span> <span className="text-muted">{T.hint[2]}</span>
        </p>
        {lines.map((l) => (
          <p key={l.id} className={cn('break-words whitespace-pre-wrap', l.kind === 'in' ? 'text-fg' : 'text-muted')}>
            {l.kind === 'in' && <span className="text-accent">❯ </span>}
            {l.content}
          </p>
        ))}
        <form onSubmit={submit} className="flex items-center gap-2">
          <span className="text-accent">❯</span>
          <label htmlFor="term-input" className="sr-only">
            {T.label}
          </label>
          <input
            id="term-input"
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            maxLength={40}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-fg caret-accent outline-none placeholder:text-dim"
            placeholder="help"
          />
        </form>
      </div>
    </div>
  )
}
