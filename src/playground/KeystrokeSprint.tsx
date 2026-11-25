import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { cn } from '@/lib/utils'
import { GameFrame, ResultPanel, Stat } from './GameFrame'
import { readBest, saveBest } from './scores'

/** Keystroke Sprint: type real developer one-liners against a 30-second clock. */

const SNIPPETS = [
  'git commit -m "ship it"',
  'npm run build && npm run preview',
  'const [count, setCount] = useState(0)',
  'await fetch("/api/contact", { method: "POST" })',
  'SELECT title FROM projects WHERE is_published = true;',
  'docker compose up -d',
  'export default function App() {}',
  'router.get("/api/projects", getProjects)',
  'git checkout -b feature/playground',
  'type Props = { title: string }',
  'useEffect(() => setReady(true), [])',
  'ng generate component dashboard',
  'const total = items.reduce((a, b) => a + b, 0)',
  'console.log("hello, world")',
  'app.listen(3000, () => console.log("up"))',
  'dispatch(addTodo({ id, text }))',
  'npx supabase db push',
  'flex items-center justify-between gap-4',
  'if (!user) return res.status(401).end()',
  'const sum = (a: number, b: number) => a + b',
]

const DURATION = 30

function shuffled<T>(arr: T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type Status = 'idle' | 'running' | 'done'

export default function KeystrokeSprint() {
  const [queue, setQueue] = useState<string[]>(() => shuffled(SNIPPETS))
  const [line, setLine] = useState(0)
  const [typed, setTyped] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [correct, setCorrect] = useState(0) // correctly typed characters (completed lines + current progress)
  const [errors, setErrors] = useState(0)
  const [lines, setLines] = useState(0)
  const [record, setRecord] = useState(false)
  const [finalWpm, setFinalWpm] = useState(0)
  const [best, setBest] = useState<number | undefined>(undefined)
  const startedAt = useRef(0)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setBest(readBest().typing)
  }, [])

  const target = queue[line % queue.length]
  const doneChars = useRef(0) // chars from completed lines
  const currentCorrect = (() => {
    let n = 0
    while (n < typed.length && typed[n] === target[n]) n++
    return n
  })()

  const elapsedMin = Math.max((DURATION - timeLeft) / 60, 1 / 60)
  const wpm = Math.round((correct + currentCorrect) / 5 / elapsedMin)
  const accuracy = correct + currentCorrect + errors === 0 ? 100 : Math.round(((correct + currentCorrect) / (correct + currentCorrect + errors)) * 100)

  // The ticking interval must survive keystrokes, so it reads the live progress from a ref.
  const progressRef = useRef(0)
  progressRef.current = currentCorrect

  const finish = useCallback(() => {
    setStatus('done')
    const result = Math.round((doneChars.current + progressRef.current) / 5 / (DURATION / 60))
    setFinalWpm(result)
    setRecord(saveBest('typing', result))
    setBest(readBest().typing)
  }, [])

  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(() => {
      const left = Math.max(0, DURATION - (Date.now() - startedAt.current) / 1000)
      setTimeLeft(Math.ceil(left))
      if (left <= 0) {
        clearInterval(id)
        finish()
      }
    }, 100)
    return () => clearInterval(id)
  }, [status, finish])

  const reset = () => {
    setQueue(shuffled(SNIPPETS))
    setLine(0)
    setTyped('')
    setStatus('idle')
    setTimeLeft(DURATION)
    setCorrect(0)
    setErrors(0)
    setLines(0)
    setRecord(false)
    doneChars.current = 0
    setTimeout(() => input.current?.focus(), 0)
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (status === 'done') return
    const value = e.target.value
    if (status === 'idle') {
      startedAt.current = Date.now()
      setStatus('running')
    }
    // Count a mistake when a newly added character doesn't match the target.
    if (value.length > typed.length) {
      const added = value.slice(typed.length)
      for (let k = 0; k < added.length; k++) {
        const pos = typed.length + k
        if (added[k] !== target[pos]) setErrors((x) => x + 1)
      }
    }
    if (value === target) {
      doneChars.current += target.length
      setCorrect((c) => c + target.length)
      setLines((n) => n + 1)
      setLine((l) => l + 1)
      setTyped('')
      return
    }
    setTyped(value.slice(0, target.length + 5))
  }

  return (
    <GameFrame
      title="keystroke-sprint.sh · 30s"
      hud={
        <>
          <Stat label="time" value={`${timeLeft}s`} accent={status === 'running'} />
          <Stat label="wpm" value={status === 'idle' ? '—' : wpm} />
          <Stat label="accuracy" value={status === 'idle' ? '—' : `${accuracy}%`} />
          <Stat label="best" value={best !== undefined ? `${best} wpm` : '—'} />
        </>
      }
      footer="Type the line exactly, including symbols. The timer starts on your first keystroke. Paste is disabled."
    >
      {status === 'done' ? (
        <ResultPanel
          title={`${finalWpm} words per minute`}
          lines={[
            ['lines', lines],
            ['accuracy', `${accuracy}%`],
            ['mistakes', errors],
          ]}
          record={record}
          onRetry={reset}
        />
      ) : (
        <div>
          <div className="mb-2 flex items-center justify-between font-mono text-[0.65rem] text-dim">
            <span>line {lines + 1}</span>
            <span>{status === 'idle' ? 'start typing to begin' : 'go go go'}</span>
          </div>
          <div
            className="rounded-xl border border-line bg-black/40 px-4 py-5 font-mono text-base leading-relaxed break-all whitespace-pre-wrap sm:text-lg"
            onClick={() => input.current?.focus()}
            aria-hidden
          >
            <span className="mr-2 text-accent select-none">❯</span>
            {target.split('').map((ch, k) => {
              const state = k < typed.length ? (typed[k] === ch ? 'ok' : 'bad') : k === typed.length ? 'cursor' : 'todo'
              return (
                <span
                  key={k}
                  className={cn(
                    state === 'ok' && 'text-accent',
                    state === 'bad' && 'rounded-sm bg-red-500/25 text-red-300',
                    state === 'cursor' && 'border-b-2 border-accent-2 text-fg',
                    state === 'todo' && 'text-dim',
                  )}
                >
                  {ch}
                </span>
              )
            })}
          </div>
          <p className="mt-2 truncate font-mono text-xs text-dim" aria-hidden>
            next: {queue[(line + 1) % queue.length]}
          </p>
          <label htmlFor="sprint-input" className="sr-only">
            Type this line: {target}
          </label>
          <input
            id="sprint-input"
            ref={input}
            value={typed}
            onChange={onChange}
            onPaste={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="type here…"
            className="mt-4 h-12 w-full rounded-lg border border-line-strong bg-black/30 px-4 font-mono text-fg placeholder:text-dim focus:border-accent/70 focus:outline-none"
          />
        </div>
      )}
    </GameFrame>
  )
}
