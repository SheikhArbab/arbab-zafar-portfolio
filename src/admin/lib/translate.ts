import type { FieldDef } from '../components/FormFields'
import { getPath } from './paths'

export type EditLang = 'en' | 'de'

/** Where German overrides live on a row: translations.de.<field path>. */
export const dePath = (name: string) => `translations.de.${name}`

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)

function englishText(v: unknown): string {
  if (typeof v === 'string') return v
  if (Array.isArray(v) && v.every((x) => typeof x === 'string')) return v.join(' · ')
  return ''
}

/**
 * German counterparts of the translatable fields: same control, bound to translations.de.<field>,
 * never required (an empty field falls back to English), with the English text shown as reference.
 */
export function deFields(fields: FieldDef[], translatable: string[], values: Record<string, unknown>): FieldDef[] {
  return fields
    .filter((f) => translatable.includes(f.name))
    .map((f) => {
      const en = englishText(getPath(values, f.name))
      return {
        ...f,
        name: dePath(f.name),
        type: f.type === 'select' ? 'text' : f.type,
        options: undefined,
        required: false,
        from: undefined,
        placeholder: f.type === 'repeater' ? f.placeholder : 'Empty: the English text is shown',
        help: en ? `EN: ${clip(en, 220)}` : f.type === 'repeater' ? 'Empty: the English items are shown.' : undefined,
      }
    })
}

const filled = (v: unknown) => v != null && v !== '' && !(Array.isArray(v) && v.length === 0)

/** How many of the translatable fields have a German value. */
export function translationProgress(translatable: string[], values: Record<string, unknown>) {
  return { done: translatable.filter((n) => filled(getPath(values, dePath(n)))).length, total: translatable.length }
}
