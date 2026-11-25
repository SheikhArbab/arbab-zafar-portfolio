/* Immutable get/set by dot-path, e.g. "content.hero.cta_cv". */
export function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj)
}

export function setPath<T>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split('.')
  const src = (obj ?? {}) as Record<string, unknown>
  return { ...src, [head]: rest.length ? setPath(src[head], rest.join('.'), value) : value } as T
}

export const deepEqual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
