import type { ReactNode } from 'react'
import type { CvModel } from './model'
import { QrCode } from './QrCode'

/*
 * Paper-first templates: fixed A4 width, print-safe colours, real links (clickable in the PDF).
 * Sizes are in pt/mm so the PDF looks the same on every screen.
 */

const INK = 'text-[#16201d]'
const MUTED = 'text-[#56625e]'
const ACCENT = 'text-[#0f766e]'

function Links({ text, href }: { text: string; href?: string }) {
  return href ? (
    <a href={href} className="break-words underline decoration-[#0f766e]/40 underline-offset-2" target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
      {text}
    </a>
  ) : (
    <span className="break-words">{text}</span>
  )
}

function Avatar({ m, className }: { m: CvModel; className: string }) {
  const t = m.t.cv
  return m.photo ? (
    <img src={m.photo} alt={t.photo(m.name)} className={`${className} object-cover`} />
  ) : (
    <div aria-hidden className={`${className} grid place-items-center bg-[#0f766e] text-[20pt] font-semibold text-white`}>
      {m.initials}
    </div>
  )
}

/* ───────────────────────────── Modern ───────────────────────────── */

function SideHeading({ children }: { children: ReactNode }) {
  return <h2 className={`mb-[2.5mm] text-[7.5pt] font-semibold tracking-[0.16em] uppercase ${ACCENT}`}>{children}</h2>
}

function MainHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className={`mb-[3mm] flex items-center gap-[3mm] text-[8pt] font-semibold tracking-[0.18em] uppercase ${ACCENT}`}>
      {children}
      <span className="h-px flex-1 bg-[#0f766e]/25" />
    </h2>
  )
}

