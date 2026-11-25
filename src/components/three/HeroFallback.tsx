/** Static, zero-JS visual used during SSR, while WebGL loads, and on low-power / reduced-motion devices. */
export function HeroFallback({ animate = true }: { animate?: boolean }) {
  const spin = animate ? 'motion-safe:animate-[spin_60s_linear_infinite]' : ''
  const spinRev = animate ? 'motion-safe:animate-[spin_90s_linear_infinite_reverse]' : ''
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
      <div className="absolute h-[55%] w-[55%] rounded-full bg-accent/10 blur-3xl" />
      <svg viewBox="0 0 400 400" className="relative h-[86%] max-h-[520px] w-[86%] max-w-[520px]">
        <defs>
          <radialGradient id="hf-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.55" />
            <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="120" fill="url(#hf-core)" />
        <g className={spin} style={{ transformOrigin: '200px 200px' }}>
          <circle cx="200" cy="200" r="165" fill="none" stroke="var(--accent-2)" strokeOpacity="0.25" strokeDasharray="2 6" />
          <circle cx="365" cy="200" r="4" fill="var(--accent-2)" />
        </g>
        <g className={spinRev} style={{ transformOrigin: '200px 200px' }}>
          <ellipse cx="200" cy="200" rx="150" ry="58" fill="none" stroke="var(--accent)" strokeOpacity="0.35" transform="rotate(-24 200 200)" />
          <ellipse cx="200" cy="200" rx="150" ry="58" fill="none" stroke="var(--accent-2)" strokeOpacity="0.25" transform="rotate(38 200 200)" />
        </g>
        {/* Icosahedron-like wireframe */}
        <g fill="none" stroke="var(--accent)" strokeOpacity="0.8" strokeWidth="1">
          <polygon points="200,105 282,152 282,248 200,295 118,248 118,152" />
          <polyline points="200,105 200,200 282,248" />
          <polyline points="118,248 200,200 282,152" />
          <polyline points="118,152 200,200 200,295" />
          <polygon points="200,150 243,175 243,225 200,250 157,225 157,175" strokeOpacity="0.4" />
        </g>
        <circle cx="200" cy="200" r="6" fill="var(--accent)" />
      </svg>
    </div>
  )
}
