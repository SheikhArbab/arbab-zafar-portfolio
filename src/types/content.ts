// Shared content model. Mirrors supabase/migrations/0001_schema.sql.

export type Proficiency = 'hidden' | 'beginner' | 'intermediate' | 'advanced' | 'custom'
export type AnimationLevel = 'full' | 'reduced' | 'off'
export type EducationKind = 'education' | 'course' | 'certification' | 'training'
export type MessageStatus = 'unread' | 'read' | 'archived'
export type DocumentKind = 'cv_en' | 'cv_de' | 'other'
/** Per-language overrides: { de: { <field>: value } }. Missing fields fall back to English. */
export type Translations = Partial<Record<'de', Record<string, unknown>>>

export type ProjectLinksMode = 'case_study' | 'cards' | 'hidden'

export interface KeyValue {
  key: string
  value: string
}

export interface Highlight {
  label: string
  value: string
}

export interface InfoCard {
  title: string
  body: string
}

export interface SocialLink {
  platform: string // github | linkedin | email | portfolio | whatsapp | other
  label: string
  url: string
  visible: boolean
}

export interface GermanInfo {
  enabled: boolean
  badge: string
  level: string
  goal: string
  headline: string
  note: string
  points: string[]
}

export interface CvLanguage {
  name: string
  /** Overall level, e.g. "B2" or "C1 · fluent". */
  level: string
  /** Optional CEFR self-assessment per skill (A1–C2), used by the Europass layout. */
  listening?: string
  reading?: string
  spoken_interaction?: string
  spoken_production?: string
  writing?: string
}

/** Extra details used only by the CV generator (/cv). All optional; empty fields are left off the CV. */
export interface CvInfo {
  summary: string
  mother_tongue: string
  phone: string
  address: string
  nationality: string
  birth_date: string
  driving_licence: string
  languages: CvLanguage[]
  interests: string[]
  show_photo: boolean
  show_qr: boolean
}

export interface Profile {
  translations?: Translations
  id: number
  full_name: string
  short_name: string
  title: string
  location: string
  email: string
  is_available: boolean
  availability_text: string
  avatar_url: string | null
  hero_eyebrow: string
  hero_heading: string
  hero_highlight: string
  hero_description: string
  hero_roles: string[]
  terminal_lines: KeyValue[]
  about_heading: string
  about_lead: string
  about_body: string
  about_highlights: Highlight[]
  about_cards: InfoCard[]
  about_image_url: string | null
  socials: SocialLink[]
  german: GermanInfo
  cv: CvInfo
  updated_at?: string
}

export interface SectionCopy {
  eyebrow: string
  heading: string
  description: string
}

export interface SiteContent {
  nav: Record<'home' | 'about' | 'experience' | 'skills' | 'projects' | 'education' | 'contact', string>
  hero: { cta_projects: string; cta_cv: string; cta_contact: string; terminal_title: string }
  about: SectionCopy
  experience: SectionCopy
  skills: SectionCopy
  featured: SectionCopy
  projects: SectionCopy
  education: SectionCopy
  contact: SectionCopy & { submit_label: string; success_message: string }
  playground: SectionCopy
  footer: { tagline: string; text: string }
}

export type SectionKey = 'about' | 'experience' | 'skills' | 'projects' | 'education' | 'german' | 'playground' | 'contact'

export interface SiteSettings {
  translations?: Translations
  id: number
  site_name: string
  site_url: string
  seo_title: string
  seo_description: string
  seo_keywords: string[]
  og_image_url: string | null
  favicon_url: string | null
  twitter_handle: string
  robots_index: boolean
  accent_primary: string
  accent_secondary: string
  animation_level: AnimationLevel
  enable_3d: boolean
  project_links: ProjectLinksMode
  sections: Record<SectionKey, boolean>
  maintenance_mode: boolean
  maintenance_message: string
  content: SiteContent
  updated_at?: string
}

export interface Experience {
  translations?: Translations
  id: string
  title: string
  company: string
  employment_type: string
  location: string
  start_date: string | null
  end_date: string | null
  is_current: boolean
  description: string
  responsibilities: string[]
  technologies: string[]
  achievements: string[]
  logo_url: string | null
  sort_order: number
  is_visible: boolean
  created_at?: string
  updated_at?: string
}

export interface SkillCategory {
  translations?: Translations
  id: string
  name: string
  slug: string
  description: string
  sort_order: number
  is_visible: boolean
  updated_at?: string
}

export interface Skill {
  id: string
  name: string
  category_id: string | null
  icon: string // simple-icons slug (optional)
  icon_url: string | null // uploaded icon (takes precedence)
  proficiency: Proficiency
  proficiency_label: string
  is_featured: boolean
  is_visible: boolean
  sort_order: number
  updated_at?: string
}

export interface ProjectImage {
  id: string
  project_id: string
  url: string
  alt: string
  sort_order: number
}

export interface Project {
  translations?: Translations
  id: string
  title: string
  slug: string
  short_description: string
  description: string
  thumbnail_url: string | null
  technologies: string[]
  category: string
  live_url: string
  repo_url: string
  is_featured: boolean
  status: string
  started_on: string | null
  completed_on: string | null
  role: string
  challenges: string
  solutions: string
  key_features: string[]
  outcome: string
  sort_order: number
  is_published: boolean
  seo_title: string
  seo_description: string
  project_images?: ProjectImage[]
  created_at?: string
  updated_at?: string
}

export interface Education {
  translations?: Translations
  id: string
  kind: EducationKind
  title: string
  institution: string
  date_label: string
  description: string
  certificate_url: string | null
  credential_url: string
  sort_order: number
  is_visible: boolean
  updated_at?: string
}

export interface DocumentFile {
  translations?: Translations
  id: string
  kind: DocumentKind
  title: string
  file_path: string | null
  file_url: string
  file_name: string
  file_size: number | null
  is_visible: boolean
  updated_at?: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: MessageStatus
  created_at: string
}

export interface PrivateSettings {
  id: number
  notify_email: string
  notify_enabled: boolean
  updated_at?: string
}

export interface PortfolioData {
  profile: Profile
  settings: SiteSettings
  experiences: Experience[]
  categories: SkillCategory[]
  skills: Skill[]
  projects: Project[]
  education: Education[]
  documents: DocumentFile[]
}
