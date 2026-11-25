/* Locale path helpers (no React): shared by the app, the SSR entry and the prerender script. */
export type Locale = 'en' | 'de'
export const LOCALES: Locale[] = ['en', 'de']

/** English lives at the root, German under /de. */
export function localeFromPath(pathname: string): Locale {
  return pathname === '/de' || pathname.startsWith('/de/') ? 'de' : 'en'
}

/** "/de/projects/x" → "/projects/x", "/de" → "/". */
export function stripLocale(pathname: string): string {
  if (pathname === '/de') return '/'
  return pathname.startsWith('/de/') ? pathname.slice(3) : pathname
}

/** "/projects/x" + de → "/de/projects/x"; "/" + de → "/de"; "/#about" + de → "/de#about". */
export function localizePath(path: string, locale: Locale): string {
  const p = path.startsWith('/') ? path : `/${path}`
  const [, pathname = '/', rest = ''] = /^([^?#]*)(.*)$/.exec(p) ?? []
  const base = stripLocale(pathname || '/')
  if (locale === 'en') return base + rest
  return (base === '/' ? '/de' : `/de${base}`) + rest
}

