import { useLocation } from 'react-router-dom'
import { usePortfolio } from '@/data/PortfolioContext'
import { notFoundHead } from '@/seo/head'
import { useHead } from '@/seo/useHead'
import { LinkButton } from '@/components/ui/Button'

export default function NotFound() {
  const { data } = usePortfolio()
  const { pathname } = useLocation()
  useHead(notFoundHead(data))
  return (
    <main id="main" className="bg-grid mask-radial flex min-h-[80vh] items-center justify-center px-5 pt-24">
      <div className="text-center font-mono">
        <h1 className="text-7xl font-semibold text-white md:text-9xl">
          404<span className="sr-only">: page not found</span>
        </h1>
        <p className="mt-4 text-accent">$ cd {pathname}</p>
        <p className="mt-1 text-muted">no such file or directory</p>
        <LinkButton to="/" className="mt-10">
          Return home
        </LinkButton>
      </div>
    </main>
  )
}
