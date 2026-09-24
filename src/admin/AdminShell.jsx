import { ExternalLink, LogOut, User } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Navigate, NavLink, useLocation } from 'react-router'
import { cn } from '../components/ui.jsx'
import { EASE_OUT, SPRING_SNAPPY } from '../lib/motion.js'
import { CollectionEditor } from './CollectionEditor.jsx'
import { COLLECTIONS } from './config.js'
import { useAdmin } from './context.jsx'
import { ProfileEditor } from './ProfileEditor.jsx'

const NAV = [
  { to: '/admin/perfil', label: 'Perfil', icon: User },
  ...Object.entries(COLLECTIONS).map(([slug, config]) => ({ to: `/admin/${slug}`, label: config.title, icon: config.icon })),
]

export function AdminShell() {
  const { logout, status } = useAdmin()
  const section = useLocation().pathname.split('/')[2]

  // Las redirecciones se resuelven aquí, fuera de AnimatePresence: un <Navigate>
  // dentro del árbol que sale se volvería a disparar en cada cambio de ruta.
  if (section !== 'perfil' && !Object.hasOwn(COLLECTIONS, section)) {
    return <Navigate to="/admin/perfil" replace />
  }

  return (
    <div className="min-h-svh lg:pl-64">
      {/* Barra lateral (escritorio) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-surface/40 p-4 lg:flex">
        <Brand />
        <nav aria-label="Secciones del CMS" className="mt-8 space-y-0.5">
          {NAV.map((item) => (
            <SideLink key={item.to} {...item} />
          ))}
        </nav>
        <div className="mt-auto space-y-3">
          <StatusCard status={status} />
          <div className="flex gap-1">
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-muted transition-colors hover:bg-white/5 hover:text-ink"
            >
              <ExternalLink className="size-4" /> Ver sitio
            </a>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-muted transition-colors hover:bg-white/5 hover:text-ink"
            >
              <LogOut className="size-4" /> Salir
            </button>
          </div>
        </div>
      </aside>

      {/* Cabecera (móvil) */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-xl lg:hidden">
        <div className="flex h-14 items-center justify-between px-5">
          <Brand compact />
          <div className="flex items-center gap-1">
            <a href="/" target="_blank" rel="noopener" aria-label="Ver sitio" className="grid size-9 place-items-center rounded-lg text-muted hover:text-ink">
              <ExternalLink className="size-4" />
            </a>
            <button type="button" onClick={logout} aria-label="Cerrar sesión" className="grid size-9 place-items-center rounded-lg text-muted hover:text-ink">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
        <nav aria-label="Secciones del CMS" className="flex gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none]">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'shrink-0 rounded-lg px-3 py-1.5 text-[13px] transition-colors',
                  isActive ? 'bg-surface-3 text-ink' : 'text-muted hover:text-ink',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:py-14">
        {status?.database === 'not_configured' && (
          <Banner>
            La base de datos no está configurada. Define <code className="text-ink">DATABASE_URL</code> en{' '}
            <code className="text-ink">.env</code> y reinicia el servidor.
          </Banner>
        )}
        {status?.database === 'error' && (
          <Banner>No se pudo conectar con Neon. Revisa DATABASE_URL y que la base de datos esté activa.</Banner>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            {section === 'perfil' ? <ProfileEditor /> : <CollectionEditor config={COLLECTIONS[section]} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

function Brand({ compact }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <span className="grid size-9 place-items-center rounded-xl border border-accent/40 bg-accent/10 text-[13px] font-semibold text-accent">
        LM
      </span>
      <div className="leading-tight">
        <div className="text-sm font-medium">Portafolio</div>
        {!compact && <div className="text-xs text-subtle">Panel de administración</div>}
      </div>
    </div>
  )
}

function SideLink({ to, label, icon: Icon }) {
  return (
    <NavLink to={to} className="relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px]">
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="admin-nav"
              transition={SPRING_SNAPPY}
              className="absolute inset-0 rounded-lg bg-surface-3 ring-1 ring-line-strong"
            />
          )}
          <Icon className={cn('relative size-4 transition-colors', isActive ? 'text-accent-soft' : 'text-subtle')} />
          <span className={cn('relative transition-colors', isActive ? 'text-ink' : 'text-muted hover:text-ink')}>{label}</span>
        </>
      )}
    </NavLink>
  )
}

function StatusCard({ status }) {
  const database = {
    connected: ['bg-success', 'Conectada'],
    not_configured: ['bg-subtle', 'Sin configurar'],
    error: ['bg-danger', 'Error de conexión'],
  }[status?.database] ?? ['bg-line-strong', 'Comprobando…']
  const r2 = status ? (status.r2 ? ['bg-success', 'Configurado'] : ['bg-subtle', 'Sin configurar']) : ['bg-line-strong', 'Comprobando…']

  return (
    <div className="space-y-2 rounded-xl border border-line bg-surface p-3 text-xs">
      <StatusLine label="Neon" dot={database[0]} text={database[1]} />
      <StatusLine label="Cloudflare R2" dot={r2[0]} text={r2[1]} />
    </div>
  )
}

function StatusLine({ label, dot, text }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted">{label}</span>
      <span className="flex items-center gap-1.5 text-ink/80">
        <span className={cn('size-1.5 rounded-full', dot)} />
        {text}
      </span>
    </div>
  )
}

function Banner({ children }) {
  return (
    <p className="mb-8 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-200/90">{children}</p>
  )
}
