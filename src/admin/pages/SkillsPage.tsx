import { useState } from 'react'
import type { Skill, SkillCategory } from '@/types/content'
import { SkillIcon } from '@/components/site/SkillIcon'
import { CollectionManager } from '../components/CollectionManager'
import { PageHeader, Panel } from '../components/PageHeader'

const proficiency = [
  { value: 'hidden', label: 'Hide proficiency' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'custom', label: 'Custom label' },
]

export default function SkillsPage() {
  const [cats, setCats] = useState<SkillCategory[]>([])
  const catOptions = [{ value: '', label: '— No category —' }, ...cats.map((c) => ({ value: c.id, label: c.name }))]
  const catName = (id: string | null) => cats.find((c) => c.id === id)?.name ?? 'Uncategorised'

  return (
    <div className="space-y-10">
      <PageHeader title="Skills" description="Manage categories and skills. Proficiency is optional: hidden by default, so there are no fake percentages." />

      <Panel title="Categories" description="Order here controls the order of category panels on the site.">
        <CollectionManager<SkillCategory & Record<string, unknown>>
          table="skill_categories"
          singular="Category"
          translatable={['name', 'description']}
          visibilityKey="is_visible"
          onChanged={(rows) => setCats(rows)}
          title={(r) => r.name}
          subtitle={(r) => r.description}
          blank={() => ({ name: '', slug: '', description: '', is_visible: true })}
          fields={[
            { name: 'name', label: 'Name', type: 'text', required: true, max: 60 },
            { name: 'slug', label: 'Slug', type: 'slug', from: 'name', required: true },
            { name: 'description', label: 'Short description', type: 'text', max: 120 },
            { name: 'is_visible', label: 'Visible', type: 'switch' },
          ]}
        />
      </Panel>

      <Panel title="Skills" description="Star = featured in the “core stack” strip. Icons: upload one, or enter a simpleicons.org slug (e.g. react, nextdotjs).">
        <CollectionManager<Skill & Record<string, unknown>>
          table="skills"
          singular="Skill"
          visibilityKey="is_visible"
          featuredKey="is_featured"
          searchKeys={['name', 'icon']}
          filter={{ key: 'category_id', label: 'Categories', options: cats.map((c) => ({ value: c.id, label: c.name })) }}
          title={(r) => r.name}
          subtitle={(r) => (
            <span className="inline-flex items-center gap-2">
              <SkillIcon skill={r} className="h-3.5 w-3.5" />
              {catName(r.category_id)} · {proficiency.find((p) => p.value === r.proficiency)?.label}
            </span>
          )}
          ownedFiles={(r) => [{ bucket: 'media', url: r.icon_url }]}
          blank={() => ({ name: '', category_id: cats[0]?.id ?? null, icon: '', icon_url: null, proficiency: 'hidden', proficiency_label: '', is_featured: false, is_visible: true })}
          fields={[
            { name: 'name', label: 'Name', type: 'text', required: true, max: 60 },
            { name: 'category_id', label: 'Category', type: 'select', options: catOptions },
            { name: 'proficiency', label: 'Proficiency display', type: 'select', options: proficiency },
            { name: 'proficiency_label', label: 'Custom label', type: 'text', placeholder: 'e.g. 2 yrs production', showIf: (v) => v.proficiency === 'custom', max: 40 },
            { name: 'icon', label: 'Simple Icons slug', type: 'text', placeholder: 'react', help: 'Find slugs at simpleicons.org' },
            { name: 'is_featured', label: 'Featured', type: 'switch' },
            { name: 'is_visible', label: 'Visible', type: 'switch' },
            { name: 'icon_url', label: 'Custom icon (overrides slug)', type: 'image', folder: 'icons' },
          ]}
        />
      </Panel>
    </div>
  )
}
