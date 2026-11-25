// Best scores live in the visitor's own browser only (a per-viewer convenience).
const KEY = 'az-playground-best'

type Scores = Partial<Record<'typing' | 'bugs' | 'memory', number>>

export function readBest(): Scores {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Scores
  } catch {
    return {}
  }
}

/** Saves if better. `lowerIsBetter` for move counts. Returns true when it's a new record. */
export function saveBest(game: keyof Scores, value: number, lowerIsBetter = false): boolean {
  try {
    const all = readBest()
    const prev = all[game]
    const better = prev === undefined || (lowerIsBetter ? value < prev : value > prev)
    if (better) localStorage.setItem(KEY, JSON.stringify({ ...all, [game]: value }))
    return better
  } catch {
    return false
  }
}