export function ModernCv({ m }: { m: CvModel }) {
  const t = m.t.cv
  return (
    <article lang={m.locale} className={`cv-sheet grid grid-cols-[64mm_1fr] bg-white text-[9pt] leading-[1.45] ${INK}`}>
      <aside className="space-y-[6.5mm] bg-[#eef3f1] px-[8mm] py-[12mm]">
        <Avatar m={m} className="h-[30mm] w-[30mm] rounded-full" />
        <section>
          <SideHeading>{t.contact}</SideHeading>
          <ul className="space-y-[1.8mm] text-[8.2pt]">
            {m.contact.map((c) => (
              <li key={c.label + c.value}>
                <p className={`text-[6.8pt] tracking-[0.08em] uppercase ${MUTED}`}>{c.label}</p>
                <Links text={c.value} href={c.href} />
              </li>
            ))}
          </ul>
        </section>
        {m.personal.length > 0 && (
          <section>
            <SideHeading>{t.personal}</SideHeading>
            <ul className="space-y-[1.4mm] text-[8.2pt]">
              {m.personal.map((p) => (
                <li key={p.label}>
                  <span className={MUTED}>{p.label}: </span>
                  {p.value}
                </li>
              ))}
            </ul>
          </section>
        )}
        {m.skills.length > 0 && (
          <section>
            <SideHeading>{t.skills}</SideHeading>
            <div className="space-y-[2.4mm]">
              {m.skills.map((g) => (
                <div key={g.group} className="break-inside-avoid">
                  <p className="text-[7.8pt] font-semibold">{g.group}</p>
                  <p className={`text-[8pt] ${MUTED}`}>{g.items.join(' · ')}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {m.languages.length > 0 && (
          <section>
            <SideHeading>{t.languages}</SideHeading>
            <ul className="space-y-[1.4mm] text-[8.2pt]">
              {m.languages.map((l) => (
                <li key={l.name}>
                  <span className="font-semibold">{l.name}</span>
                  {l.level && <span className={MUTED}>: {l.level}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
        {m.interests.length > 0 && (
          <section>
            <SideHeading>{t.interests}</SideHeading>
            <p className="text-[8.2pt]">{m.interests.join(' · ')}</p>
          </section>
        )}
        {m.showQr && (
          <section className="break-inside-avoid">
            <QrCode value={m.portfolioUrl} title={t.qr} className="h-[24mm] w-[24mm]" />
            <p className={`mt-[1.5mm] text-[6.8pt] ${MUTED}`}>{t.qr}</p>
          </section>
        )}
      </aside>

      <div className="space-y-[6mm] px-[10mm] py-[12mm]">
        <header>
          <h1 className="text-[24pt] leading-[1.1] font-semibold tracking-[-0.01em]">{m.name}</h1>
          <p className={`mt-[1.5mm] text-[11pt] font-medium ${ACCENT}`}>{m.title}</p>
          {m.summary && <p className={`mt-[4mm] text-[9.2pt] ${MUTED}`}>{m.summary}</p>}
        </header>

        {m.experience.length > 0 && (
          <section>
            <MainHeading>{t.experience}</MainHeading>
            <div className="space-y-[3.8mm]">
              {m.experience.map((e) => (
                <div key={e.id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-[3mm]">
                    <h3 className="text-[10pt] font-semibold">{e.title}</h3>
                    {e.period && <span className={`text-[8pt] tabular-nums ${MUTED}`}>{e.period}</span>}
                  </div>
                  <p className={`text-[8.4pt] ${MUTED}`}>{[e.company, e.meta].filter(Boolean).join(' · ')}</p>
                  {e.description && <p className="mt-[1.2mm]">{e.description}</p>}
                  {e.bullets.length > 0 && (
                    <ul className="mt-[1.2mm] list-disc space-y-[0.6mm] pl-[4mm] marker:text-[#0f766e]">
                      {e.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  )}
                  {e.tech.length > 0 && <p className={`mt-[1.2mm] text-[7.8pt] ${ACCENT}`}>{e.tech.join(' · ')}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {m.projects.length > 0 && (
          <section>
            <MainHeading>{t.projects}</MainHeading>
            <div className="space-y-[3.5mm]">
              {m.projects.map((p) => (
                <div key={p.id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-[3mm]">
                    <h3 className="text-[9.6pt] font-semibold">
                      <Links text={p.title} href={p.url} />
                    </h3>
                    {p.category && <span className={`text-[7.8pt] ${MUTED}`}>{p.category}</span>}
                  </div>
                  {p.summary && <p className="mt-[0.6mm]">{p.summary}</p>}
                  {p.tech.length > 0 && <p className={`mt-[0.6mm] text-[7.8pt] ${ACCENT}`}>{p.tech.join(' · ')}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {m.education.length > 0 && (
          <section>
            <MainHeading>{t.education}</MainHeading>
            <div className="space-y-[3mm]">
              {m.education.map((e) => (
                <div key={e.id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-[3mm]">
                    <h3 className="text-[9.6pt] font-semibold">{e.title}</h3>
                    {e.period && <span className={`text-[8pt] ${MUTED}`}>{e.period}</span>}
                  </div>
                  {e.institution && <p className={`text-[8.4pt] ${MUTED}`}>{e.institution}</p>}
                  {e.description && <p className="mt-[0.8mm]">{e.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}

/* ─────────────────────────── Lebenslauf ─────────────────────────── */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-[7mm]">
      <h2 className={`border-b border-[#0f766e]/35 pb-[1.5mm] text-[11pt] font-semibold ${ACCENT}`}>{title}</h2>
      <div className="mt-[3mm] space-y-[3mm]">{children}</div>
    </section>
  )
}

function Row({ left, children }: { left: ReactNode; children: ReactNode }) {
  return (
    <div className="grid break-inside-avoid grid-cols-[40mm_1fr] gap-x-[5mm]">
      <div className={`text-[8.6pt] tabular-nums ${MUTED}`}>{left}</div>
      <div>{children}</div>
    </div>
  )
}

export function LebenslaufCv({ m, today }: { m: CvModel; today: string }) {
  const t = m.t.cv
  const personal = [
    { label: t.name, value: m.name },
    ...m.contact.filter((c) => c.label === t.location || c.label === t.phone || c.label === t.email),
    ...m.personal,
  ]
  const links = m.contact.filter((c) => !personal.includes(c) && c.href)
  return (
    <article lang={m.locale} className={`cv-sheet bg-white px-[20mm] py-[16mm] text-[9.4pt] leading-[1.5] ${INK}`}>
      <header className="flex items-start justify-between gap-[8mm]">
        <div>
          <p className={`text-[8pt] font-semibold tracking-[0.22em] uppercase ${ACCENT}`}>{t.heading}</p>
          <h1 className="mt-[2mm] text-[22pt] leading-[1.1] font-semibold">{m.name}</h1>
          <p className={`mt-[1mm] text-[10.5pt] ${MUTED}`}>{m.title}</p>
        </div>
        {m.photo && <Avatar m={m} className="h-[45mm] w-[35mm] shrink-0 rounded-[1.5mm]" />}
      </header>

      <Section title={t.personal}>
        {personal.map((p) => (
          <Row key={p.label} left={p.label}>
            {'href' in p && p.href ? <Links text={p.value} href={p.href} /> : p.value}
          </Row>
        ))}
        {links.map((l) => (
          <Row key={l.label + l.value} left={l.label}>
            <Links text={l.value} href={l.href} />
          </Row>
        ))}
      </Section>

      {m.summary && (
        <Section title={t.profile}>
          <p>{m.summary}</p>
        </Section>
      )}

      {m.experience.length > 0 && (
        <Section title={t.experience}>
          {m.experience.map((e) => (
            <Row key={e.id} left={e.period}>
              <p className="font-semibold">{e.title}</p>
              <p className={MUTED}>{[e.company, e.meta].filter(Boolean).join(' · ')}</p>
              {e.description && <p className="mt-[1mm]">{e.description}</p>}
              {e.bullets.length > 0 && (
                <ul className="mt-[1mm] list-disc space-y-[0.5mm] pl-[4mm]">
                  {e.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {e.tech.length > 0 && <p className={`mt-[1mm] text-[8.4pt] ${MUTED}`}>{e.tech.join(', ')}</p>}
            </Row>
          ))}
        </Section>
      )}

      {m.education.length > 0 && (
        <Section title={t.education}>
          {m.education.map((e) => (
            <Row key={e.id} left={e.period}>
              <p className="font-semibold">{e.title}</p>
              {e.institution && <p className={MUTED}>{e.institution}</p>}
              {e.description && <p className="mt-[1mm]">{e.description}</p>}
            </Row>
          ))}
        </Section>
      )}

      {m.projects.length > 0 && (
        <Section title={t.projects}>
          {m.projects.map((p) => (
            <Row key={p.id} left={p.category}>
              <p className="font-semibold">
                <Links text={p.title} href={p.url} />
              </p>
              {p.summary && <p>{p.summary}</p>}
              {p.tech.length > 0 && <p className={`text-[8.4pt] ${MUTED}`}>{p.tech.join(', ')}</p>}
            </Row>
          ))}
        </Section>
      )}

      {m.skills.length > 0 && (
        <Section title={t.skills}>
          {m.skills.map((g) => (
            <Row key={g.group} left={g.group}>
              {g.items.join(', ')}
            </Row>
          ))}
        </Section>
      )}

      {m.languages.length > 0 && (
        <Section title={t.languages}>
          {m.languages.map((l) => (
            <Row key={l.name} left={l.name}>
              {l.level}
            </Row>
          ))}
        </Section>
      )}

      {m.interests.length > 0 && (
        <Section title={t.interests}>
          <Row left="">{m.interests.join(', ')}</Row>
        </Section>
      )}

      <footer className="mt-[14mm] flex break-inside-avoid items-end justify-between gap-[8mm]">
        <div>
          <p className="min-h-[1.5em]">{[m.place, today].filter(Boolean).join(', ')}</p>
          <div className="mt-[10mm] w-[60mm] border-t border-[#16201d]/50 pt-[1mm] text-[8pt]">
            <span className={MUTED}>{t.placeDate} · </span>
            {m.name}
          </div>
        </div>
        {m.showQr && (
          <div className="flex items-end gap-[3mm]">
            <p className={`max-w-[32mm] text-right text-[7pt] ${MUTED}`}>{t.qr}</p>
            <QrCode value={m.portfolioUrl} title={t.qr} className="h-[20mm] w-[20mm]" />
          </div>
        )}
      </footer>
    </article>
  )
}

/* ──────────────────────────── Europass ──────────────────────────── */
/* The standard Europass CV structure (labels left, content right, CEFR language grid).
   No EU/Europass logo or footer: those are EU trademarks. */

const EU_BLUE = 'text-[#1f4e9a]'
const EU_LABEL = 'text-[#3a7bbf]'

function EuSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-[6mm]">
      <div className="grid grid-cols-[52mm_1fr] items-center gap-x-[6mm]">
        <h2 className={`text-right text-[8.6pt] font-semibold tracking-[0.12em] uppercase ${EU_BLUE}`}>{title}</h2>
        <span className="h-[1.2px] bg-[#3a7bbf]/60" />
      </div>
      <div className="mt-[3mm] space-y-[3.2mm]">{children}</div>
    </section>
  )
}

function EuRow({ label, children }: { label?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid break-inside-avoid grid-cols-[52mm_1fr] gap-x-[6mm]">
      <div className={`text-right text-[8.4pt] ${EU_LABEL}`}>{label}</div>
      <div>{children}</div>
    </div>
  )
}

export function EuropassCv({ m }: { m: CvModel }) {
  const t = m.t.cv
  const eu = t.eu
  const contact = m.contact
  const cell = 'border border-[#3a7bbf]/40 px-[1.6mm] py-[1mm] text-center'
  return (
    <article lang={m.locale} className={`cv-sheet bg-white px-[14mm] py-[14mm] text-[9pt] leading-[1.45] ${INK}`}>
      <EuRow
        label={
          m.photo ? (
            <span className="inline-block">
              <Avatar m={m} className="ml-auto h-[38mm] w-[30mm] rounded-[1mm]" />
            </span>
          ) : (
            <span className={`text-[8.6pt] font-semibold tracking-[0.12em] uppercase ${EU_BLUE}`}>{eu.personalInfo}</span>
          )
        }
      >
        {m.photo && <p className={`text-[8.6pt] font-semibold tracking-[0.12em] uppercase ${EU_BLUE}`}>{eu.personalInfo}</p>}
        <h1 className="mt-[1mm] text-[20pt] leading-[1.15] font-semibold">{m.name}</h1>
        <ul className="mt-[3mm] space-y-[1.2mm] text-[8.8pt]">
          {contact.map((c) => (
            <li key={c.label + c.value} className="flex gap-[2mm]">
              <span className={`w-[24mm] shrink-0 ${MUTED}`}>{c.label}</span>
              <Links text={c.value} href={c.href} />
            </li>
          ))}
          {m.personal.map((p) => (
            <li key={p.label} className="flex gap-[2mm]">
              <span className={`w-[24mm] shrink-0 ${MUTED}`}>{p.label}</span>
              {p.value}
            </li>
          ))}
        </ul>
      </EuRow>

      <section className="mt-[6mm]">
        <EuRow label={<span className={`text-[8.6pt] font-semibold tracking-[0.12em] uppercase ${EU_BLUE}`}>{eu.position}</span>}>
          <p className={`text-[12pt] font-semibold ${EU_BLUE}`}>{m.title}</p>
          {m.summary && <p className={`mt-[1.5mm] ${MUTED}`}>{m.summary}</p>}
        </EuRow>
      </section>

      {m.experience.length > 0 && (
        <EuSection title={eu.workExperience}>
          {m.experience.map((e) => (
            <EuRow key={e.id} label={e.period}>
              <p className={`text-[10pt] font-semibold ${EU_BLUE}`}>{e.title}</p>
              <p>{[e.company, e.meta].filter(Boolean).join(' · ')}</p>
              {e.description && <p className="mt-[1mm]">{e.description}</p>}
              {e.bullets.length > 0 && (
                <ul className="mt-[1mm] list-disc space-y-[0.5mm] pl-[4mm]">
                  {e.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {e.tech.length > 0 && (
                <p className={`mt-[1mm] text-[8.4pt] ${MUTED}`}>
                  {eu.technologies}: {e.tech.join(', ')}
                </p>
              )}
            </EuRow>
          ))}
        </EuSection>
      )}

      {m.education.length > 0 && (
        <EuSection title={eu.educationTraining}>
          {m.education.map((e) => (
            <EuRow key={e.id} label={e.period}>
              <p className={`text-[10pt] font-semibold ${EU_BLUE}`}>{e.title}</p>
              {e.institution && <p>{e.institution}</p>}
              {e.description && <p className="mt-[0.8mm]">{e.description}</p>}
            </EuRow>
          ))}
        </EuSection>
      )}

      <EuSection title={eu.personalSkills}>
        {m.motherTongue && <EuRow label={eu.motherTongue}>{m.motherTongue}</EuRow>}
        {m.languages.length > 0 && (
          <EuRow label={eu.otherLanguages}>
            <table className="w-full border-collapse text-[8.2pt]">
              <thead>
                <tr className={EU_BLUE}>
                  <th className={`${cell} w-[24mm]`} rowSpan={2} />
                  <th className={`${cell} font-semibold uppercase`} colSpan={2}>
                    {eu.understanding}
                  </th>
                  <th className={`${cell} font-semibold uppercase`} colSpan={2}>
                    {eu.speaking}
                  </th>
                  <th className={`${cell} font-semibold uppercase`}>{eu.writing}</th>
                </tr>
                <tr className={`text-[7.4pt] ${EU_LABEL}`}>
                  {[eu.listening, eu.reading, eu.spokenInteraction, eu.spokenProduction, ''].map((h, i) => (
                    <th key={i} className={`${cell} font-normal`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {m.languages.map((l) => (
                  <tr key={l.name} className="break-inside-avoid">
                    <th className={`${cell} text-left font-semibold`}>{l.name}</th>
                    {l.skills ? (
                      l.skills.map((s, i) => (
                        <td key={i} className={`${cell} font-medium`}>
                          {s || '—'}
                        </td>
                      ))
                    ) : (
                      <td className={cell} colSpan={5}>
                        {l.level} <span className={MUTED}>({eu.overall})</span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={`mt-[1.5mm] text-[7.2pt] ${MUTED}`}>{eu.cefr}</p>
          </EuRow>
        )}
        {m.skills.length > 0 && (
          <EuRow label={eu.digitalSkills}>
            <ul className="space-y-[1mm]">
              {m.skills.map((g) => (
                <li key={g.group}>
                  <span className="font-semibold">{g.group}: </span>
                  {g.items.join(', ')}
                </li>
              ))}
            </ul>
          </EuRow>
        )}
        {m.personal.find((p) => p.label === t.licence) && <EuRow label={eu.drivingLicence}>{m.personal.find((p) => p.label === t.licence)?.value}</EuRow>}
      </EuSection>

      {(m.projects.length > 0 || m.interests.length > 0) && (
        <EuSection title={eu.additional}>
          {m.projects.length > 0 && (
            <EuRow label={eu.projects}>
              <ul className="space-y-[2mm]">
                {m.projects.map((p) => (
                  <li key={p.id} className="break-inside-avoid">
                    <Links text={p.title} href={p.url} />
                    {p.category && <span className={MUTED}> · {p.category}</span>}
                    {p.summary && <p>{p.summary}</p>}
                  </li>
                ))}
              </ul>
            </EuRow>
          )}
          {m.interests.length > 0 && <EuRow label={eu.interests}>{m.interests.join(', ')}</EuRow>}
        </EuSection>
      )}

      {m.showQr && (
        <div className="mt-[8mm] flex break-inside-avoid items-end justify-end gap-[3mm]">
          <p className={`max-w-[40mm] text-right text-[7pt] ${MUTED}`}>{t.qr}</p>
          <QrCode value={m.portfolioUrl} title={t.qr} className="h-[18mm] w-[18mm]" />
        </div>
      )}
    </article>
  )
}
