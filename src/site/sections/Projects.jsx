import { ArrowRight, ArrowUpRight, Star, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { GitHubIcon } from '../../components/BrandIcons.jsx'
import {
  Button,
  ButtonLink,
  ProjectCover,
  Reveal,
  RevealGroup,
  RevealItem,
  SectionTitle,
  SpotlightCard,
  SubHeading,
  Tags,
  cn,
  nudge,
} from '../../components/ui.jsx'
import { EASE_OUT, SPRING_SNAPPY, SPRING_SOFT } from '../../lib/motion.js'

const ALL = '__all__'

export function Projects({ data }) {
  const { projects, profile } = data
  const featured = projects.find((project) => project.featured) ?? projects[0]
  const rest = useMemo(() => projects.filter((project) => project !== featured), [projects, featured])
  const categories = useMemo(() => [...new Set(rest.flatMap((project) => project.categories))], [rest])

  const [filter, setFilter] = useState(ALL)
  const [selected, setSelected] = useState(null)
  const close = useCallback(() => setSelected(null), [])

  const visible = filter === ALL ? rest : rest.filter((project) => project.categories.includes(filter))
  const minHeight = useStableGridHeight(filter === ALL)

  if (!featured) return null

  return (
    <section id="proyectos" className="py-24 site-lg:py-32">
      <div className="container-page">
        <div className="grid gap-10 site-lg:grid-cols-[0.9fr_1.1fr] site-lg:items-center site-lg:gap-12">
          <RevealGroup>
            <RevealItem as="p" className="kicker">
              {profile.kicker}
            </RevealItem>
            <RevealItem className="mt-5">
              <SectionTitle script="Mis">Proyectos</SectionTitle>
            </RevealItem>
            {profile.projectsIntro && (
              <RevealItem as="p" className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-muted">
                {profile.projectsIntro}
              </RevealItem>
            )}
            {categories.length > 0 && (
              <RevealItem className="mt-7">
                <FilterChips
                  categories={categories}
                  projects={rest}
                  value={filter}
                  onChange={setFilter}
                />
              </RevealItem>
            )}
          </RevealGroup>

          <Reveal delay={0.1}>
            <FeaturedProject project={featured} onOpen={() => setSelected(featured)} />
          </Reveal>
        </div>

        {rest.length > 0 && (
          <>
            <SubHeading className="mt-20">Más proyectos</SubHeading>
            {/* Altura mínima = la de "Todos": filtrar nunca desplaza las secciones de abajo. */}
            <div ref={minHeight.ref} style={{ minHeight: minHeight.value }} className="mt-6">
              <div className="grid gap-3 sm:grid-cols-2 site-lg:grid-cols-4">
                <AnimatePresence mode="popLayout" initial={false}>
                  {visible.map((project) => (
                    <motion.div
                      key={project.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 0.96, filter: 'blur(4px)', transition: { duration: 0.18 } }}
                      transition={{ duration: 0.35, ease: EASE_OUT, layout: SPRING_SOFT }}
                    >
                      <ProjectCard project={project} onOpen={() => setSelected(project)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {visible.length === 0 && (
                <p className="py-10 text-center text-sm text-muted">No hay más proyectos en esta categoría.</p>
              )}
            </div>
          </>
        )}
      </div>

      <ProjectDialog project={selected} onClose={close} />
    </section>
  )
}

/** Mide la cuadrícula completa y la usa como altura mínima mientras hay un filtro activo. */
function useStableGridHeight(isFullGrid) {
  const ref = useRef(null)
  const [value, setValue] = useState(undefined)

  useLayoutEffect(() => {
    if (!isFullGrid || !ref.current) return
    const grid = ref.current.firstElementChild
    const observer = new ResizeObserver(([entry]) => setValue(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height))
    observer.observe(grid)
    return () => observer.disconnect()
  }, [isFullGrid])

  return { ref, value }
}

function FilterChips({ categories, projects, value, onChange }) {
  const chips = [
    { value: ALL, label: 'Todos', count: projects.length },
    ...categories.map((category) => ({
      value: category,
      label: category,
      count: projects.filter((project) => project.categories.includes(category)).length,
    })),
  ]
  return (
    <div role="group" aria-label="Filtrar proyectos" className="flex flex-wrap gap-1.5">
      {chips.map((chip) => {
        const active = chip.value === value
        return (
          <button
            key={chip.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(chip.value)}
            className={cn(
              'relative h-9 rounded-full border px-4 text-[0.8125rem] transition-[border-color,transform] duration-150 ease-snappy active:scale-[0.97]',
              active ? 'border-transparent' : 'border-line hover:border-line-strong',
            )}
          >
            {active && (
              <motion.span layoutId="filter-pill" transition={SPRING_SNAPPY} className="absolute inset-0 rounded-full bg-accent" />
            )}
            <span
              className={cn(
                'relative flex items-center gap-2 transition-colors duration-150',
                active ? 'font-medium text-accent-ink' : 'text-muted hover:text-ink',
              )}
            >
              {chip.label}
              <span className={cn('text-[0.6875rem] tabular-nums', active ? 'text-accent-ink/60' : 'text-subtle')}>
                {chip.count}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

function FeaturedProject({ project, onOpen }) {
  return (
    <SpotlightCard className="grid items-center gap-6 overflow-hidden rounded-2xl border border-accent/25 bg-surface p-5 shadow-[0_2.5rem_6.25rem_-3.125rem_rgb(139_92_246/0.6)] sm:grid-cols-[1fr_0.95fr] sm:p-6">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[0.6875rem] font-medium text-accent-soft">
          <Star className="size-3 fill-current" />
          Proyecto destacado
        </span>
        <h3 className="mt-4 text-2xl leading-tight font-semibold tracking-tight text-balance">{project.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{project.summary}</p>
        <Tags items={project.tags} className="mt-4" />
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={onOpen}>
            Ver proyecto <ArrowRight className={nudge} />
          </Button>
          {project.liveUrl && (
            <ButtonLink href={project.liveUrl} target="_blank" rel="noopener noreferrer" variant="ghost">
              Demo <ArrowUpRight />
            </ButtonLink>
          )}
        </div>
      </div>
      <ProjectCover project={project} className="aspect-[4/3] rounded-xl border border-line" labelClassName="text-4xl" />
    </SpotlightCard>
  )
}

function ProjectCard({ project, onOpen }) {
  return (
    <SpotlightCard
      as="button"
      type="button"
      onClick={onOpen}
      className="surface flex h-full w-full flex-col overflow-hidden text-left transition-[border-color,transform] duration-300 ease-snappy hover:-translate-y-0.5 hover:border-line-strong active:scale-[0.99]"
    >
      <ProjectCover project={project} className="aspect-[16/10] w-full border-b border-line" />
      <div className="flex flex-1 flex-col p-4">
        <h4 className="text-[0.9375rem] font-medium tracking-tight">{project.title}</h4>
        <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted">{project.summary}</p>
        <Tags items={project.tags} className="mt-auto pt-4" />
      </div>
    </SpotlightCard>
  )
}

function ProjectDialog({ project, onClose }) {
  const closeButton = useRef(null)

  useEffect(() => {
    if (!project) return
    const previousFocus = document.activeElement
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    // scrollbar-gutter: stable (styles.css) evita que el contenido salte al ocultar el scroll.
    root.style.overflow = 'hidden'
    closeButton.current?.focus()
    const onKey = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      root.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
  }, [project, onClose])

  return (
    <AnimatePresence>
      {project && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center p-4" initial="closed" animate="open" exit="closed">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={{ closed: { opacity: 0 }, open: { opacity: 1 } }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-dialog-title"
            className="relative max-h-[88svh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-2xl border border-line-strong bg-surface shadow-2xl shadow-black/60"
            variants={{
              closed: { opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.15, ease: EASE_OUT } },
              open: { opacity: 1, scale: 1, y: 0, transition: SPRING_SOFT },
            }}
          >
            <ProjectCover project={project} className="aspect-[16/8] w-full border-b border-line" labelClassName="text-5xl" />
            <button
              ref={closeButton}
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-3 right-3 grid size-9 place-items-center rounded-full border border-white/10 bg-black/40 text-white/80 backdrop-blur transition-colors hover:bg-black/60 hover:text-white"
            >
              <X className="size-4" />
            </button>
            <div className="p-6 sm:p-8">
              {project.categories.length > 0 && (
                <p className="text-xs font-medium tracking-wide text-accent">{project.categories.join(' · ')}</p>
              )}
              <h3 id="project-dialog-title" className="mt-2 text-2xl font-semibold tracking-tight text-balance">
                {project.title}
              </h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed whitespace-pre-line text-muted">
                {project.description || project.summary}
              </p>
              <Tags items={project.tags} className="mt-5" />
              {(project.liveUrl || project.repoUrl) && (
                <div className="mt-7 flex flex-wrap gap-2">
                  {project.liveUrl && (
                    <ButtonLink href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      Ver en vivo <ArrowUpRight />
                    </ButtonLink>
                  )}
                  {project.repoUrl && (
                    <ButtonLink href={project.repoUrl} target="_blank" rel="noopener noreferrer" variant="secondary">
                      <GitHubIcon /> Código
                    </ButtonLink>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
