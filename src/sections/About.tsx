import { usePortfolio } from '@/data/PortfolioContext'
import { paragraphs, pad } from '@/lib/utils'
import { SectionHeading } from '@/components/site/SectionHeading'
import { Reveal } from '@/components/site/Reveal'
import { SpotlightCard } from '@/components/site/SpotlightCard'

function IdentityVisual({ image, name }: { image: string | null; name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
  return (
    <div className="hud relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line bg-elev">
      {image ? (
        <img src={image} alt={`Portrait of ${name}`} loading="lazy" decoding="async" className="h-full w-full object-cover grayscale-[35%] transition duration-700 hover:grayscale-0" />
      ) : (
        <div className="bg-grid-fine relative flex h-full w-full items-center justify-center">
          <div className="absolute h-40 w-40 rounded-full bg-accent/15 blur-3xl" />
          <span className="relative font-mono text-7xl font-semibold tracking-tighter text-white/90">{initials}</span>
        </div>
      )}
      {/* scanline */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="h-1/3 w-full animate-scan bg-gradient-to-b from-transparent via-accent/[0.07] to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 to-transparent px-4 pt-10 pb-3 font-mono text-[0.65rem] text-muted">
        <span>id://{name.toLowerCase().replace(/\s+/g, '.')}</span>
        <span className="text-accent">● verified</span>
      </div>
    </div>
  )
}

export function About({ index }: { index: number }) {
  const { data } = usePortfolio()
  const { profile, settings } = data
  const copy = settings.content.about
  const body = paragraphs(profile.about_body)

  return (
    <section id="about" aria-labelledby="about-title" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading id="about-title" index={index} eyebrow={copy.eyebrow} heading={profile.about_heading || copy.heading} description={copy.description} />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal className="mx-auto w-full max-w-sm lg:max-w-none">
            <IdentityVisual image={profile.about_image_url || profile.avatar_url} name={profile.full_name} />
          </Reveal>

          <div>
            <Reveal>
              <p className="text-xl leading-relaxed font-medium text-pretty text-white md:text-2xl">{profile.about_lead}</p>
            </Reveal>
            <div className="mt-6 space-y-5">
              {body.map((p, i) => (
                <Reveal key={i} delay={0.05 * i}>
                  <p className="leading-relaxed text-pretty text-muted md:text-[1.05rem]">{p}</p>
                </Reveal>
              ))}
            </div>

            {profile.about_highlights.length > 0 && (
              <Reveal delay={0.1}>
                <dl className="mt-10 grid grid-cols-2 overflow-hidden rounded-xl border border-line sm:grid-cols-4">
                  {profile.about_highlights.map((h, i) => (
                    <div key={i} className="border-line p-4 [&:not(:last-child)]:border-r max-sm:[&:nth-child(2)]:border-r-0 max-sm:[&:nth-child(-n+2)]:border-b">
                      <dt className="font-mono text-[0.62rem] tracking-[0.16em] text-dim uppercase">{h.label}</dt>
                      <dd className="mt-1.5 text-sm font-medium text-white">{h.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}
          </div>
        </div>

        {profile.about_cards.length > 0 && (
          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {profile.about_cards.map((card, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <SpotlightCard className="h-full p-6">
                  <p className="font-mono text-xs text-accent">{pad(i + 1)} /</p>
                  <h3 className="mt-4 text-lg font-semibold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{card.body}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
