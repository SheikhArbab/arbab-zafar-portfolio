import { PageHeader } from '../components/PageHeader'
import { SingletonEditor, type FieldGroup } from '../components/SingletonEditor'

const sections = ['about', 'experience', 'skills', 'projects', 'education', 'german', 'playground', 'contact'] as const

const groups: FieldGroup[] = [
  {
    title: 'Theme',
    fields: [
      { name: 'accent_primary', label: 'Primary accent', type: 'color', required: true },
      { name: 'accent_secondary', label: 'Secondary accent', type: 'color', required: true },
    ],
    aside: (v) => (
      <div className="rounded-xl border border-line p-4">
        <p className="mb-3 font-mono text-[0.65rem] text-dim uppercase">preview</p>
        <div className="flex gap-2">
          <span className="h-10 flex-1 rounded-lg" style={{ background: String(v.accent_primary) }} />
          <span className="h-10 flex-1 rounded-lg" style={{ background: String(v.accent_secondary) }} />
        </div>
        <p className="mt-3 bg-clip-text text-lg font-semibold text-transparent" style={{ backgroundImage: `linear-gradient(100deg, ${v.accent_primary}, ${v.accent_secondary})` }}>
          Engineered end to end.
        </p>
      </div>
    ),
  },
  {
    title: 'Motion & 3D',
    fields: [
      {
        name: 'animation_level',
        label: 'Animation level',
        type: 'select',
        options: [
          { value: 'full', label: 'Full: all animations' },
          { value: 'reduced', label: 'Reduced: no 3D, minimal motion' },
          { value: 'off', label: 'Off: static site' },
        ],
        help: 'Visitors with “reduce motion” enabled always get the reduced experience.',
      },
      { name: 'enable_3d', label: 'Enable 3D hero scene', type: 'switch', help: 'Low-power devices automatically get a static fallback.' },
    ],
  },
  {
    title: 'Projects',
    fields: [
      {
        name: 'project_links',
        label: 'Live demo & source code links',
        type: 'select',
        options: [
          { value: 'case_study', label: 'Only inside case study pages (cards show “Read case study”)' },
          { value: 'cards', label: 'On cards and inside case studies' },
          { value: 'hidden', label: 'Hidden everywhere' },
        ],
      },
    ],
  },
  {
    title: 'Sections',
    description: 'Hide whole sections. Empty sections (no experience, education…) are hidden automatically.',
    fields: sections.map((s) => ({ name: `sections.${s}`, label: s.charAt(0).toUpperCase() + s.slice(1), type: 'switch' as const })),
  },
  {
    title: 'Maintenance',
    fields: [
      { name: 'maintenance_mode', label: 'Maintenance mode', type: 'switch', help: 'Visitors see a holding page. Signed-in admins still see the site.' },
      { name: 'maintenance_message', label: 'Message', type: 'text', max: 200 },
    ],
  },
]

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Site settings" description="Theme, motion, section visibility and maintenance mode. Availability status is under Profile." />
      <SingletonEditor table="site_settings" groups={groups} />
    </div>
  )
}
