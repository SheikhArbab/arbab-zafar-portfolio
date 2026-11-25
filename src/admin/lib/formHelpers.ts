import type { FieldDef } from '../components/FormFields'
import { getPath } from './paths'
import { removeFile, type Bucket } from './storage'

/** "entry" → "entries", "category" → "categories", "role" → "roles". */
export function plural(word: string) {
  const w = word.toLowerCase()
  if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies'
  if (/(s|x|ch|sh)$/.test(w)) return w + 'es'
  return w + 's'
}

interface DbError {
  code?: string
  message: string
  details?: string | null
}

const humanize = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

/** Turn Postgres/PostgREST errors into messages an admin can act on. */
export function friendlyDbError(error: DbError, fields: FieldDef[]): string {
  const labelFor = (column: string) => fields.find((f) => f.name === column || f.name.split('.')[0] === column)?.label ?? humanize(column)
  const constraint = /constraint "([^"]+)"/.exec(error.message)?.[1] ?? ''
  switch (error.code) {
    case '23505': {
      // "Key (slug)=(x) already exists" or a constraint like "projects_slug_key".
      const col =
        /\(([^)]+)\)=/.exec(`${error.details ?? ''} ${error.message}`)?.[1] ??
        fields.find((f) => constraint.endsWith(`_${f.name}_key`))?.name ??
        'value'
      return `${labelFor(col)} must be unique: that value is already used.`
    }
    case '23502':
      return `${labelFor(/column "([^"]+)"/.exec(error.message)?.[1] ?? 'field')} is required.`
    case '23514': {
      if (constraint.endsWith('_dates_chk')) return 'End date must be on or after the start date.'
      // Column checks get Postgres' default name: <table>_<column>_check.
      const field = fields.find((f) => constraint.endsWith(`_${f.name.split('.')[0]}_check`))
      const label = field?.label ?? 'A value'
      if (field?.type === 'url') return `${label} must be a full link starting with https://`
      if (field?.type === 'email') return `${label} must be a valid email address.`
      if (field?.type === 'slug') return `${label} may only contain lowercase letters, numbers and dashes.`
      if (field?.type === 'color') return `${label} must be a hex colour like #3dff9a.`
      return `${label} is too long or not in an allowed format.`
    }
    case '22001':
      return 'One of the values is too long.'
    case '42501':
      return 'You are not allowed to make this change (admin access required).'
    default:
      return error.message
  }
}

/**
 * Storage objects that were replaced or removed by a save: image/file fields whose value changed.
 * Call only AFTER the save succeeded, so cancelling an edit never deletes a file still in use.
 */
export async function cleanupReplacedFiles(fields: FieldDef[], before: unknown, after: unknown) {
  for (const f of fields) {
    if (f.type !== 'image' && f.type !== 'file') continue
    const old = getPath(before, f.name)
    const now = getPath(after, f.name)
    if (typeof old === 'string' && old && old !== now) {
      const bucket: Bucket = f.bucket ?? (f.type === 'image' ? 'media' : 'documents')
      await removeFile(bucket, old)
    }
  }
}

/* Unsaved drafts survive the browser Back button / reloads (sessionStorage, this tab only). */
const DRAFT_PREFIX = 'az-draft:'

export function saveDraft(key: string, value: unknown) {
  try {
    sessionStorage.setItem(DRAFT_PREFIX + key, JSON.stringify(value))
  } catch {
    /* storage full or unavailable */
  }
}

export function loadDraft<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function clearDraft(key: string) {
  try {
    sessionStorage.removeItem(DRAFT_PREFIX + key)
  } catch {
    /* ignore */
  }
}
