import { PageHeader } from '../components/PageHeader'
import { SingletonEditor, type FieldGroup } from '../components/SingletonEditor'

const groups: FieldGroup[] = [
  {
    title: 'Identity',
    translate: ['title', 'location'],
    fields: [
      { name: 'full_name', label: 'Full name', type: 'text', required: true, max: 80 },
      { name: 'short_name', label: 'Short name', type: 'text', required: true, help: 'Used in the logo, e.g. “arbab.dev”', max: 30 },
      { name: 'title', label: 'Professional title', type: 'text', required: true, max: 100 },
      { name: 'location', label: 'Location', type: 'text', max: 80 },
      { name: 'email', label: 'Public email', type: 'email', help: 'Shown in Contact and used by the Email social link.' },
      { name: 'avatar_url', label: 'Profile image', type: 'image', folder: 'profile', help: 'Also used for social sharing if no OG image is set.' },
    ],
  },
  {
    title: 'Availability',
    translate: ['availability_text'],
    fields: [
      { name: 'is_available', label: 'Show “available for opportunities” badge', type: 'switch' },
      { name: 'availability_text', label: 'Availability text', type: 'text', max: 60 },
    ],
  },
  {
    title: 'Hero',
    description: 'The first screen visitors see.',
    translate: ['hero_eyebrow', 'hero_highlight', 'hero_heading', 'hero_description', 'hero_roles', 'terminal_lines'],
    fields: [
      { name: 'hero_eyebrow', label: 'Eyebrow line', type: 'text', max: 90 },
      { name: 'hero_highlight', label: 'Highlighted word(s)', type: 'text', help: 'Word(s) from the heading rendered with the gradient.' },
      { name: 'hero_heading', label: 'Heading', type: 'textarea', rows: 2, required: true, max: 120 },
      { name: 'hero_description', label: 'Description', type: 'textarea', rows: 3, required: true, max: 400 },
      { name: 'hero_roles', label: 'Rotating roles (typewriter)', type: 'lines', placeholder: 'React & Next.js Developer' },
      {
        name: 'terminal_lines',
        label: 'Terminal panel lines',
        type: 'repeater',
        itemLabel: 'line',
        fields: [
          { name: 'key', label: 'Key', type: 'text', placeholder: 'role' },
          { name: 'value', label: 'Value', type: 'text', placeholder: 'software-engineer' },
        ],
      },
    ],
  },
  {
    title: 'About',
    translate: ['about_heading', 'about_lead', 'about_body', 'about_highlights', 'about_cards'],
    fields: [
      { name: 'about_heading', label: 'Section heading', type: 'text', max: 100 },
      { name: 'about_lead', label: 'Lead paragraph', type: 'textarea', rows: 3, max: 400 },
      { name: 'about_body', label: 'Body', type: 'textarea', rows: 9, help: 'Separate paragraphs with a blank line.', max: 4000 },
      { name: 'about_image_url', label: 'About image', type: 'image', folder: 'profile', help: 'Optional. Falls back to the profile image, then to initials.' },
      {
        name: 'about_highlights',
        label: 'Quick facts',
        type: 'repeater',
        itemLabel: 'fact',
        fields: [
          { name: 'label', label: 'Label', type: 'text', placeholder: 'Experience' },
          { name: 'value', label: 'Value', type: 'text', placeholder: '~3 years' },
        ],
      },
      {
        name: 'about_cards',
        label: 'Cards',
        type: 'repeater',
        itemLabel: 'card',
        fields: [
          { name: 'title', label: 'Title', type: 'text' },
          { name: 'body', label: 'Text', type: 'textarea', rows: 2 },
        ],
      },
    ],
  },
  {
    title: 'Social links',
    description: 'Platform controls the icon: github, linkedin, email, portfolio, whatsapp, other. A visible WhatsApp entry with your number (international format, e.g. +92 300 1234567) also turns on the floating WhatsApp chat.',
    fields: [
      {
        name: 'socials',
        label: 'Links',
        type: 'repeater',
        itemLabel: 'link',
        fields: [
          {
            name: 'platform',
            label: 'Platform',
            type: 'select',
            options: ['github', 'linkedin', 'email', 'portfolio', 'whatsapp', 'other'].map((v) => ({ value: v, label: v })),
          },
          { name: 'label', label: 'Label', type: 'text' },
          { name: 'url', label: 'URL / address', type: 'text', placeholder: 'https://…  ·  WhatsApp: +92 300 1234567  ·  email: empty = public email' },
          { name: 'visible', label: 'Visible', type: 'switch' },
        ],
      },
    ],
  },
  {
    title: 'Deutsch lernen 🇩🇪',
    description: 'A subtle strip near the contact section.',
    translate: ['german.badge', 'german.headline', 'german.note', 'german.points'],
    fields: [
      { name: 'german.enabled', label: 'Show German learning strip', type: 'switch' },
      { name: 'german.badge', label: 'Badge', type: 'text' },
      { name: 'german.level', label: 'Current level', type: 'select', options: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((v) => ({ value: v, label: v })) },
      { name: 'german.goal', label: 'Goal level', type: 'select', options: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((v) => ({ value: v, label: v })) },
      { name: 'german.headline', label: 'Headline', type: 'text' },
      { name: 'german.note', label: 'Note', type: 'textarea', rows: 2 },
      { name: 'german.points', label: 'Points', type: 'lines' },
    ],
  },
  {
    title: 'CV generator (/cv)',
    description: 'Optional details for the generated CV. Everything here is public on /cv, and empty fields are simply left off.',
    translate: ['cv.summary', 'cv.address', 'cv.nationality', 'cv.driving_licence', 'cv.languages', 'cv.interests'],
    aside: () => <CvLinks />,
    fields: [
      { name: 'cv.summary', label: 'CV summary', type: 'textarea', rows: 3, max: 600, help: 'Empty: the About lead paragraph is used.' },
      { name: 'cv.address', label: 'Location on the CV', type: 'text', max: 120, help: 'e.g. “Islamabad, Pakistan”. Empty: the profile location.' },
      { name: 'cv.phone', label: 'Phone', type: 'text', max: 40, placeholder: '+92 …' },
      { name: 'cv.nationality', label: 'Nationality', type: 'text', max: 60 },
      { name: 'cv.birth_date', label: 'Date of birth', type: 'text', max: 30, help: 'Common on German CVs, but optional.' },
      { name: 'cv.driving_licence', label: 'Driving licence', type: 'text', max: 40 },
      {
        name: 'cv.languages',
        label: 'Languages',
        type: 'repeater',
        itemLabel: 'language',
        help: 'Empty: German is taken from the “Deutsch lernen” section.',
        fields: [
          { name: 'name', label: 'Language', type: 'text', placeholder: 'English' },
          { name: 'level', label: 'Level', type: 'text', placeholder: 'C1 · fluent' },
        ],
      },
      { name: 'cv.interests', label: 'Interests', type: 'tags' },
      { name: 'cv.show_photo', label: 'Show profile photo on the CV', type: 'switch' },
      { name: 'cv.show_qr', label: 'Show a QR code to the portfolio', type: 'switch' },
    ],
  },
]

function CvLinks() {
  return (
    <div className="space-y-2 rounded-xl border border-line p-4 text-sm">
      <p className="font-mono text-[0.7rem] tracking-[0.14em] text-muted uppercase">Preview</p>
      {[
        ['/cv?t=modern', 'Modern CV (English)'],
        ['/de/cv?t=lebenslauf', 'Lebenslauf (Deutsch)'],
        ['/cv?t=lebenslauf', 'German-style CV in English'],
      ].map(([href, label]) => (
        <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg px-2 py-1.5 text-fg hover:bg-white/5">
          {label} <span className="font-mono text-xs text-accent">↗</span>
        </a>
      ))}
      <p className="pt-1 text-xs text-dim">Shows saved changes. Visitors save it as a PDF from the page.</p>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <div>
      <PageHeader title="Profile" description="Your identity, hero, about section, social links and German learning badge." />
      <SingletonEditor table="profile" groups={groups} />
    </div>
  )
}
