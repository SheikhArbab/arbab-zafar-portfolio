import { PageHeader } from '../components/PageHeader'
import { SingletonEditor, type FieldGroup } from '../components/SingletonEditor'

function SnippetPreview({ v }: { v: Record<string, unknown> }) {
  const url = String(v.site_url || 'https://example.com')
  const title = String(v.seo_title || '')
  const desc = String(v.seo_description || '')
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-white p-4 text-left">
        <p className="truncate text-xs text-[#4d5156]">{url.replace(/^https?:\/\//, '')}</p>
        <p className="mt-1 line-clamp-1 text-lg text-[#1a0dab]">{title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">{desc}</p>
      </div>
      <p className={`font-mono text-[0.65rem] ${title.length > 60 ? 'text-amber-300' : 'text-dim'}`}>title: {title.length}/60</p>
      <p className={`font-mono text-[0.65rem] ${desc.length > 160 ? 'text-amber-300' : 'text-dim'}`}>description: {desc.length}/160</p>
      {Boolean(v.og_image_url) && <img src={String(v.og_image_url)} alt="OG preview" className="aspect-[1200/630] w-full rounded-lg border border-line object-cover" />}
    </div>
  )
}

const groups: FieldGroup[] = [
  {
    title: 'Search engines',
    description: 'Applied to the home page; project pages use their own SEO fields with these as fallback.',
    translate: ['seo_title', 'seo_description', 'seo_keywords'],
    fields: [
      { name: 'site_name', label: 'Site name', type: 'text', required: true },
      { name: 'site_url', label: 'Site URL (canonical)', type: 'url', required: true, help: 'Your production domain, without a trailing slash.' },
      { name: 'seo_title', label: 'Global title', type: 'text', required: true, max: 80 },
      { name: 'seo_description', label: 'Global description', type: 'textarea', rows: 3, required: true, max: 300 },
      { name: 'seo_keywords', label: 'Keywords', type: 'tags' },
      { name: 'robots_index', label: 'Allow search engines to index the site', type: 'switch' },
    ],
    aside: (v) => <SnippetPreview v={v} />,
  },
  {
    title: 'Social sharing',
    fields: [
      { name: 'og_image_url', label: 'Open Graph image (1200×630)', type: 'image', folder: 'seo' },
      { name: 'favicon_url', label: 'Favicon', type: 'image', folder: 'seo', help: 'Square PNG or SVG. Leave empty to use the default mark.' },
      { name: 'twitter_handle', label: 'X / Twitter handle', type: 'text', placeholder: '@handle' },
    ],
  },
]

export default function SeoPage() {
  return (
    <div>
      <PageHeader
        title="SEO"
        description="Metadata, sitemap and robots are baked into prerendered HTML at build time. After changing these, click “Publish SEO build” on the Overview page."
      />
      <SingletonEditor table="site_settings" groups={groups} />
    </div>
  )
}
