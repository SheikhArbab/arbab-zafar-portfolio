import { useEffect, type RefObject } from 'react'

/*
 * Liquid glass, part 2 (part 1 is the .glass material in index.css).
 *
 * Real refraction: each lens gets an SVG filter whose displacement map is generated for the element's
 * exact size and corner radius. Pixels in the rim ("bezel") sample the backdrop further inward, the way
 * light bends through the curved edge of a glass slab, while the centre stays clear.
 *
 * backdrop-filter: url(#svg-filter) only renders in Chromium, so other browsers keep the plain material.
 */

const NS = 'http://www.w3.org/2000/svg'
let supported: boolean | null = null
let counter = 0

export function canRefract(): boolean {
  if (supported !== null) return supported
  if (typeof window === 'undefined') return false
  const nav = navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }
  const chromium = Boolean(nav.userAgentData?.brands?.some((b) => /Chromium/i.test(b.brand)))
  const reduced = window.matchMedia?.('(prefers-reduced-transparency: reduce)').matches
  supported = chromium && !reduced && CSS.supports('backdrop-filter', 'url(#a) blur(1px)')
  return supported
}

function filterHost(): SVGSVGElement {
  let svg = document.getElementById('liquid-glass-filters') as SVGSVGElement | null
  if (!svg) {
    svg = document.createElementNS(NS, 'svg')
    svg.id = 'liquid-glass-filters'
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none'
    document.body.appendChild(svg)
  }
  return svg
}

/** Displacement map (R = x, G = y, 128 = no shift) for a rounded rectangle lens. */
function lensMap(w: number, h: number, radius: number, bezel: number): string {
  const scale = 0.5 // the map is smooth: half resolution is plenty
  const cw = Math.max(2, Math.round(w * scale))
  const ch = Math.max(2, Math.round(h * scale))
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const img = ctx.createImageData(cw, ch)
  const r = Math.min(radius, w / 2, h / 2)
  const hw = w / 2
  const hh = h / 2
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const px = (x + 0.5) / scale - hw
      const py = (y + 0.5) / scale - hh
      // Signed distance to the rounded-rect edge (positive inside) and the outward normal.
      const qx = Math.abs(px) - (hw - r)
      const qy = Math.abs(py) - (hh - r)
      const ox = Math.max(qx, 0)
      const oy = Math.max(qy, 0)
      const corner = Math.hypot(ox, oy)
      const dist = r - (corner + Math.min(Math.max(qx, qy), 0))
      let nx = 0
      let ny = 0
      if (qx > 0 && qy > 0 && corner > 0) {
        nx = ox / corner
        ny = oy / corner
      } else if (qx > qy) nx = 1
      else ny = 1
      nx *= px < 0 ? -1 : 1
      ny *= py < 0 ? -1 : 1
      // 0 inside the clear centre → 1 at the very edge; squared for a convex, glassy falloff.
      const t = Math.min(1, Math.max(0, 1 - dist / bezel))
      const mag = t * t
      const i = (y * cw + x) * 4
      img.data[i] = 128 - nx * mag * 127 // sample inward: the rim shows a squeezed view of the inside
      img.data[i + 1] = 128 - ny * mag * 127
      img.data[i + 2] = 128
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return canvas.toDataURL('image/png')
}

interface LensOptions {
  /** Max sample shift at the rim, in px. */
  strength?: number
  /** Width of the curved rim, in px (clamped to the element size). */
  bezel?: number
  /** Blur applied after refraction (px). Lower = clearer glass. */
  blur?: number
  enabled?: boolean
}

/**
 * Adds edge refraction to a .glass element (Chromium only; no-op elsewhere and during SSR).
 * The filter is rebuilt when the element is resized.
 */
export function useLiquidLens<T extends HTMLElement>(ref: RefObject<T | null>, { strength = 18, bezel = 22, blur = 4, enabled = true }: LensOptions = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled || !canRefract()) return
    const id = `liquid-lens-${++counter}`
    const filter = document.createElementNS(NS, 'filter')
    filter.id = id
    filter.setAttribute('color-interpolation-filters', 'sRGB')
    filter.setAttribute('filterUnits', 'userSpaceOnUse')
    filter.setAttribute('primitiveUnits', 'userSpaceOnUse')
    const image = document.createElementNS(NS, 'feImage')
    image.setAttribute('preserveAspectRatio', 'none')
    image.setAttribute('result', 'map')
    const displace = document.createElementNS(NS, 'feDisplacementMap')
    displace.setAttribute('in', 'SourceGraphic')
    displace.setAttribute('in2', 'map')
    displace.setAttribute('xChannelSelector', 'R')
    displace.setAttribute('yChannelSelector', 'G')
    displace.setAttribute('scale', String(strength * 2))
    filter.append(image, displace)
    filterHost().appendChild(filter)

    let lastKey = ''
    const build = () => {
      const w = Math.round(el.offsetWidth)
      const h = Math.round(el.offsetHeight)
      if (w < 8 || h < 8) return
      const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0
      const key = `${w}x${h}r${radius}`
      if (key === lastKey) return
      lastKey = key
      for (const node of [filter, image]) {
        node.setAttribute('x', '0')
        node.setAttribute('y', '0')
        node.setAttribute('width', String(w))
        node.setAttribute('height', String(h))
      }
      image.setAttribute('href', lensMap(w, h, radius, Math.min(bezel, w / 3, h / 3)))
      el.style.setProperty('backdrop-filter', `url(#${id}) blur(${blur}px) saturate(185%) brightness(1.06)`)
    }
    build()
    const ro = new ResizeObserver(build)
    ro.observe(el)
    return () => {
      ro.disconnect()
      filter.remove()
      el.style.removeProperty('backdrop-filter')
    }
  }, [ref, strength, bezel, blur, enabled])
}

/** Moves the sheen of the .glass surface under the pointer (desktop pointers only). */
export function useGlassSheen() {
  useEffect(() => {
    if (!window.matchMedia?.('(pointer: fine)').matches) return
    let raf = 0
    let event: PointerEvent | null = null
    let current: HTMLElement | null = null
    const reset = (el: HTMLElement) => {
      el.style.removeProperty('--lx')
      el.style.removeProperty('--ly')
    }
    const apply = () => {
      raf = 0
      if (!event) return
      const target = (event.target as Element | null)?.closest?.<HTMLElement>('.glass') ?? null
      if (current && current !== target) reset(current)
      current = target
      if (!target) return
      const r = target.getBoundingClientRect()
      target.style.setProperty('--lx', `${(((event.clientX - r.left) / r.width) * 100).toFixed(1)}%`)
      target.style.setProperty('--ly', `${(((event.clientY - r.top) / r.height) * 100 - 30).toFixed(1)}%`)
    }
    const onMove = (e: PointerEvent) => {
      event = e
      if (!raf) raf = requestAnimationFrame(apply)
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      document.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
      if (current) reset(current)
    }
  }, [])
}
