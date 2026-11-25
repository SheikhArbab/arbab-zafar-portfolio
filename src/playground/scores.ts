// Best scores live in the visitor's own browser only (a per-viewer convenience).
const KEY = 'az-playground-best'
/** Fired on window whenever a best score changes (the playground tabs listen to it). */
export const BEST_EVENT = 'az:best-updated'

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
    // A score of 0 is never a personal best for "higher is better" games.
    if (!lowerIsBetter && value <= 0) return false
    const better = prev === undefined || (lowerIsBetter ? value < prev : value > prev)
    if (better) {
      localStorage.setItem(KEY, JSON.stringify({ ...all, [game]: value }))
      window.dispatchEvent(new Event(BEST_EVENT))
    }
    return better
  } catch {
    return false
  }
}
