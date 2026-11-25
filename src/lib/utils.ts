import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Only allow http(s), mailto and tel links to be rendered. Blocks javascript: etc. */
export function safeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  const trimmed = url.trim()
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed
  return undefined
}

export function isExternal(url: string) {
  return /^https?:/i.test(url)
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function paragraphs(text: string | null | undefined): string[] {
  return (text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

const monthFmt = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' })

export function formatMonth(date: string | null | undefined) {
  if (!date) return ''
  const d = new Date(date)
  return Number.isNaN(d.getTime()) ? '' : monthFmt.format(d)
}

export function dateRange(start: string | null, end: string | null, current: boolean) {
  const s = formatMonth(start)
  const e = current ? 'Present' : formatMonth(end)
  if (!s && !e) return current ? 'Present' : ''
  if (!s) return e
  return `${s} — ${e || 'Present'}`
}

export function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let n = bytes
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024
    i++
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}

export function pad(n: number, len = 2) {
  return String(n).padStart(len, '0')
}


/** Human label for a project's "live" link based on where it points. */
export function liveLinkLabel(url: string) {
  if (/linkedin\.com/i.test(url)) return 'View on LinkedIn'
  if (/apps\.apple\.com/i.test(url)) return 'App Store'
  if (/play\.google\.com/i.test(url)) return 'Google Play'
  if (/youtu\.?be/i.test(url)) return 'Watch demo'
  return 'Live demo'
}
