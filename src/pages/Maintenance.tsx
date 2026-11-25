import { usePortfolio } from '@/data/PortfolioContext'

export default function Maintenance() {
  const { data } = usePortfolio()
  return (
    <main className="bg-grid mask-radial flex min-h-screen items-center justify-center px-6">
      <div className="glass hud max-w-md rounded-2xl p-8 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">status: maintenance</p>
        <h1 className="mt-4 text-2xl font-semibold text-white">{data.profile.full_name}</h1>
        <p className="mt-3 text-muted">{data.settings.maintenance_message}</p>
      </div>
    </main>
  )
}
