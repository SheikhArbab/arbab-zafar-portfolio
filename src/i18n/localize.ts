import type { PortfolioData } from '@/types/content'
import type { Locale } from './paths'

type Row = Record<string, unknown> & { translations?: Record<string, Record<string, unknown>> | null }

const filled = (v: unknown) => v !== undefined && v !== null && !(typeof v === 'string' && v.trim() === '') && !(Array.isArray(v) && v.length === 0)

const isPlainObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Deep-merge `over` onto `base`, ignoring empty values so missing translations fall back to English. */
function overlay<T>(base: T, over: unknown): T {
  if (!isPlainObject(over)) return base
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const [k, v] of Object.entries(over)) {
    if (!filled(v)) continue
    out[k] = isPlainObject(v) && isPlainObject(out[k]) ? overlay(out[k], v) : v
  }
  return out as T
}

function localizeRow<T>(row: T, locale: Locale): T {
  if (locale === 'en') return row
  const t = (row as Row).translations?.[locale]
  return t ? overlay(row, t) : row
}

/** Returns the portfolio data with the requested language overlaid on the English base. */
export function localizeData(data: PortfolioData, locale: Locale): PortfolioData {
  if (locale === 'en') return data
  return {
    ...data,
    profile: localizeRow(data.profile, locale),
    settings: localizeRow(data.settings, locale),
    experiences: data.experiences.map((r) => localizeRow(r, locale)),
    categories: data.categories.map((r) => localizeRow(r, locale)),
    projects: data.projects.map((r) => localizeRow(r, locale)),
    education: data.education.map((r) => localizeRow(r, locale)),
    documents: data.documents.map((r) => localizeRow(r, locale)),
  }
}
