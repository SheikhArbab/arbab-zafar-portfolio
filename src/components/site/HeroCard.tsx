import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { m } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { usePortfolio } from '@/data/PortfolioContext'
import { useT } from '@/i18n'
import { safeUrl } from '@/lib/utils'
import { useLiquidLens } from '@/lib/liquidGlass'
import { SkillIcon } from '@/components/site/SkillIcon'
import { SocialIcon, socialHref } from '@/components/ui/BrandIcons'

/** Small crisp tiles drifting behind the card: the glass rim visibly bends them as they pass. */
const TILE_SPOTS = [
  'left-[4%] top-[8%] [animation-delay:-2s]',
  'right-[6%] top-[4%] [animation-delay:-6s]',
  'left-[-2%] bottom-[30%] [animation-delay:-4s]',
  'right-[-1%] bottom-[38%] [animation-delay:-9s]',
  'left-[22%] bottom-[6%] [animation-delay:-1s]',
]

function useCardTilt(max = 6) {
  const ref = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setEnabled(fine.matches && !reduce.matches && (document.documentElement.dataset.motion ?? 'full') === 'full')
    update()
    fine.addEventListener('change', update)
    reduce.addEventListener('change', update)
    return () => {
      fine.removeEventListener('change', update)
      reduce.removeEventListener('change', update)
    }
  }, [])
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!enabled || !el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    // Plain transform (no preserve-3d) so the card's backdrop blur keeps working.
    el.style.transform = `perspective(1100px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`
  }
  const onPointerLeave = () => {
    if (ref.current) ref.current.style.transform = ''
  }
  return { ref, onPointerMove, onPointerLeave }
}

/** Hero visual: a liquid-glass profile card over drifting light. Everything shown comes from the profile. */
export function HeroCard({ animate }: { animate: boolean }) {
  const { data } = usePortfolio()
  const t = useT()
  const { profile, skills } = data
  const { ref, onPointerMove, onPointerLeave } = useCardTilt()
  useLiquidLens(ref, { strength: 26, bezel: 30, blur: 7 })

  const stack = skills.filter((s) => s.is_featured).slice(0, 6)
  const tiles = (stack.length ? stack : skills).slice(0, TILE_SPOTS.length)
  const socials = profile.socials.filter((s) => s.visible && ['github', 'linkedin'].includes(s.platform) && safeUrl(s.url))
  const initials = profile.full_name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="relative mx-auto flex w-full max-w-[520px] items-center justify-center py-10 lg:block lg:h-[600px] lg:py-0">
      {/* Light that the glass refracts */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="hero-blob absolute top-[6%] left-[10%] h-[46%] w-[46%] rounded-full bg-accent/45 blur-[60px]" />
        <div className="hero-blob absolute right-[4%] bottom-[14%] h-[50%] w-[50%] rounded-full bg-accent-2/40 blur-[70px] [animation-delay:-7s] [animation-duration:22s]" />
        <div className="hero-blob absolute top-[38%] left-[34%] h-[32%] w-[32%] rounded-full bg-[#a78bfa]/35 blur-[56px] [animation-delay:-12s] [animation-duration:26s]" />
        <div className="bg-grid-fine mask-radial absolute inset-[6%] opacity-80" />
        {tiles.map((s, i) => (
          <span key={s.id} className={`hero-tile glass glass-clear absolute grid h-12 w-12 place-items-center rounded-2xl ${TILE_SPOTS[i]}`}>
            <SkillIcon skill={s} className="h-6 w-6" />
          </span>
        ))}
      </div>

      <m.div
        initial={animate ? { opacity: 0, y: 24, scale: 0.97 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-[min(100%,23rem)] lg:absolute lg:top-2 lg:left-0"
      >
        <div
          ref={ref}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          className="glass relative rounded-[28px] p-6 transition-transform duration-300 ease-out [--glass-drop:0_40px_90px_-30px_rgb(0_0_0/0.85)] [--panel:rgb(14_19_20/0.38)] sm:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={t.about.portrait(profile.full_name)} className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/20" />
            ) : (
              <span
                aria-hidden
                className="grid h-16 w-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-xl font-semibold text-black shadow-[inset_0_1px_0_rgb(255_255_255/0.5)]"
              >
                {initials}
              </span>
            )}
            {profile.is_available && (
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/[0.08] px-2.5 py-1 font-mono text-[0.62rem] text-accent">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-accent" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                {t.common.available}
              </span>
            )}
          </div>

          <p className="mt-5 text-2xl font-semibold tracking-tight text-white">{profile.full_name}</p>
          <p className="mt-1 text-sm text-muted">{profile.title}</p>

          <div className="mt-4 flex flex-wrap gap-2 font-mono text-[0.65rem] text-muted">
            {profile.location && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                <MapPin className="h-3 w-3" /> {profile.location}
              </span>
            )}
            {profile.german.enabled && profile.german.level && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                🇩🇪 {t.cv.german} {profile.german.level} → {profile.german.goal}
              </span>
            )}
          </div>

          {stack.length > 0 && (
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="font-mono text-[0.6rem] tracking-[0.18em] text-dim uppercase">{t.skills.coreStack}</p>
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {stack.map((s) => (
                  <li key={s.id} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-fg">
                    <SkillIcon skill={s} className="h-3.5 w-3.5" />
                    {s.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {socials.length > 0 && (
            <div className="mt-5 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.platform}
                  href={safeUrl(socialHref(s.platform, s.url))}
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted transition-colors hover:border-accent/50 hover:text-accent"
                >
                  <SocialIcon platform={s.platform} className="h-4 w-4" />
                </a>
              ))}
              <span className="ml-auto font-mono text-[0.6rem] text-dim">{profile.short_name.toLowerCase()}.dev</span>
            </div>
          )}
        </div>
      </m.div>
    </div>
  )
}
