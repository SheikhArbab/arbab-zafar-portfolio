import type { Education } from '@/types/content'
import { CollectionManager } from '../components/CollectionManager'
import { PageHeader } from '../components/PageHeader'

const kinds = [
  { value: 'education', label: 'Education' },
  { value: 'certification', label: 'Certification' },
  { value: 'course', label: 'Course' },
  { value: 'training', label: 'Training' },
]

export default function EducationPage() {
  return (
    <div>
      <PageHeader title="Education & certifications" description="Degrees, courses, certifications and training. The section stays hidden until at least one visible entry exists." />
      <CollectionManager<Education & Record<string, unknown>>
        table="education"
        singular="Entry"
        visibilityKey="is_visible"
        searchKeys={['title', 'institution', 'kind']}
        filter={{ key: 'kind', label: 'Types', options: kinds }}
        title={(r) => r.title}
        subtitle={(r) => [kinds.find((k) => k.value === r.kind)?.label, r.institution, r.date_label].filter(Boolean).join(' · ')}
        ownedFiles={(r) => [{ bucket: 'documents', url: r.certificate_url }]}
        blank={() => ({ kind: 'education', title: '', institution: '', date_label: '', description: '', certificate_url: null, credential_url: '', is_visible: true })}
        fields={[
          { name: 'kind', label: 'Type', type: 'select', options: kinds },
          { name: 'date_label', label: 'Date', type: 'text', placeholder: '2021 – 2025 or Mar 2024', max: 60 },
          { name: 'title', label: 'Title', type: 'text', required: true, max: 160 },
          { name: 'institution', label: 'Institution / issuer', type: 'text', max: 160 },
          { name: 'description', label: 'Description', type: 'textarea', rows: 3, max: 1000 },
          { name: 'credential_url', label: 'Credential URL', type: 'url' },
          { name: 'is_visible', label: 'Visible on portfolio', type: 'switch' },
          { name: 'certificate_url', label: 'Certificate file (PDF or image)', type: 'file', bucket: 'documents', folder: 'certificates' },
        ]}
      />
    </div>
  )
}
