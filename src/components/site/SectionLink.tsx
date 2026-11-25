import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { localeFromPath, localizePath } from '@/i18n/paths'

interface Props {
  id: string
  className?: string
  children: ReactNode
  onClick?: () => void
  'aria-current'?: 'true' | undefined
}

/**
 * Link to a home-page section. On the home page it is a plain hash link (native smooth scroll);
 * elsewhere it navigates client-side to "/#id" (no full reload) and Home scrolls to the section.
 */
export function SectionLink({ id, className, children, onClick, ...rest }: Props) {
  const { pathname } = useLocation()
  const home = localizePath('/', localeFromPath(pathname))
  if (pathname === home) {
    return (
      <a href={`#${id}`} className={className} onClick={onClick} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <Link to={{ pathname: home, hash: `#${id}` }} className={className} onClick={onClick} {...rest}>
      {children}
    </Link>
  )
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
