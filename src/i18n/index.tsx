import { useLocation } from 'react-router-dom'
import { en, type Dict } from './en'
import { de } from './de'

import { localeFromPath, localizePath, type Locale } from './paths'
export * from './paths'

const DICTS: Record<Locale, Dict> = { en, de }

export function dict(locale: Locale): Dict {
  return DICTS[locale]
}

export function useLocale(): Locale {
  return localeFromPath(useLocation().pathname)
}

/** UI strings for the current page's language. */
export function useT(): Dict {
  return DICTS[useLocale()]
}

/** Prefix an app path with the current language. */
export function useLocalePath() {
  const locale = useLocale()
  return (path: string) => localizePath(path, locale)
}

export const intlLocale = (l: Locale) => (l === 'de' ? 'de-DE' : 'en-GB')
export type { Dict }
