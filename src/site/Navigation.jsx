import { CodeXml, FolderKanban, House, Mail, Menu, User, X, ArrowRight } from 'lucide-react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useState } from 'react'
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
          className="grid size-9 place-items-center rounded-full border border-accent/40 text-[13px] font-semibold text-accent transition-colors duration-150 hover:border-accent hover:bg-accent/10"
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
                className="relative rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-150"
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
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] transition-colors',
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

export function SideRail({ active }) {
  return (
    <aside className="fixed top-1/2 left-4 z-30 hidden -translate-y-1/2 lg:block">
      <nav
        aria-label="Secciones"
        className="flex flex-col gap-1 rounded-full border border-line bg-surface/80 p-1.5 backdrop-blur"
      >
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <a
              key={id}
              href={`#${id}`}
              aria-label={label}
              aria-current={isActive ? 'location' : undefined}
              className="group relative grid size-9 place-items-center rounded-full"
            >
              {isActive && (
                <motion.span
                  layoutId="rail-pill"
                  transition={SPRING_SNAPPY}
                  className="absolute inset-0 rounded-full bg-accent/15 ring-1 ring-accent/40"
                />
              )}
              <Icon
                className={cn(
                  'relative size-4 transition-colors duration-150',
                  isActive ? 'text-accent-soft' : 'text-subtle group-hover:text-ink',
                )}
              />
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full ml-3 -translate-x-1 rounded-md border border-line bg-surface-2 px-2 py-1 text-xs whitespace-nowrap text-ink opacity-0 transition-[opacity,transform] duration-150 ease-snappy group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
              >
                {label}
              </span>
            </a>
          )
        })}
      </nav>
    </aside>
  )
}
