import { CodeXml, FolderKanban, House, Mail, Menu, User, X, ArrowRight } from 'lucide-react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { ButtonLink, cn, nudge } from '../components/ui.jsx'
import { EASE_OUT, SPRING_SNAPPY } from '../lib/motion.js'

export const SECTIONS = [
  { id: 'inicio', label: 'Inicio', icon: House },
  { id: 'perfil', label: 'Perfil', icon: User },
  { id: 'proyectos', label: 'Proyectos', icon: FolderKanban },
  { id: 'habilidades', label: 'Habilidades', icon: CodeXml },
  { id: 'contacto', label: 'Contacto', icon: Mail },
]
export const SECTION_IDS = SECTIONS.map((section) => section.id)

export function Navbar({ active }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 8))

  useEffect(() => {
    if (!open) return
    const onKey = (event) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const solid = scrolled || open

  return (
    <header
      className={cn(
        // Altura fija y posición fija: el cambio de estilo al hacer scroll es solo de color.
        'fixed inset-x-0 top-0 z-40 h-16 border-b transition-[background-color,border-color] duration-300 ease-snappy',
        solid ? 'border-line bg-bg/75 backdrop-blur-xl' : 'border-transparent',
      )}
    >
      <div className="container-page relative flex h-full items-center">
        <a
          href="#inicio"
          aria-label="Ir al inicio"
          className="grid size-9 place-items-center rounded-full border border-accent/40 text-[0.8125rem] font-semibold text-accent transition-colors duration-150 hover:border-accent hover:bg-accent/10"
        >
          LM
        </a>

        <nav
          aria-label="Principal"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 rounded-full border border-line bg-surface/80 p-1 backdrop-blur md:flex"
        >
          {SECTIONS.map((section) => {
            const isActive = active === section.id
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={isActive ? 'location' : undefined}
                className="relative rounded-full px-3.5 py-1.5 text-[0.8125rem] transition-colors duration-150"
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={SPRING_SNAPPY}
                    className="absolute inset-0 rounded-full bg-surface-3 ring-1 ring-line-strong"
                  />
                )}
                <span className={cn('relative transition-colors duration-150', isActive ? 'text-ink' : 'text-muted hover:text-ink')}>
                  {section.label}
                </span>
              </a>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ButtonLink href="#contacto" size="sm">
            Hablemos <ArrowRight className={nudge} />
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            className="grid size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:text-ink md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Menú móvil: superpuesto (absolute), no empuja el contenido. */}
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Móvil"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            // Fondo opaco: un backdrop-filter anidado dentro de la cabecera no desenfoca.
            className="absolute inset-x-0 top-16 border-b border-line bg-bg shadow-2xl shadow-black/50 md:hidden"
          >
            <ul className="container-page grid gap-1 py-3">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-[0.9375rem] transition-colors',
                      active === id ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink',
                    )}
                  >
                    <Icon className={cn('size-4', active === id && 'text-accent')} />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

/** Dock lateral de cristal esmerilado con magnificación al acercar el cursor. */
export function SideRail({ active }) {
  const pointerY = useMotionValue(Infinity)
  return (
    <aside className="fixed top-1/2 left-5 z-30 hidden -translate-y-1/2 site-lg:block">
      <nav
        aria-label="Secciones"
        onPointerMove={(event) => pointerY.set(event.clientY)}
        onPointerLeave={() => pointerY.set(Infinity)}
        className="glass-dark flex flex-col gap-2 rounded-full p-2"
      >
        {SECTIONS.map((section) => (
          <DockItem key={section.id} {...section} active={active === section.id} pointerY={pointerY} />
        ))}
      </nav>
    </aside>
  )
}

function DockItem({ id, label, icon: Icon, active, pointerY }) {
  const ref = useRef(null)
  // Distancia del cursor al centro del icono → escala con muelle (solo transform: sin reflow).
  const distance = useTransform(pointerY, (y) => {
    const rect = ref.current?.getBoundingClientRect()
    return rect ? y - (rect.top + rect.height / 2) : Infinity
  })
  const scale = useSpring(useTransform(distance, [-84, 0, 84], [1, 1.22, 1]), {
    stiffness: 380,
    damping: 26,
    mass: 0.4,
  })

  return (
    <a
      ref={ref}
      href={`#${id}`}
      aria-label={label}
      aria-current={active ? 'location' : undefined}
      className="group relative grid size-10 place-items-center rounded-full"
    >
      <motion.span
        style={{ scale }}
        className="relative grid size-10 place-items-center rounded-full transition-colors duration-150 group-hover:bg-white/[0.06]"
      >
        {active && (
          <motion.span
            layoutId="rail-pill"
            transition={SPRING_SNAPPY}
            className="absolute inset-0 rounded-full bg-accent/20 shadow-[0_0_1.375rem_-0.25rem_rgb(139_92_246/0.85)] ring-1 ring-accent/50"
          />
        )}
        <Icon
          className={cn(
            'relative size-[1.125rem] transition-colors duration-150',
            active ? 'text-accent-soft' : 'text-muted group-hover:text-ink',
          )}
        />
      </motion.span>
      <span
        role="tooltip"
        className="glass-dark pointer-events-none absolute left-full ml-4 -translate-x-1 rounded-lg px-2.5 py-1 text-xs whitespace-nowrap text-ink opacity-0 transition-[opacity,translate] duration-150 ease-snappy group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      >
        {label}
      </span>
    </a>
  )
}
