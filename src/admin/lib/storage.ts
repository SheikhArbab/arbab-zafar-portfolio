import { requireSupabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'

export type Bucket = 'media' | 'documents'

export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml']
export const DOC_TYPES = ['application/pdf']
export const MAX_IMAGE = 5 * 1024 * 1024
export const MAX_DOC = 10 * 1024 * 1024

export function validateFile(file: File, kind: 'image' | 'pdf' | 'any') {
  const types = kind === 'image' ? IMAGE_TYPES : kind === 'pdf' ? DOC_TYPES : [...IMAGE_TYPES, ...DOC_TYPES]
  const max = kind === 'image' ? MAX_IMAGE : MAX_DOC
  if (!types.includes(file.type)) return `Unsupported file type (${file.type || 'unknown'}).`
  if (file.size > max) return `File is too large (max ${Math.round(max / 1024 / 1024)} MB).`
  return null
}

export async function uploadFile(bucket: Bucket, folder: string, file: File) {
  const sb = requireSupabase()
  const dot = file.name.lastIndexOf('.')
  const ext = dot > -1 ? file.name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : 'bin'
  const base = slugify(dot > -1 ? file.name.slice(0, dot) : file.name) || 'file'
  const path = `${folder}/${Date.now().toString(36)}-${base}.${ext}`
  const { error } = await sb.storage.from(bucket).upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type })
  if (error) throw error
  const { data } = sb.storage.from(bucket).getPublicUrl(path)
  return { path, url: data.publicUrl }
}

/** Extract the object path if the URL points into one of our buckets. */
export function pathFromPublicUrl(url: string | null | undefined, bucket: Bucket) {
  if (!url) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length).split('?')[0])
}

export async function removeFile(bucket: Bucket, pathOrUrl: string | null | undefined) {
  const path = pathOrUrl?.startsWith('http') ? pathFromPublicUrl(pathOrUrl, bucket) : pathOrUrl
  if (!path) return
  const { error } = await requireSupabase().storage.from(bucket).remove([path])
  if (error) console.warn('[storage] remove failed', error)
}
