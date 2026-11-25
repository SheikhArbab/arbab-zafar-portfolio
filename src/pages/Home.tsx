import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { usePortfolio } from '@/data/PortfolioContext'
import { homeHead } from '@/seo/head'
import { useHead } from '@/seo/useHead'
import { useLocale } from '@/i18n'
import { Hero } from '@/sections/Hero'
import { About } from '@/sections/About'
import { Experience } from '@/sections/Experience'
import { Skills } from '@/sections/Skills'
import { Projects } from '@/sections/Projects'
import { Education } from '@/sections/Education'
import { German } from '@/sections/German'
import { Contact } from '@/sections/Contact'
import { PlaygroundTeaser } from '@/sections/PlaygroundTeaser'

export default function Home() {
  const { data } = usePortfolio()
  const { settings, experiences, skills, education, profile } = data
  const s = settings.sections
  const { hash } = useLocation()
  const locale = useLocale()
  useHead(homeHead(data, locale))

  useEffect(() => {
    if (!hash) return
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80)
    return () => clearTimeout(t)
  }, [hash])

  const show = {
    about: s.about,
    experience: s.experience && experiences.length > 0,
    skills: s.skills && skills.length > 0,
    projects: s.projects,
    education: s.education && education.length > 0,
    contact: s.contact,
  }
  // Number sections in the order they actually render (01, 02, …).
  const order = (Object.keys(show) as (keyof typeof show)[]).filter((k) => show[k])
  const idx = (key: keyof typeof show) => order.indexOf(key) + 1

  return (
    <main id="main">
      <Hero />
      {show.about && <About index={idx('about')} />}
      {show.experience && <Experience index={idx('experience')} />}
      {show.skills && <Skills index={idx('skills')} />}
      {show.projects && <Projects index={idx('projects')} />}
      {show.education && <Education index={idx('education')} />}
      {s.german && profile.german.enabled && <German />}
      {s.playground && <PlaygroundTeaser />}
      {show.contact && <Contact index={idx('contact')} />}
    </main>
  )
}
