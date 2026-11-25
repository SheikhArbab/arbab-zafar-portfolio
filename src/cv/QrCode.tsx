import { useMemo } from 'react'
import qrcode from 'qrcode-generator'

/** QR code as a single SVG path (crisp at any print size, no innerHTML). */
export function QrCode({ value, className, title }: { value: string; className?: string; title?: string }) {
  const { size, d } = useMemo(() => {
    const qr = qrcode(0, 'M')
    qr.addData(value)
    qr.make()
    const n = qr.getModuleCount()
    let path = ''
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) if (qr.isDark(r, c)) path += `M${c + 2} ${r + 2}h1v1h-1z`
    }
    return { size: n + 4, d: path }
  }, [value])
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} role="img" aria-label={title} shapeRendering="crispEdges">
      {title && <title>{title}</title>}
      <rect width={size} height={size} fill="#fff" />
      <path d={d} fill="#111" />
    </svg>
  )
}
