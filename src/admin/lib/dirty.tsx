import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react'

/** Tracks unsaved changes across the admin so navigation can warn before discarding them. */
const DirtyCtx = createContext<{ set: (key: string, dirty: boolean) => void; isDirty: () => boolean } | null>(null)

export function DirtyProvider({ children }: { children: ReactNode }) {
  const map = useRef(new Map<string, boolean>())
  const set = useCallback((key: string, dirty: boolean) => {
    if (dirty) map.current.set(key, true)
    else map.current.delete(key)
  }, [])
  const isDirty = useCallback(() => map.current.size > 0, [])
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (map.current.size) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [])
  return <DirtyCtx.Provider value={{ set, isDirty }}>{children}</DirtyCtx.Provider>
}

export function useDirtyGuard() {
  const ctx = useContext(DirtyCtx)
  if (!ctx) throw new Error('useDirtyGuard outside DirtyProvider')
  return ctx
}

export function useTrackDirty(key: string, dirty: boolean) {
  const { set } = useDirtyGuard()
  useEffect(() => {
    set(key, dirty)
    return () => set(key, false)
  }, [key, dirty, set])
}

export const confirmDiscard = () => window.confirm('You have unsaved changes. Discard them?')
