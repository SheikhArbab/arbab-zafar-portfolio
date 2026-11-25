import { dateRange } from '@/lib/utils'
import type { Experience } from '@/types/content'
import { CollectionManager } from '../components/CollectionManager'
import { PageHeader } from '../components/PageHeader'

export default function ExperiencePage() {
  return (
    <div>
      <PageHeader title="Experience" description="Your career timeline. Drag to reorder (top = shown first). Only add achievements you can stand behind." />
      <CollectionManager<Experience & Record<string, unknown>>
        table="experiences"
        toRow={(d) => ({ ...d, end_date: d.is_current ? null : d.end_date })}
        singular="Role"
        translatable={['title', 'location', 'description', 'responsibilities', 'achievements']}
        visibilityKey="is_visible"
        searchKeys={['title', 'company', 'location']}
        title={(r) => r.title}
        subtitle={(r) => [r.company, r.employment_type, dateRange(r.start_date, r.end_date, r.is_current)].filter(Boolean).join(' · ')}
        thumb={(r) => r.logo_url}
        ownedFiles={(r) => [{ bucket: 'media', url: r.logo_url }]}
        blank={() => ({
          title: '',
          company: '',
          employment_type: 'Full-time',
          location: '',
          start_date: null,
          end_date: null,
          is_current: false,
          description: '',
          responsibilities: [],
          technologies: [],
          achievements: [],
          logo_url: null,
          is_visible: true,
        })}
        fields={[
          { name: 'title', label: 'Job title', type: 'text', required: true, max: 120 },
          { name: 'company', label: 'Company', type: 'text', required: true, max: 120 },
          {
            name: 'employment_type',
            label: 'Employment type',
            type: 'select',
            options: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Apprenticeship'].map((v) => ({ value: v, label: v })),
          },
          { name: 'location', label: 'Location', type: 'text', max: 120 },
          { name: 'start_date', label: 'Start date', type: 'date' },
          { name: 'end_date', label: 'End date', type: 'date', showIf: (v) => !v.is_current },
          { name: 'is_current', label: 'I currently work here', type: 'switch' },
          { name: 'is_visible', label: 'Visible on portfolio', type: 'switch' },
          { name: 'description', label: 'Description', type: 'textarea', rows: 3, max: 1000 },
          { name: 'responsibilities', label: 'Responsibilities', type: 'lines' },
          { name: 'technologies', label: 'Technologies', type: 'tags' },
          { name: 'achievements', label: 'Achievements (optional)', type: 'lines' },
          { name: 'logo_url', label: 'Company logo', type: 'image', folder: 'logos' },
        ]}
      />
    </div>
  )
}
