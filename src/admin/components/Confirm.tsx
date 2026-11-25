import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

interface ConfirmOpts {
  title: string
  description?: string
  confirmLabel?: string
  danger?: boolean
}

const Ctx = createContext<(o: ConfirmOpts) => Promise<boolean>>(async () => false)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null)
  const confirm = useCallback((o: ConfirmOpts) => new Promise<boolean>((resolve) => setState({ ...o, resolve })), [])
  const close = (v: boolean) => {
    state?.resolve(v)
    setState(null)
  }
  return (
    <Ctx.Provider value={confirm}>
      {children}
      <Dialog
        open={Boolean(state)}
        onClose={() => close(false)}
        title={state?.title}
        description={state?.description}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button variant={state?.danger === false ? 'primary' : 'danger'} onClick={() => close(true)}>
              {state?.confirmLabel ?? 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">This action cannot be undone.</p>
      </Dialog>
    </Ctx.Provider>
  )
}

export const useConfirm = () => useContext(Ctx)
