import type {
  Education,
  Experience,
  PortfolioData,
  Profile,
  Project,
  SiteContent,
  SiteSettings,
  Skill,
  SkillCategory,
} from '../types/content.ts'
import { deCategories, deEducation, deExperiences, deProfile, deProjects, deSettings } from './de.ts'

/**
 * Default content.
 *  - Used as the offline fallback when Supabase is not configured / unreachable.
 *  - Used by `npm run seed:generate` to produce supabase/seed.sql.
 * After seeding, ALL of this is edited from /admin — never here.
 */

export const defaultContent: SiteContent = {
  nav: {
    home: 'Home',
    about: 'About',
    experience: 'Experience',
    skills: 'Skills',
    projects: 'Projects',
    education: 'Education',
    contact: 'Contact',
  },
  hero: {
    cta_projects: 'View projects',
    cta_cv: 'Download CV',
    cta_contact: 'Contact me',
    terminal_title: 'arbab@portfolio: ~',
  },
  about: {
    eyebrow: 'about',
    heading: 'The engineer behind the interface',
    description: '',
  },
  experience: {
    eyebrow: 'experience',
    heading: 'A career built one release at a time',
    description: 'My progression at CyberSoft Vantage, from intern to shipping web and mobile products.',
  },
  skills: {
    eyebrow: 'stack',
    heading: 'Tools I build with',
    description: 'The languages, frameworks and platforms I use day to day.',
  },
  featured: {
    eyebrow: 'featured work',
    heading: 'Selected projects',
    description: 'A few builds that show how I approach products end to end.',
  },
  projects: {
    eyebrow: 'archive',
    heading: 'All projects',
    description: 'Search and filter everything I have published.',
  },
  education: {
    eyebrow: 'learning',
    heading: 'Education & certifications',
    description: '',
  },
  contact: {
    eyebrow: 'contact',
    heading: 'Open a channel',
    description:
      'Have a role, a product idea or a question? Send a message. It comes straight to my inbox and I reply personally.',
    submit_label: 'Transmit message',
    success_message: 'Message received. I will get back to you soon.',
  },
  playground: {
    eyebrow: 'playground',
    heading: 'Take a break. Play something.',
    description: 'Three small browser games I built for fun with React and TypeScript. Best scores are saved in your browser.',
  },
  footer: {
    tagline: 'Designed & engineered by Arbab Zafar.',
    text: 'All rights reserved.',
  },
}

export const defaultSettings: SiteSettings = {
  id: 1,
  site_name: 'Arbab Zafar',
  site_url: 'https://arbab-zafar.netlify.app',
  seo_title: 'Arbab Zafar: Full-Stack Developer, Ausbildung in Germany',
  seo_description:
    'Full-stack developer from Pakistan (React, Next.js, React Native, Node.js, .NET), learning German and looking for an Ausbildung as Fachinformatiker in Germany.',
  seo_keywords: [
    'Arbab Zafar',
    'Arbab Zafar Software Engineer',
    'Ausbildung Germany',
    'Ausbildung Fachinformatiker Anwendungsentwicklung',
    'Full Stack Developer Pakistan',
    'React Developer',
    'Next.js Developer',
    'React Native Developer',
    'MERN Stack Developer',
  ],
  og_image_url: null,
  favicon_url: null,
  twitter_handle: '',
  robots_index: true,
  accent_primary: '#3dff9a',
  accent_secondary: '#38d6ff',
  animation_level: 'full',
  enable_3d: true,
  project_links: 'case_study',
  sections: {
    about: true,
    experience: true,
    skills: true,
    projects: true,
    education: true,
    german: true,
    playground: true,
    contact: true,
  },
  maintenance_mode: false,
  maintenance_message: 'The portfolio is being upgraded. Please check back shortly.',
  content: defaultContent,
  translations: { de: deSettings },
}

