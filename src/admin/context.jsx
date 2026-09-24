import { CircleAlert, CircleCheck } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { SPRING_SOFT } from '../lib/motion.js'

// ─── Sesión y estado de integraciones ───────────────────────────────
export const AdminContext = createContext(null)
export const useAdmin = () => useContext(AdminContext)

/**
 * Ejecuta una petición del CMS: si la sesión expiró vuelve al PIN,
 * y cualquier otro error se muestra como toast. Relanza el error.
 */
export function useRequest() {
  const { expire } = useAdmin()
  const toast = useToast()
  return useCallback(
    async (fn) => {
      try {
        return await fn()
      } catch (error) {
        if (error.status === 401) expire()
        else toast.error(error.message)
        throw error
      }
    },
    [expire, toast],
  )
}

// ─── Toasts ─────────────────────────────────────────────────────────
const ToastContext = createContext(null)
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const push = useCallback((type, message) => {
    const id = ++nextId.current
    setToasts((current) => [...current.slice(-2), { id, type, message }])
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3200)
  }, [])

  const value = useMemo(
    () => ({ success: (message) => push('success', message), error: (message) => push('error', message) }),
    [push],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-[70] flex flex-col items-end gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
              transition={SPRING_SOFT}
              className="pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-xl border border-line-strong bg-surface-2/95 px-4 py-3 text-sm shadow-xl shadow-black/40 backdrop-blur"
            >
              {toast.type === 'success' ? (
                <CircleCheck className="size-4 shrink-0 text-success" />
              ) : (
                <CircleAlert className="size-4 shrink-0 text-danger" />
              )}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
