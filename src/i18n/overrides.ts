import type { Dict } from './en'

/**
 * Admin-editable interface text.
 * The dictionaries in en.ts / de.ts are the defaults; /admin → Interface text stores overrides as
 * { "<path>": "<text>" } per language (e.g. "hero.scroll", "terminal.hint.0", "cv.pageTitle").
 * Texts that take values (functions in the dictionary) are edited as templates with {1}, {2}, …
 */

export type UiOverrides = Record<string, string>
type Fn = (...args: unknown[]) => string

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Placeholders a template text can use, in argument order. */
const MARKERS = ['{1}', '{2}', '{3}', '{4}']

/** Default text of a dictionary function, with {1}, {2}, … where its values go. */
export function templateOf(fn: Fn): string {
  return fn(...MARKERS)
}

/** Turns an edited template back into a function the components can call. */
export function fromTemplate(tpl: string): Fn {
  return (...args: unknown[]) => tpl.replace(/\{([1-4])\}/g, (m, i: string) => (args[Number(i) - 1] === undefined ? m : String(args[Number(i) - 1])))
}

export interface UiEntry {
  path: string
  /** Default text (templates show {1}, {2} …). */
  value: string
  template: boolean
}

/** Every editable leaf of a dictionary, in display order. */
export function flattenDict(d: Dict): UiEntry[] {
  const out: UiEntry[] = []
  const walk = (node: unknown, path: string) => {
    if (typeof node === 'string') out.push({ path, value: node, template: false })
    else if (typeof node === 'function') out.push({ path, value: templateOf(node as Fn), template: true })
    else if (Array.isArray(node)) node.forEach((v, i) => walk(v, `${path}.${i}`))
    else if (isObject(node)) for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k)
  }
  walk(d, '')
  return out
}

const cache = new WeakMap<UiOverrides, Map<Dict, Dict>>()

/** The dictionary with the admin's overrides applied (empty overrides keep the default). */
export function applyOverrides(base: Dict, overrides: UiOverrides | null | undefined): Dict {
  if (!overrides || !Object.keys(overrides).length) return base
  const perBase = cache.get(overrides) ?? new Map<Dict, Dict>()
  const hit = perBase.get(base)
  if (hit) return hit
  const walk = (node: unknown, path: string): unknown => {
    const o = overrides[path]
    const has = typeof o === 'string' && o.trim() !== ''
    if (typeof node === 'string') return has ? o : node
    if (typeof node === 'function') return has ? fromTemplate(o as string) : node
    if (Array.isArray(node)) return node.map((v, i) => walk(v, `${path}.${i}`))
    if (isObject(node)) return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, walk(v, path ? `${path}.${k}` : k)]))
    return node
  }
  const result = walk(base, '') as Dict
  perBase.set(base, result)
  cache.set(overrides, perBase)
  return result
}
