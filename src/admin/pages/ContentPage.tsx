import { PageHeader } from '../components/PageHeader'
import { SingletonEditor, type FieldGroup } from '../components/SingletonEditor'
import type { FieldDef } from '../components/FormFields'

const section = (key: string, title: string, extra: FieldDef[] = []): FieldGroup => ({
  title,
  fields: [
    { name: `content.${key}.eyebrow`, label: 'Eyebrow', type: 'text', max: 40 },
    { name: `content.${key}.heading`, label: 'Heading', type: 'text', max: 120 },
    { name: `content.${key}.description`, label: 'Description', type: 'textarea', rows: 2, max: 400 },
    ...extra,
  ],
})

/** Every text on this page has a German version. */
const translateAll = (g: FieldGroup): FieldGroup => ({ ...g, translate: g.fields.map((f) => f.name) })

const groups: FieldGroup[] = ([
  {
    title: 'Navigation labels',
    fields: (['home', 'about', 'experience', 'skills', 'projects', 'education', 'contact'] as const).map((k) => ({
      name: `content.nav.${k}`,
      label: k,
      type: 'text' as const,
      max: 24,
    })),
  },
  {
    title: 'Hero buttons',
    fields: [
      { name: 'content.hero.cta_projects', label: 'Projects button', type: 'text', max: 30 },
      { name: 'content.hero.cta_cv', label: 'CV button', type: 'text', max: 30 },
      { name: 'content.hero.cta_contact', label: 'Contact button', type: 'text', max: 30 },
      { name: 'content.hero.terminal_title', label: 'Terminal window title', type: 'text', max: 40 },
    ],
  },
  section('about', 'About section', []),
  section('experience', 'Experience section'),
  section('skills', 'Skills section'),
  section('featured', 'Featured projects'),
  section('projects', 'All projects (archive)'),
  section('education', 'Education section'),
  section('contact', 'Contact section', [
    { name: 'content.contact.submit_label', label: 'Submit button', type: 'text', max: 30 },
    { name: 'content.contact.success_message', label: 'Success message', type: 'text', max: 200 },
  ]),
  {
    title: 'Footer',
    fields: [
      { name: 'content.footer.tagline', label: 'Tagline', type: 'text', max: 160 },
      { name: 'content.footer.text', label: 'Copyright text', type: 'text', help: '“© YEAR Name.” is prepended automatically.', max: 120 },
    ],
  },
] as FieldGroup[]).map(translateAll)

export default function ContentPage() {
  return (
    <div>
      <PageHeader title="Website content" description="Section headings, button labels and footer copy. Hero and About text live under Profile." />
      <SingletonEditor table="site_settings" groups={groups} />
    </div>
  )
}