export const defaultProfile: Profile = {
  id: 1,
  full_name: 'Arbab Zafar',
  short_name: 'Arbab',
  title: 'Software Engineer · Full-Stack Developer',
  location: 'Pakistan',
  email: 'arbabzafar4444@gmail.com',
  is_available: true,
  availability_text: 'Open to new opportunities',
  avatar_url: null,
  hero_eyebrow: 'Software Engineer @ CyberSoft Vantage',
  hero_heading: 'Full-stack products, engineered end to end.',
  hero_highlight: 'engineered',
  hero_description:
    'I’m Arbab Zafar, a software engineer with around three years of experience building web apps, mobile apps, dashboards and the APIs behind them, using React, Next.js, React Native, Angular, Node.js and .NET.',
  hero_roles: ['React & Next.js Developer', 'React Native Developer', 'MERN Stack Engineer', 'Angular Developer'],
  terminal_lines: [
    { key: 'user', value: 'arbab-zafar' },
    { key: 'role', value: 'software-engineer' },
    { key: 'stack', value: 'full-stack-development' },
    { key: 'base', value: 'pakistan' },
    { key: 'status', value: 'building digital experiences' },
  ],
  about_heading: 'The engineer behind the interface',
  about_lead:
    'I’m a full-stack developer from Pakistan who enjoys turning loose requirements into software that is clear to use and straightforward to maintain.',
  about_body: [
    'My journey started as a software engineering intern and grew through hands-on product work at CyberSoft Vantage in Islamabad: first building Angular frontends, then shipping MERN stack applications, and today working with React Native and Next.js across mobile and web.',
    'Most of my work sits where frontend meets backend. I design component systems and dashboards, manage state with Redux Toolkit, RTK Query or Angular Signals, and write the REST APIs in Node.js/Express or ASP.NET Core that feed them.',
    'Outside of work I’m learning German and preparing for opportunities in Germany, taking the same steady, step-by-step approach I bring to engineering.',
  ].join('\n\n'),
  about_highlights: [
    { label: 'Experience', value: '~3 years' },
    { label: 'Currently at', value: 'CyberSoft Vantage' },
    { label: 'Based in', value: 'Pakistan' },
    { label: 'Focus', value: 'Web · Mobile · APIs' },
  ],
  about_cards: [
    {
      title: 'What I build',
      body: 'Web applications, admin dashboards, cross-platform mobile apps and the REST APIs that power them.',
    },
    {
      title: 'How I engineer',
      body: 'Typed code, reusable components, predictable state, and layouts that hold up on every screen size.',
    },
    {
      title: 'What I care about',
      body: 'Software people actually enjoy using: fast, obvious and dependable, with the small details handled.',
    },
  ],
  about_image_url: null,
  socials: [
    { platform: 'github', label: 'GitHub', url: 'https://github.com/SheikhArbab', visible: true },
    { platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/arbab-zafar-web-developer/', visible: true },
    { platform: 'email', label: 'Email', url: '', visible: true },
    { platform: 'portfolio', label: 'Portfolio', url: 'https://arbab-zafar.netlify.app', visible: true },
    { platform: 'whatsapp', label: 'WhatsApp', url: '', visible: false },
  ],
  german: {
    enabled: true,
    badge: 'Deutsch lernen 🇩🇪',
    level: 'A2',
    goal: 'B2',
    headline: 'Deutschlernender',
    note: 'Ich lerne Deutsch und bereite mich auf meine berufliche Zukunft in Deutschland vor.',
    points: [
      'Interested in opportunities in Germany',
      'Ziel: Ausbildung Fachinformatiker für Anwendungsentwicklung',
      'Next milestone: B1 → B2',
    ],
  },
  cv: {
    summary: '',
    mother_tongue: '',
    phone: '',
    address: '',
    nationality: '',
    birth_date: '',
    driving_licence: '',
    languages: [],
    interests: [],
    show_photo: true,
    show_qr: true,
  },
  translations: { de: deProfile },
}

// Fixed IDs so the seed file and skills can reference categories.
const CAT = {
  frontend: '00000000-0000-4000-8000-000000000101',
  mobile: '00000000-0000-4000-8000-000000000102',
  backend: '00000000-0000-4000-8000-000000000103',
  databases: '00000000-0000-4000-8000-000000000104',
  state: '00000000-0000-4000-8000-000000000105',
  other: '00000000-0000-4000-8000-000000000106',
}

export const defaultCategories: SkillCategory[] = [
  { id: CAT.frontend, name: 'Frontend', slug: 'frontend', description: 'Interfaces & web apps', sort_order: 0, is_visible: true },
  { id: CAT.mobile, name: 'Mobile', slug: 'mobile', description: 'Cross-platform apps', sort_order: 1, is_visible: true },
  { id: CAT.backend, name: 'Backend', slug: 'backend', description: 'APIs & services', sort_order: 2, is_visible: true },
  { id: CAT.databases, name: 'Databases', slug: 'databases', description: 'Data & storage', sort_order: 3, is_visible: true },
  { id: CAT.state, name: 'State & UI tooling', slug: 'state-ui', description: 'State management & styling', sort_order: 4, is_visible: true },
  { id: CAT.other, name: 'Platform & workflow', slug: 'platform', description: 'Delivery & collaboration', sort_order: 5, is_visible: true },
].map((c) => ({ ...c, translations: deCategories[c.slug] ? { de: deCategories[c.slug] } : {} }))

const skillRows: [string, string, string, boolean?][] = [
  // name, category, simple-icons slug, featured
  ['React.js', CAT.frontend, 'react', true],
  ['Next.js', CAT.frontend, 'nextdotjs', true],
  ['Angular', CAT.frontend, 'angular', true],
  ['TypeScript', CAT.frontend, 'typescript', true],
  ['JavaScript', CAT.frontend, 'javascript'],
  ['HTML5', CAT.frontend, 'html5'],
  ['CSS3', CAT.frontend, 'css'],
  ['React Native', CAT.mobile, 'react', true],
  ['Node.js', CAT.backend, 'nodedotjs', true],
  ['Express.js', CAT.backend, 'express'],
  ['ASP.NET Core / .NET', CAT.backend, 'dotnet'],
  ['MongoDB', CAT.databases, 'mongodb'],
  ['SQL Server', CAT.databases, ''],
  ['PostgreSQL', CAT.databases, 'postgresql'],
  ['MySQL', CAT.databases, 'mysql'],
  ['Redux', CAT.state, 'redux'],
  ['Redux Toolkit', CAT.state, 'redux'],
  ['RTK Query', CAT.state, 'redux'],
  ['Angular Signals', CAT.state, 'angular'],
  ['Tailwind CSS', CAT.state, 'tailwindcss'],
  ['Bootstrap', CAT.state, 'bootstrap'],
  ['Material UI', CAT.state, 'mui'],
  ['REST APIs', CAT.other, ''],
  ['Git & GitHub', CAT.other, 'github'],
  ['IIS', CAT.other, ''],
  ['Vercel', CAT.other, 'vercel'],
  ['Netlify', CAT.other, 'netlify'],
  ['cPanel', CAT.other, 'cpanel'],
  ['Responsive Web Design', CAT.other, ''],
  // appended later; keep at the end so existing ids stay stable
  ['NativeWind', CAT.mobile, 'tailwindcss'],
  ['Expo', CAT.mobile, 'expo'],
]

export const defaultSkills: Skill[] = skillRows.map(([name, category_id, icon, featured], i) => ({
  id: `00000000-0000-4000-8000-${String(1000 + i).padStart(12, '0')}`,
  name,
  category_id,
  icon,
  icon_url: null,
  proficiency: 'hidden',
  proficiency_label: '',
  is_featured: Boolean(featured),
  is_visible: true,
  sort_order: i,
}))

const exp = (
  i: number,
  title: string,
  description: string,
  technologies: string[],
  is_current = false,
): Experience => ({
  id: `00000000-0000-4000-8000-${String(2000 + i).padStart(12, '0')}`,
  title,
  company: 'CyberSoft Vantage',
  employment_type: i === 3 ? 'Internship' : 'Full-time',
  location: 'Islamabad, Pakistan',
  start_date: null,
  end_date: null,
  is_current,
  description,
  responsibilities: [],
  technologies,
  achievements: [],
  logo_url: null,
  sort_order: i,
  is_visible: true,
  translations: deExperiences[i] ? { de: deExperiences[i] } : {},
})

export const defaultExperiences: Experience[] = [
  exp(
    0,
    'React Native & Next.js Developer',
    'Building cross-platform mobile applications with React Native and production web applications with Next.js.',
    ['React Native', 'Next.js', 'TypeScript', 'Redux Toolkit', 'RTK Query'],
    true,
  ),
  exp(
    1,
    'MERN Stack Developer',
    'Developed full-stack web applications with MongoDB, Express.js, React and Node.js, from REST APIs to dashboards.',
    ['MongoDB', 'Express.js', 'React.js', 'Node.js'],
  ),
  exp(
    2,
    'Angular Developer',
    'Built frontend features and application interfaces with Angular and TypeScript.',
    ['Angular', 'TypeScript', 'Angular Signals'],
  ),
  exp(
    3,
    'Software Engineering Intern',
    'Started my professional journey, learning production workflows and contributing to web projects.',
    ['JavaScript', 'HTML5', 'CSS3', 'Git'],
  ),
]

const ASSETS = 'https://raw.githubusercontent.com/SheikhArbab/portfolio-assets/main'

const proj = (i: number, p: Partial<Project> & Pick<Project, 'title' | 'slug'>): Project => ({
  id: `00000000-0000-4000-8000-${String(3000 + i).padStart(12, '0')}`,
  short_description: '',
  description: '',
  thumbnail_url: null,
  technologies: [],
  category: 'Web App',
  live_url: '',
  repo_url: '',
  is_featured: false,
  status: '',
  started_on: null,
  completed_on: null,
  role: '',
  challenges: '',
  solutions: '',
  key_features: [],
  outcome: '',
  sort_order: i,
  is_published: true,
  seo_title: '',
  seo_description: '',
  project_images: [],
  ...p,
})

// Case studies are written only from verifiable sources: the live sites, the public
// repositories (github.com/SheikhArbab) and the previous portfolio. Display order = array order.
export const defaultProjects: Project[] = [
  proj(0, {
    title: 'TechFlow LLC',
    slug: 'techflow-llc',
    category: 'Client Website',
    short_description: 'Company website for Tech Flow LLC, a technology consultancy, built with Next.js.',
    description: [
      'Tech Flow LLC is a technology consultancy offering software development, QA testing, DevOps and embedded software services.',
      'I built the company’s marketing website as a multi-page Next.js application that introduces the company, its services and its work, and gives prospective clients and candidates a clear path to get in touch.',
    ].join('\n\n'),
    key_features: [
      'Dedicated pages for the company, services, work, careers and contact',
      'Service content for software development, QA testing, DevOps and embedded software',
      'Built with Next.js and React for fast, SEO-friendly page delivery',
    ],
    technologies: ['Next.js', 'React', 'TypeScript', 'Node.js', 'Formik', 'Yup'],
    thumbnail_url: `${ASSETS}/web%20app/techflow.JPG`,
    live_url: 'https://techflow-llc.netlify.app/',
    is_featured: true,
  }),
  proj(7, {
    title: 'Sukna Capital Fintech App',
    slug: 'sukna-capital-fintech-app',
    category: 'Fintech',
    short_description: 'A fintech application built for Sukna Capital.',
    is_featured: true,
  }),
  proj(2, {
    title: 'SIMS Dashboard',
    slug: 'sims-dashboard',
    category: 'Dashboard',
    short_description: 'An admin dashboard built on the MERN stack, with Formik and Yup handling forms and validation.',
    technologies: ['React', 'Node.js', 'Express.js', 'MongoDB', 'Formik', 'Yup'],
    thumbnail_url: `${ASSETS}/web%20app/sims_admin.webp`,
    live_url: 'https://www.linkedin.com/feed/update/urn:li:activity:7146196486383456256/',
    is_featured: true,
  }),
  proj(6, {
    title: 'S.A.J Holding',
    slug: 'saj-holding',
    category: 'Client Website',
    short_description: 'Corporate website for S.A.J Holding & Investment, an Abu Dhabi holding company, hand-built with HTML, CSS and JavaScript.',
    description: [
      'S.A.J Holding & Investment is an Abu Dhabi–based holding company founded in 2011, whose subsidiaries include Cardip UAE and EVS UAE.',
      'I built its one-page corporate website from scratch, without a framework: a company introduction, the subsidiaries with links to their own sites, the team and a contact section.',
    ].join('\n\n'),
    key_features: [
      'Animated particle hero with rotating taglines (particles.js + Typed.js)',
      'Sticky navigation that highlights the section currently in view',
      'Responsive team carousel showing one to three cards depending on screen size',
      'Subsidiary cards with hover overlays linking to Cardip UAE and EVS UAE',
      'Animated mobile menu, SEO meta tags and five responsive breakpoints',
    ],
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'jQuery', 'Owl Carousel', 'Typed.js', 'particles.js'],
    thumbnail_url: `${ASSETS}/webiste/%20%20(10).webp`,
    live_url: 'https://sajholding.netlify.app/',
    repo_url: 'https://github.com/SheikhArbab/sajholding',
    is_featured: true,
  }),
  proj(8, {
    title: 'Simple Meditation (React Native)',
    slug: 'simple-meditation-app',
    category: 'Mobile App',
    status: 'in progress',
    short_description: 'A React Native meditation app built with Expo Router and NativeWind: a gradient welcome screen and tabbed nature-meditation sessions.',
    description: [
      'A mobile app I’m building to practise React Native. Expo Router handles file-based navigation and NativeWind styles the native components with Tailwind classes.',
      'It has a gradient welcome screen and a tab layout for nature meditations and affirmations. The session player and the affirmations screen are still in progress.',
    ].join('\n\n'),
    key_features: [
      'File-based navigation with Expo Router: welcome screen plus a tab layout (Nature Meditate, Affirmations)',
      'Tailwind-style styling of native components with NativeWind',
      'Six nature sessions (Mountains, Rivers, Sunset, Beaches, Starry Night, Waterfall) as image cards in a FlatList',
      'Reusable gradient background, custom button and header components',
    ],
    technologies: ['React Native', 'Expo', 'Expo Router', 'NativeWind', 'TypeScript'],
    repo_url: 'https://github.com/SheikhArbab/native-meditation',
  }),
  proj(9, {
    title: 'Fitness App (React Native)',
    slug: 'fitness-app-react-native',
    category: 'Mobile App',
    status: 'in progress',
    short_description: 'A React Native fitness app UI built with Expo Router and NativeWind, with a welcome screen and an animated image carousel.',
    description: [
      'A mobile app exploring React Native UI with Expo Router and NativeWind.',
      'A full-screen welcome screen leads to a home screen with an animated image carousel and layouts sized for different phone screens. The workout content is still in progress.',
    ].join('\n\n'),
    key_features: [
      'Welcome screen with a call to action that navigates to the home screen (Expo Router)',
      'Animated image carousel built on react-native-reanimated-carousel',
      'Screen-relative sizing with react-native-responsive-screen',
      'Tailwind-style styling with NativeWind',
    ],
    technologies: ['React Native', 'Expo', 'Expo Router', 'NativeWind', 'Reanimated', 'TypeScript'],
    repo_url: 'https://github.com/SheikhArbab/fitness-app',
  }),
  proj(1, {
    title: 'MERN Blog Platform',
    slug: 'mern-blog-platform',
    category: 'Learning Project',
    short_description: 'A full-stack blog with authentication, a rich-text editor, search, comments and an admin dashboard.',
    description: [
      'A full-stack blogging platform with a React client and an Express + MongoDB REST API, built while learning the MERN stack and starting from a popular MERN blog tutorial.',
      'Readers can browse and search posts and comment once signed in. Admins write, edit and delete posts and manage users from a dashboard.',
    ].join('\n\n'),
    key_features: [
      'Email/password sign-up and sign-in with bcrypt-hashed passwords and JWT sessions',
      'Google sign-in through Firebase Authentication',
      'Role-based admin dashboard for posts and users, protected on both client and server',
      'Rich-text post editor (React Quill) with categories, cover images and server-generated slugs',
      'Search with category filters and pagination',
      'Comments for signed-in users and a persisted dark/light theme',
    ],
    technologies: ['React', 'Redux Toolkit', 'RTK Query', 'Tailwind CSS', 'Node.js', 'Express.js', 'MongoDB', 'JWT', 'Firebase Auth'],
    thumbnail_url: `${ASSETS}/web%20app/blog.JPG`,
    repo_url: 'https://github.com/SheikhArbab/mern-blog-frontend',
  }),
  proj(3, {
    title: '3D Portfolio',
    slug: '3d-portfolio',
    category: 'Learning Project',
    short_description: 'My earlier interactive 3D portfolio, built with React Three Fiber, Drei and Framer Motion.',
    description:
      'An earlier version of my portfolio, built by following JavaScript Mastery’s 3D portfolio tutorial and customised with my own experience, projects and testimonials.',
    key_features: [
      '3D desktop-PC hero model (GLTF) with constrained orbit controls',
      '3D tech-stack spheres with icon decals',
      'Rotating 3D planet beside an EmailJS-powered contact form',
      'Animated starfield, scroll-reveal sections, an experience timeline and tilt cards',
    ],
    technologies: ['React', 'Three.js', 'React Three Fiber', 'Drei', 'Framer Motion', 'Tailwind CSS', 'EmailJS'],
    thumbnail_url: `${ASSETS}/web%20app/3d.JPG`,
    live_url: 'https://arbab-portfolio.netlify.app/',
    repo_url: 'https://github.com/SheikhArbab/3d-portfolio',
  }),
  proj(5, {
    title: 'Hoo Bank',
    slug: 'hoo-bank',
    category: 'Learning Project',
    short_description: 'A responsive fintech landing page built with React and Tailwind CSS.',
    description:
      'A one-page landing page for a fictional digital bank, built with React, Vite and Tailwind CSS while following JavaScript Mastery’s HooBank tutorial. Every section is rendered from a single data file.',
    key_features: [
      'Ten responsive sections driven from one constants file',
      'Custom Tailwind breakpoints, colours and gradient tokens',
      'Animated SVG hamburger menu and smooth-scrolling anchor navigation',
    ],
    technologies: ['React', 'Vite', 'Tailwind CSS'],
    thumbnail_url: `${ASSETS}/web%20app/2.webp`,
    live_url: 'https://hoo-bank-r.netlify.app/',
    repo_url: 'https://github.com/SheikhArbab/hoo-bank',
  }),
  proj(4, {
    title: 'MERN Estate',
    slug: 'mern-estate',
    category: 'Learning Project',
    short_description: 'An in-progress real estate app built with the MERN stack and Tailwind CSS.',
    technologies: ['MongoDB', 'Express.js', 'React', 'Node.js', 'Redux Toolkit', 'Tailwind CSS'],
    repo_url: 'https://github.com/SheikhArbab/mern-estate',
    // Unfinished (only sign-up is implemented), so it starts unpublished.
    is_published: false,
  }),
].map((p, i) => ({ ...p, sort_order: i, translations: deProjects[p.slug] ? { de: deProjects[p.slug] } : {} }))

