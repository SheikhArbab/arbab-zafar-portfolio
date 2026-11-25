import { Component, type ErrorInfo, type ReactNode } from 'react'
import { dict, localeFromPath } from '@/i18n'

const RELOAD_FLAG = 'az-chunk-reload'

/** A failed dynamic import usually means a new deploy replaced the old chunk files. */
function isChunkError(error: unknown) {
  const msg = error instanceof Error ? `${error.name} ${error.message}` : String(error)
  return /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(msg)
}

interface Props {
  children: ReactNode
  /** Shown in the fallback, e.g. "portfolio" or "admin". */
  area?: string
}

interface State {
  error: Error | null
}

/**
 * Keeps one runtime error from blanking the whole app. After a deploy, a visitor holding an old
 * page can hit a missing code chunk: we reload once to fetch the new version, then fall back to a
 * friendly screen instead of looping.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[app] render error', error, info.componentStack)
    if (isChunkError(error)) {
      try {
        if (!sessionStorage.getItem(RELOAD_FLAG)) {
          sessionStorage.setItem(RELOAD_FLAG, '1')
          window.location.reload()
        }
      } catch {
        /* storage unavailable: show the fallback */
      }
    }
  }

  render() {
    if (!this.state.error) return this.props.children
    const t = dict(localeFromPath(typeof window === 'undefined' ? '/' : window.location.pathname)).error
    return (
      <main role="alert" className="flex min-h-screen items-center justify-center px-6">
        <div className="glass hud max-w-md rounded-2xl p-8 text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-amber-300 uppercase">{t.eyebrow}</p>
          <h1 className="mt-3 text-xl font-semibold text-white">{t.title}</h1>
          <p className="mt-2 text-sm text-muted">{t.hint}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => {
                try {
                  sessionStorage.removeItem(RELOAD_FLAG)
                } catch {
                  /* ignore */
                }
                window.location.reload()
              }}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black"
            >
              {t.reload}
            </button>
            <a href="/" className="rounded-lg border border-line-strong px-4 py-2 text-sm text-fg">
              {t.home}
            </a>
          </div>
        </div>
      </main>
    )
  }
}
