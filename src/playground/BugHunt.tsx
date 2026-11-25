import { useCallback, useEffect, useRef, useState } from 'react'
import { Bug, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GameFrame, ResultPanel, Stat } from './GameFrame'
import { readBest, saveBest } from './scores'
import { useT } from '@/i18n'

/**
 * Bug Hunt: bugs surface in random modules; squash them before they ship.
 * Green checks are working features. Hitting one breaks your combo.
 */

const CELLS = 16
const DURATION = 30_000

type Kind = 'bug' | 'feature'
interface Spawn {
  id: number
  kind: Kind
  expires: number
}
type Status = 'idle' | 'running' | 'done'

let uid = 0

export default function BugHunt() {
  const t = useT()
  const G = t.games.bugs
  const [cells, setCells] = useState<(Spawn | null)[]>(() => Array(CELLS).fill(null))
  const [status, setStatus] = useState<Status>('idle')
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [squashed, setSquashed] = useState(0)
  const [missed, setMissed] = useState(0)
  const [broken, setBroken] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION / 1000)
  const [flash, setFlash] = useState<{ cell: number; kind: 'hit' | 'oops' } | null>(null)
  const [record, setRecord] = useState(false)
  const [best, setBest] = useState<number | undefined>(undefined)
  const startedAt = useRef(0)
  const nextSpawn = useRef(0)
  const scoreRef = useRef(0)
  const cellsRef = useRef<(Spawn | null)[]>(Array(CELLS).fill(null))

  useEffect(() => {
    setBest(readBest().bugs)
  }, [])

  const end = useCallback(() => {
    setStatus('done')
    cellsRef.current = Array(CELLS).fill(null)
    setCells(cellsRef.current)
    setRecord(saveBest('bugs', scoreRef.current))
    setBest(readBest().bugs)
  }, [])

  // Game loop: expire old spawns, spawn new ones, faster as time runs out.
  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(() => {
      const now = Date.now()
      const elapsed = now - startedAt.current
      const progress = Math.min(elapsed / DURATION, 1)
      setTimeLeft(Math.max(0, Math.ceil((DURATION - elapsed) / 1000)))
      if (elapsed >= DURATION) return end()

      // cellsRef is the source of truth; state mirrors it for rendering (no side effects in updaters).
      let missedNow = 0
      const next = cellsRef.current.map((c) => {
        if (c && c.expires <= now) {
          if (c.kind === 'bug') missedNow++
          return null
        }
        return c
      })
      if (now >= nextSpawn.current) {
        const empty = next.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0)
        if (empty.length) {
          const cell = empty[Math.floor(Math.random() * empty.length)]
          const kind: Kind = Math.random() < 0.18 ? 'feature' : 'bug'
          const life = 1300 - progress * 650
          next[cell] = { id: ++uid, kind, expires: now + life }
        }
        nextSpawn.current = now + (720 - progress * 360) * (0.75 + Math.random() * 0.5)
      }
      if (missedNow) {
        setMissed((m) => m + missedNow)
        setCombo(0)
      }
      cellsRef.current = next
      setCells(next)
    }, 50)
    return () => clearInterval(id)
  }, [status, end])

  const start = () => {
    cellsRef.current = Array(CELLS).fill(null)
    setCells(cellsRef.current)
    setScore(0)
    scoreRef.current = 0
    setCombo(0)
    setSquashed(0)
    setMissed(0)
    setBroken(0)
    setRecord(false)
    setTimeLeft(DURATION / 1000)
    startedAt.current = Date.now()
    nextSpawn.current = Date.now() + 400
    setStatus('running')
    // The start button disappears; keep keyboard users on the board.
    setTimeout(() => {
      document.querySelector<HTMLButtonElement>('[data-bug-cell="0"]')?.focus()
    }, 0)
  }

  const hit = (i: number) => {
    if (status !== 'running') return
    const c = cellsRef.current[i]
    if (!c) return
    if (c.kind === 'bug') {
      const multiplier = 1 + Math.floor(combo / 5)
      scoreRef.current += 10 * multiplier
      setScore(scoreRef.current)
      setCombo((x) => x + 1)
      setSquashed((x) => x + 1)
      setFlash({ cell: i, kind: 'hit' })
    } else {
      scoreRef.current = Math.max(0, scoreRef.current - 15)
      setScore(scoreRef.current)
      setCombo(0)
      setBroken((x) => x + 1)
      setFlash({ cell: i, kind: 'oops' })
    }
    cellsRef.current = cellsRef.current.map((x, k) => (k === i ? null : x))
    setCells(cellsRef.current)
    setTimeout(() => setFlash((f) => (f?.cell === i ? null : f)), 220)
  }

  const multiplier = 1 + Math.floor(combo / 5)
  const accuracy = squashed + missed + broken === 0 ? 100 : Math.round((squashed / (squashed + missed + broken)) * 100)

  return (
    <GameFrame
      title={G.title}
      hud={
        <>
          <Stat label={t.games.time} value={`${timeLeft}s`} accent={status === 'running'} />
          <Stat label={G.score} value={score} />
          <Stat label={G.combo} value={multiplier > 1 ? `x${multiplier}` : combo} />
          <Stat label={t.games.best} value={best ?? '—'} />
        </>
      }
      footer={G.footer}
    >
      {status === 'done' ? (
        <ResultPanel
          title={G.result(score)}
          lines={[
            [G.squashed, squashed],
            [G.shipped, missed],
            [G.accuracy, `${accuracy}%`],
          ]}
          record={record}
          onRetry={start}
        />
      ) : (
        <div className="relative">
          <div className={cn('mx-auto grid max-w-md grid-cols-4 gap-2.5', status === 'idle' && 'opacity-40 blur-[1px]')}>
            {cells.map((c, i) => (
              <button
                key={i}
                data-bug-cell={i}
                onPointerDown={(e) => {
                  e.preventDefault()
                  hit(i)
                }}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && hit(i)}
                disabled={status !== 'running'}
                aria-label={c ? (c.kind === 'bug' ? G.bugIn(i + 1) : G.featureIn(i + 1)) : G.module(i + 1)}
                className={cn(
                  'relative grid aspect-square place-items-center rounded-xl border font-mono text-[0.6rem] transition-all duration-150 select-none',
                  !c && 'border-line bg-black/30 text-dim',
                  c?.kind === 'bug' && 'scale-[1.02] border-red-400/50 bg-red-500/10 text-red-300',
                  c?.kind === 'feature' && 'border-accent/40 bg-accent/[0.08] text-accent',
                  flash?.cell === i && flash.kind === 'hit' && 'border-accent bg-accent/20',
                  flash?.cell === i && flash.kind === 'oops' && 'animate-pulse border-amber-300 bg-amber-300/20',
                )}
              >
                {c?.kind === 'bug' && <Bug className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />}
                {c?.kind === 'feature' && <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />}
                {!c && <span aria-hidden>mod_{String(i + 1).padStart(2, '0')}</span>}
              </button>
            ))}
          </div>
          {status === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="font-mono text-xs text-accent">{G.fire}</p>
              <p className="mt-1 text-lg font-semibold text-white">{G.headline}</p>
              <button onClick={start} className="mt-5 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-black transition hover:shadow-[0_0_24px_-4px_var(--accent)]">
                {G.start}
              </button>
            </div>
          )}
        </div>
      )}
    </GameFrame>
  )
}