// Institution, board and years are not known yet: they are added in /admin → Education, never guessed.
const edu = (i: number, key: string, e: Pick<Education, 'title' | 'date_label' | 'description'>): Education => ({
  id: `00000000-0000-4000-8000-${String(4000 + i).padStart(12, '0')}`,
  kind: 'education',
  institution: '',
  certificate_url: null,
  credential_url: '',
  sort_order: i,
  is_visible: true,
  ...e,
  translations: deEducation[key] ? { de: deEducation[key] } : {},
})

export const defaultEducation: Education[] = [
  edu(0, 'intermediate', {
    title: 'Intermediate (HSSC)',
    date_label: 'In progress',
    description: 'Currently studying for the Higher Secondary School Certificate (Intermediate), Pakistan.',
  }),
  edu(1, 'matric', {
    title: 'Matric (SSC)',
    date_label: 'Completed',
    description: 'Secondary School Certificate (Matric), Pakistan.',
  }),
]

export const defaultData: PortfolioData = {
  profile: defaultProfile,
  settings: defaultSettings,
  experiences: defaultExperiences,
  categories: defaultCategories,
  skills: defaultSkills,
  // The offline fallback mirrors what visitors would see: published projects only.
  projects: defaultProjects.filter((p) => p.is_published),
  education: defaultEducation,
  documents: [],
}
