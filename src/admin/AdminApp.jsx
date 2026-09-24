import { ArrowLeft, LoaderCircle, Lock } from 'lucide-react'
import { AnimatePresence, motion, useAnimate } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '../components/ui.jsx'
import { api } from '../lib/api.js'
import { EASE_OUT } from '../lib/motion.js'
import { AdminShell } from './AdminShell.jsx'
import { AdminContext, ToastProvider } from './context.jsx'

export default function AdminApp() {
  const [session, setSession] = useState({ state: 'checking' })
  const [status, setStatus] = useState(null)

  useEffect(() => {
    document.title = 'Admin · Portafolio'
    // El panel no debe aparecer en buscadores.
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.append(robots)

    api
      .get('/auth/session')
      .then((s) => setSession({ state: s.authenticated ? 'in' : 'out', configured: s.configured }))
      .catch(() => setSession({ state: 'out', configured: true, offline: true }))

    return () => robots.remove()
  }, [])

  useEffect(() => {
    if (session.state !== 'in') return
    api.get('/admin/status').then(setStatus).catch(() => setStatus({ database: 'error', r2: false }))
  }, [session.state])

  const expire = useCallback(() => setSession({ state: 'out', configured: true, expired: true }), [])
  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {})
    setSession({ state: 'out', configured: true })
  }, [])

  const context = useMemo(() => ({ expire, logout, status }), [expire, logout, status])

  return (
    <ToastProvider>
      <AnimatePresence mode="wait">
        {session.state === 'out' && (
          <PinGate key="gate" session={session} onSuccess={() => setSession({ state: 'in' })} />
        )}
        {session.state === 'in' && (
          <motion.div
            key="shell"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <AdminContext.Provider value={context}>
              <AdminShell />
            </AdminContext.Provider>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastProvider>
  )
}

function PinGate({ session, onSuccess }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(() => {
    if (session.offline) return 'No se pudo conectar con el servidor (¿está corriendo npm run dev?).'
    if (session.expired) return 'Tu sesión expiró. Ingresa tu PIN otra vez.'
    return null
  })
  const [loading, setLoading] = useState(false)
  const [scope, animate] = useAnimate()

  const submit = async (event) => {
    event.preventDefault()
    if (pin.length < 4 || loading) return
    setLoading(true)
    try {
      await api.post('/auth/login', { pin })
      onSuccess()
    } catch (loginError) {
      setError(loginError.message)
      setPin('')
      setLoading(false)
      // Sacudida lateral: feedback físico inmediato, sin cambiar el layout.
      animate(scope.current, { x: [0, -10, 9, -6, 4, -2, 0] }, { duration: 0.45, ease: 'easeOut' })
    }
  }

  return (
    <motion.div
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="relative isolate grid min-h-svh place-items-center overflow-hidden px-5"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_45%,black,transparent)]" />
        <div className="absolute top-1/2 left-1/2 size-[30rem] -translate-1/2 rounded-full bg-accent-strong/15 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="w-full max-w-sm"
      >
        <form ref={scope} onSubmit={submit} className="surface p-8 text-center shadow-2xl shadow-black/40">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-accent/40 bg-accent/10 text-accent-soft">
            <Lock className="size-5" />
          </span>
          <h1 className="mt-5 text-lg font-semibold tracking-tight">Panel de administración</h1>
          <p className="mt-1 text-sm text-muted">Ingresa tu PIN para gestionar el portafolio.</p>

          {/* Usuario oculto: ayuda a gestores de contraseñas y accesibilidad. */}
          <input type="text" name="username" autoComplete="username" value="admin" readOnly hidden />
          <input
            type="password"
            autoComplete="current-password"
            autoFocus
            maxLength={128}
            aria-label="PIN o contraseña"
            aria-invalid={Boolean(error)}
            aria-describedby="pin-error"
            value={pin}
            onChange={(event) => {
              // Acepta PIN numérico o contraseña con letras y símbolos.
              setPin(event.target.value)
              if (error) setError(null)
            }}
            placeholder="••••••"
            className="mt-6 h-14 w-full rounded-xl border border-line bg-surface-2 px-4 text-center text-lg tracking-[0.2em] text-ink transition-[border-color,box-shadow] duration-150 placeholder:text-line-strong focus:border-accent/60 focus:ring-2 focus:ring-accent/15 focus:outline-none"
          />
          {/* Altura reservada: el mensaje de error no empuja el botón. */}
          <p id="pin-error" role="alert" className="mt-2 min-h-5 text-xs text-danger">
            {error}
          </p>

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={pin.length < 4 || loading}>
            {loading ? <LoaderCircle className="animate-spin" /> : 'Entrar'}
          </Button>

          {!session.configured && (
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Aún no hay PIN: define <code className="text-ink">ADMIN_PIN</code> en <code className="text-ink">.env</code> y
              reinicia el servidor.
            </p>
          )}
        </form>
        <a
          href="/"
          className="mt-6 flex items-center justify-center gap-1.5 text-xs text-subtle transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" /> Volver al portafolio
        </a>
      </motion.div>
    </motion.div>
  )
}
