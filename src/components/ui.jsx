import { animate, motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { EASE_OUT, VIEWPORT, fadeUp, staggerGroup } from '../lib/motion.js'

export const cn = (...classes) => classes.filter(Boolean).join(' ')

// ─── Botones ────────────────────────────────────────────────────────
const BUTTON_BASE =
  'group inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium ' +
  'transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-snappy ' +
  'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0'

const BUTTON_SIZES = {
  sm: 'h-8 px-3.5 text-[0.8125rem]',
  md: 'h-10 px-5 text-sm',
  lg: 'h-11 px-6 text-sm',
  icon: 'size-9',
}

const BUTTON_VARIANTS = {
  primary:
    'bg-accent text-accent-ink hover:bg-accent-soft shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_0.5rem_1.5rem_-0.625rem_rgb(139_92_246/0.7)]',
  secondary: 'border border-line-strong bg-surface-2 text-ink hover:border-[#3b3b4c] hover:bg-surface-3',
  ghost: 'text-muted hover:bg-white/5 hover:text-ink',
  whatsapp:
    'bg-whatsapp text-[#052e16] hover:bg-[#44e585] shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_0.5rem_1.5rem_-0.75rem_rgb(37_211_102/0.6)]',
  danger: 'border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20',
}

export function buttonClasses(variant = 'primary', size = 'md', className) {
  return cn(BUTTON_BASE, BUTTON_SIZES[size], BUTTON_VARIANTS[variant], className)
}

export function Button({ variant, size, className, type = 'button', ...props }) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />
}

export function ButtonLink({ variant, size, className, ...props }) {
  return <a className={buttonClasses(variant, size, className)} {...props} />
}

/** Flecha que se desplaza 2px al pasar el cursor por el botón padre. */
export const nudge = 'transition-transform duration-200 ease-snappy group-hover:translate-x-0.5'

// ─── Aparición al hacer scroll ───────────────────────────────────────
// Solo opacidad/transform/blur: el elemento ya ocupa su sitio desde el
// primer render, así que las animaciones nunca desplazan el layout.

export function Reveal({ as = 'div', delay = 0, className, children, ...props }) {
  const Component = motion[as]
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={fadeUp}
      custom={delay}
      {...props}
    >
      {children}
    </Component>
  )
}

export function RevealGroup({ as = 'div', stagger = 0.06, delay = 0, className, children, ...props }) {
  const Component = motion[as]
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={staggerGroup(stagger, delay)}
      {...props}
    >
      {children}
    </Component>
  )
}

export function RevealItem({ as = 'div', className, children, ...props }) {
  const Component = motion[as]
  return (
    <Component className={className} variants={fadeUp} {...props}>
      {children}
    </Component>
  )
}

// ─── Tarjeta con foco de luz ─────────────────────────────────────────
function trackPointer(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--x', `${event.clientX - rect.left}px`)
  event.currentTarget.style.setProperty('--y', `${event.clientY - rect.top}px`)
}

export function SpotlightCard({ as: Component = 'div', className, onPointerMove, ...props }) {
  return (
    <Component
      className={cn('spotlight', className)}
      onPointerMove={(event) => {
        trackPointer(event)
        onPointerMove?.(event)
      }}
      {...props}
    />
  )
}

// ─── Contador animado ────────────────────────────────────────────────
/** Cuenta de 0 al valor cuando entra en pantalla. Ancho reservado: no hay saltos. */
export function CountUp({ value, duration = 1.2, delay = 0, className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!inView || !ref.current) return
    if (reduceMotion) {
      ref.current.textContent = String(value)
      return
    }
    const controls = animate(0, value, {
      duration,
      delay,
      ease: EASE_OUT,
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = String(Math.round(latest))
      },
    })
    return () => controls.stop()
  }, [inView, value, duration, delay, reduceMotion])

  return (
    <span
      ref={ref}
      className={cn('inline-block text-right tabular-nums', className)}
      style={{ minWidth: `${String(value).length}ch` }}
    >
      0
    </span>
  )
}

// ─── Piezas de texto ─────────────────────────────────────────────────
export function SectionTitle({ script, children, as: Tag = 'h2', className }) {
  return (
    <Tag
      className={cn(
        'text-[clamp(2.5rem,5.4vw,4.25rem)] leading-[0.92] font-semibold tracking-[-0.04em] uppercase',
        className,
      )}
    >
      <span className="block font-serif text-[1.08em] font-normal tracking-[-0.01em] text-accent normal-case italic">
        {script}
      </span>
      {children}
    </Tag>
  )
}

export function SubHeading({ children, className }) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <h3 className="kicker shrink-0">{children}</h3>
      <span aria-hidden className="h-px flex-1 bg-linear-to-r from-line-strong to-transparent" />
    </div>
  )
}

export function Tags({ items, className }) {
  if (!items?.length) return null
  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)}>
      {items.map((tag) => (
        <li key={tag} className="rounded-md border border-line bg-surface-2 px-2 py-0.5 text-[0.6875rem] text-muted">
          {tag}
        </li>
      ))}
    </ul>
  )
}

export function PulseDot({ className }) {
  return (
    <span className={cn('relative flex size-2', className)}>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-success/60 motion-reduce:animate-none" />
      <span className="relative inline-flex size-2 rounded-full bg-success" />
    </span>
  )
}

/** Imagen que aparece con un fundido al cargar, dentro de una caja de tamaño fijo. */
export function FadeImage({ src, alt = '', className, priority = false }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={cn(
        'absolute inset-0 size-full object-cover transition-opacity duration-500 ease-snappy',
        loaded ? 'opacity-100' : 'opacity-0',
        className,
      )}
    />
  )
}

// ─── Portada de proyecto: imagen de R2 o degradado con monograma ─────
const COVER_GRADIENTS = [
  'from-violet-600/70 via-violet-500/25 to-fuchsia-500/15',
  'from-indigo-600/70 via-violet-500/25 to-sky-400/10',
  'from-fuchsia-600/55 via-violet-600/25 to-indigo-500/15',
  'from-purple-700/70 via-indigo-500/25 to-violet-300/10',
]

function hash(text) {
  let h = 0
  for (const char of text) h = (h * 31 + char.charCodeAt(0)) | 0
  return Math.abs(h)
}

export function projectInitials(title = '') {
  return title
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 3)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function ProjectCover({ project, className, labelClassName }) {
  if (project.imageUrl) {
    return (
      <div className={cn('relative overflow-hidden bg-surface-3', className)}>
        <FadeImage src={project.imageUrl} />
      </div>
    )
  }
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-surface-2 bg-linear-to-br',
        COVER_GRADIENTS[hash(project.title ?? '') % COVER_GRADIENTS.length],
        className,
      )}
    >
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <span
        className={cn(
          'absolute inset-0 grid place-items-center text-xl font-semibold tracking-[0.3em] text-white/90',
          labelClassName,
        )}
      >
        {project.coverLabel || projectInitials(project.title)}
      </span>
    </div>
  )
}
