import { useEffect, useRef } from 'react'

const INTERACTIVE = 'a, button, [role="button"], [role="tab"], summary, label, select, [data-cursor="link"]'
const TEXT = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable="true"]'

/**
 * Accent cursor: a dot that sits exactly on the pointer and a ring that trails it and grows over
 * links and buttons. Only for a real mouse with motion enabled; touch, reduced motion and text
 * fields keep the system cursor.
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const root = document.documentElement
    if (!fine.matches || reduce.matches || root.dataset.motion === 'off') return
    const d = dot.current
    const r = ring.current
    if (!d || !r) return

    let x = -100
    let y = -100
    let rx = -100
    let ry = -100
    let raf = 0
    let visible = false
    let down = false
    let hover: 'link' | 'text' | '' = ''

    const state = () => (!visible ? 'hidden' : hover === 'text' ? 'text' : down ? 'down' : hover)
    const paint = () => {
      d.dataset.state = state()
      r.dataset.state = state()
    }
    const tick = () => {
      rx += (x - rx) * 0.2
      ry += (y - ry) * 0.2
      d.style.transform = `translate3d(${x}px, ${y}px, 0)`
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(tick) : 0
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x = e.clientX
      y = e.clientY
      if (!visible) {
        visible = true
        rx = x
        ry = y
        root.classList.add('custom-cursor')
      }
      const target = e.target as Element | null
      const next = target?.closest(TEXT) ? 'text' : target?.closest(INTERACTIVE) ? 'link' : ''
      if (next !== hover) hover = next
      paint()
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const onLeave = () => {
      visible = false
      paint()
    }
    const onDown = () => {
      down = true
      paint()
    }
    const onUp = () => {
      down = false
      paint()
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('pointerup', onUp)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerup', onUp)
      if (raf) cancelAnimationFrame(raf)
      root.classList.remove('custom-cursor')
    }
  }, [])

  return (
    <>
      <div ref={ring} aria-hidden className="cursor-ring" data-state="hidden" />
      <div ref={dot} aria-hidden className="cursor-dot" data-state="hidden" />
    </>
  )
}
