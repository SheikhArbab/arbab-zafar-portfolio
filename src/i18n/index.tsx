import { createContext, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { en, type Dict } from './en'
import { de } from './de'
import { applyOverrides, type UiOverrides } from './overrides'

import { localeFromPath, localizePath, type Locale } from './paths'
export * from './paths'

const DICTS: Record<Locale, Dict> = { en, de }

export type UiText = Partial<Record<Locale, UiOverrides>>

/** Built-in interface text (no admin overrides): for places outside the app's data, e.g. error screens. */
export function dict(locale: Locale): Dict {
  return DICTS[locale]
}

/** Interface text with the admin's overrides (site_settings.ui_text) applied. */
export function dictFor(data: { settings: { ui_text?: UiText | null } }, locale: Locale): Dict {
  return applyOverrides(DICTS[locale], data.settings.ui_text?.[locale])
}

/** Admin overrides for the interface text; provided by PortfolioProvider. */
export const UiTextContext = createContext<UiText | null>(null)

export function useLocale(): Locale {
  return localeFromPath(useLocation().pathname)
}

/** UI strings for the current page's language, including the admin's edits. */
export function useT(): Dict {
  const locale = useLocale()
  return applyOverrides(DICTS[locale], useContext(UiTextContext)?.[locale])
}

/** Prefix an app path with the current language. */
export function useLocalePath() {
  const locale = useLocale()
  return (path: string) => localizePath(path, locale)
}

export const intlLocale = (l: Locale) => (l === 'de' ? 'de-DE' : 'en-GB')
export type { Dict }
