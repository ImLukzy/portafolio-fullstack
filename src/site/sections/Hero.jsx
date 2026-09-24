import { ArrowRight, ArrowUpRight, CodeXml, FolderKanban, Gauge, LayoutDashboard, Lock, Mail } from 'lucide-react'
import { motion } from 'motion/react'
import { useId } from 'react'
import { GitHubIcon, LinkedInIcon } from '../../components/BrandIcons.jsx'
import { TechIcon } from '../../components/TechIcon.jsx'
import {
  ButtonLink,
  CountUp,
  FadeImage,
  PulseDot,
  Reveal,
  RevealGroup,
  RevealItem,
  cn,
  nudge,
} from '../../components/ui.jsx'
import { telHref } from '../../lib/format.js'
import { EASE_OUT } from '../../lib/motion.js'

export function Hero({ data }) {
  const { profile, skills, projects } = data
  const heroSkills = skills.filter((skill) => skill.showInHero).slice(0, 8)

  return (
    <section id="inicio" className="relative isolate flex min-h-svh flex-col overflow-hidden pt-16">
      <Backdrop />

      <div className="container-page grid flex-1 content-center gap-12 py-12 site-lg:grid-cols-[1.15fr_0.72fr_1fr] site-lg:items-center site-lg:gap-8 site-lg:py-8">
        <RevealGroup className="flex flex-col items-start" stagger={0.07} delay={0.05}>
          <RevealItem as="p" className="kicker">
            {profile.kicker}
          </RevealItem>
          <RevealItem
            as="h1"
            className="mt-5 text-[clamp(2.75rem,6vw,4.6rem)] leading-[0.92] font-semibold tracking-[-0.045em] uppercase"
          >
            <span className="block font-serif text-[1.12em] font-normal tracking-[-0.01em] text-accent normal-case italic">
              {profile.firstName}
            </span>
            {profile.lastName}
          </RevealItem>
          <RevealItem as="p" className="mt-5 text-[0.75rem] font-medium tracking-[0.3em] text-ink/80 uppercase">
            {profile.role}
          </RevealItem>
          <RevealItem as="p" className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-pretty text-muted">
            {profile.headline}
          </RevealItem>
          <RevealItem className="mt-7 flex flex-wrap gap-2.5">
            {profile.cvUrl && (
              <ButtonLink href={profile.cvUrl} target="_blank" rel="noopener">
                Ver CV <ArrowUpRight className="transition-transform duration-200 ease-snappy group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </ButtonLink>
            )}
            <ButtonLink href="#proyectos" variant="secondary">
              Ver proyectos
            </ButtonLink>
          </RevealItem>
          {profile.heroQuote && (
            <RevealItem as="blockquote" className="mt-7 max-w-md border-l border-accent/40 pl-4 text-sm leading-relaxed text-muted">
              “{profile.heroQuote}”
            </RevealItem>
          )}
          <RevealItem className="mt-6 flex flex-wrap gap-2">
            <SocialLinks profile={profile} />
          </RevealItem>
        </RevealGroup>

        <Reveal delay={0.2} className="flex justify-center pt-4 pb-6">
          <HeroPortrait profile={profile} />
        </Reveal>

        <RevealGroup className="flex flex-col gap-5" stagger={0.08} delay={0.3}>
          {heroSkills.length > 0 && (
            <RevealItem>
              <p className="kicker">Tecnología que construyo</p>
              <TechCards skills={heroSkills} />
            </RevealItem>
          )}
          <RevealItem>
            <Float distance={5} duration={7} delay={0.6}>
              <AdminMockup profile={profile} projects={projects} skills={skills} />
            </Float>
          </RevealItem>
        </RevealGroup>
      </div>

      <div className="container-page pb-8">
        <Reveal delay={0.45}>
          <InfoBar profile={profile} />
        </Reveal>
      </div>
    </section>
  )
}

function Backdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_65%,transparent)]"
    >
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_40%_0%,black,transparent)]" />
      <div className="absolute -top-48 left-[5%] size-[40rem] rounded-full bg-accent-strong/20 blur-[8.75rem]" />
      <div className="absolute right-[-10%] bottom-[-25%] size-[32rem] rounded-full bg-indigo-500/10 blur-[8.75rem]" />
      {/* Guiño al corte diagonal del diseño original */}
      <div className="absolute inset-0 bg-[linear-gradient(112deg,transparent_60%,rgb(139_92_246/0.035)_60%)] max-site-lg:hidden" />
    </div>
  )
}

export function SocialLinks({ profile, className }) {
  const links = [
    profile.linkedinUrl && { href: profile.linkedinUrl, label: 'LinkedIn', icon: LinkedInIcon },
    profile.githubUrl && { href: profile.githubUrl, label: 'GitHub', icon: GitHubIcon },
  ].filter(Boolean)

  return links.map(({ href, label, icon: Icon }) => (
    <a
      key={label}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex h-8 items-center gap-2 rounded-full border border-line px-3.5 text-[0.8125rem] text-muted transition-colors duration-150 hover:border-accent/50 hover:text-ink',
        className,
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </a>
  ))
}

/** Flotación continua y sutil (solo transform). Se desactiva con "reducir movimiento". */
function Float({ children, distance = 4, duration = 5, delay = 0, className }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

// ─── Tarjetas de tecnologías: cristal claro, logo a color, flotación desfasada ───
function TechCards({ skills }) {
  // Entre 1024 y 1279 px la columna es estrecha: menos separación y letra algo menor.
  return (
    <ul className="mt-4 grid grid-cols-4 gap-2.5 sm:gap-3 site-lg:gap-2 site-xl:gap-3">
      {skills.map((skill, index) => (
        <li key={skill.id}>
          <Float distance={3} duration={4.8 + (index % 3) * 0.7} delay={(index % 4) * 0.35 + Math.floor(index / 4) * 0.5}>
            <div className="glass-card group flex flex-col items-center gap-1.5 rounded-2xl px-1.5 pt-3 pb-2.5 text-center site-lg:px-1 site-xl:px-1.5 transition-[translate,box-shadow] duration-300 ease-snappy hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1.375rem_2.5rem_-1rem_rgb(0_0_0/0.85),0_0.625rem_1.625rem_-0.625rem_rgb(139_92_246/0.55)]">
              <TechIcon skill={skill} className="transition-transform duration-300 ease-snappy group-hover:scale-110" />
              <div className="w-full min-w-0">
                <div title={skill.name} className="truncate text-[0.75rem] leading-tight font-semibold text-glass-ink site-lg:text-[0.6875rem] site-lg:tracking-tight site-xl:text-[0.75rem] site-xl:tracking-normal">
                  {skill.name}
                </div>
                <div className="mt-0.5 truncate text-[0.6563rem] leading-tight text-glass-muted">{skill.caption || ' '}</div>
              </div>
            </div>
          </Float>
        </li>
      ))}
    </ul>
  )
}

// ─── Retrato recortado con halo violeta ─────────────────────────────
// Caja 4:5 con un disco en la parte inferior. La foto se dibuja en dos capas:
// la mitad inferior se recorta al círculo y la superior queda libre, así la
// cabeza puede sobresalir del disco (efecto "pop-out" de foto recortada).
function HeroPortrait({ profile }) {
  const name = `${profile.firstName} ${profile.lastName}`
  // Ancho acotado a la columna central (0.72fr) para no estrechar el texto de la izquierda.
  return (
    <div className="relative aspect-[4/5] w-[clamp(12.5rem,18vw,16.25rem)]">
      {/* Halo: resplandor morado difuminado detrás de todo */}
      <div
        aria-hidden
        className="absolute inset-x-[-22%] top-[6%] bottom-[-10%] rounded-full bg-[radial-gradient(closest-side,rgb(139_92_246/0.6),rgb(139_92_246/0.22)_55%,transparent)] blur-2xl"
      />
      {/* Disco con degradado profundo */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 aspect-square rounded-full bg-[radial-gradient(circle_at_50%_28%,#4a3590_0%,#241a4a_42%,#110c24_72%)] shadow-[0_0_5.625rem_-0.75rem_rgb(139_92_246/0.8),inset_0_0_3.75rem_rgb(139_92_246/0.35)]"
      />
      {/* Anillo de luz girando alrededor del disco */}
      <div
        aria-hidden
        className="absolute inset-x-[-0.1875rem] bottom-[-0.1875rem] aspect-square animate-[spin-slow_14s_linear_infinite] rounded-full [background:conic-gradient(from_0deg,transparent_0%,transparent_45%,#8b5cf6_72%,#ede9fe_88%,transparent_100%)] [mask:radial-gradient(farthest-side,transparent_calc(100%_-_2px),black_calc(100%_-_1.5px))] motion-reduce:animate-none"
      />

      {profile.avatarUrl ? (
        <PortraitLayers>
          {(className) => <FadeImage src={profile.avatarUrl} alt={name} priority className={className} />}
        </PortraitLayers>
      ) : (
        <PortraitLayers>{(className) => <PortraitPlaceholder className={className} />}</PortraitLayers>
      )}

      <div className="glass-dark absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs whitespace-nowrap">
        <PulseDot />
        Disponible
      </div>
    </div>
  )
}

function PortraitLayers({ children }) {
  // La imagen ocupa toda la caja 4:5 anclada abajo; el disco mide el 80 % inferior.
  const image = 'absolute inset-x-0 bottom-0 h-full w-full object-contain object-bottom'
  return (
    <>
      <div className="absolute inset-x-0 bottom-0 aspect-square overflow-hidden rounded-full">
        <div className="absolute inset-x-0 bottom-0 h-[125%]">{children(image)}</div>
      </div>
      {/* Capa superior: visible solo por encima del centro del disco (60 % de la altura) */}
      <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_60%,transparent_60%)]">
        {children(image)}
      </div>
    </>
  )
}

/** Silueta mientras no subas tu foto desde /admin → Perfil. */
function PortraitPlaceholder({ className }) {
  const gradientId = `silhouette-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMax meet" className={className} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ddd6fe" stopOpacity="0.55" />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="98" r="40" fill={`url(#${gradientId})`} />
      <path d="M30 250c0-58 31-92 70-92s70 34 70 92z" fill={`url(#${gradientId})`} />
    </svg>
  )
}

// ─── Vista previa del panel de administración ───────────────────────
const MOCK_NAV = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Proyectos', icon: FolderKanban },
  { label: 'Habilidades', icon: Gauge },
  { label: 'Contacto', icon: Mail },
]
const ACTIVITY = [32, 48, 40, 62, 45, 74, 58, 80, 52, 88, 66, 94]

function AdminMockup({ profile, projects, skills }) {
  const technologies = skills.filter((skill) => skill.group !== 'AREA').length
  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-5 -z-10 rounded-[2rem] bg-accent-strong/15 blur-3xl" />
      <div className="glass-dark overflow-hidden rounded-2xl">
        <div className="flex items-center border-b border-white/[0.06] px-3 py-2">
          <div className="flex w-12 gap-1.5">
            <span className="size-2 rounded-full bg-[#ff5f57]/80" />
            <span className="size-2 rounded-full bg-[#febc2e]/80" />
            <span className="size-2 rounded-full bg-[#28c840]/80" />
          </div>
          <div className="mx-auto flex items-center gap-1.5 rounded-md bg-white/[0.05] px-2.5 py-0.5 font-mono text-[0.625rem] text-subtle">
            <Lock className="size-2.5" /> portafolio/admin
          </div>
          <div className="w-12" />
        </div>

        <div className="grid sm:grid-cols-[6.75rem_1fr]">
          <div className="hidden border-r border-white/[0.06] p-2 sm:block">
            <div className="flex items-center gap-1.5 px-1.5 pt-0.5 pb-2.5">
              <span className="grid size-5 place-items-center rounded-md bg-accent/20 text-[0.5rem] font-bold text-accent-soft">LM</span>
              <span className="text-[0.6875rem] font-semibold">Portfolio</span>
            </div>
            {MOCK_NAV.map(({ label, icon: Icon }, index) => (
              <div
                key={label}
                className={cn(
                  'relative flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[0.6563rem]',
                  index === 0 ? 'bg-accent/15 text-accent-soft' : 'text-subtle',
                )}
              >
                {index === 0 && <span className="absolute top-1 bottom-1 left-0 w-0.5 rounded-full bg-accent" />}
                <Icon className="size-3" />
                {label}
              </div>
            ))}
          </div>

          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[0.7813rem] font-medium">Panel general</div>
                <div className="text-[0.6563rem] text-subtle">¡Bienvenido, {profile.firstName}!</div>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-success/10 px-1.5 py-0.5 text-[0.5938rem] text-success">
                <span className="size-1 rounded-full bg-success" /> En línea
              </span>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <MockStat icon={FolderKanban} value={projects.length} label="Proyectos" points="0,14 8,11 16,12 24,7 32,8 40,3 48,1" />
              <MockStat icon={CodeXml} value={technologies} label="Tecnologías" points="0,13 8,12 16,8 24,9 32,5 40,6 48,2" />
            </div>
            <div className="mt-2.5 rounded-lg border border-white/[0.06] bg-white/[0.025] p-2">
              <div className="text-[0.5938rem] text-subtle">Actividad</div>
              <div className="mt-1.5 flex h-9 items-end gap-1">
                {ACTIVITY.map((height, index) => (
                  <motion.span
                    key={index}
                    className="flex-1 origin-bottom rounded-sm bg-linear-to-t from-accent-strong/50 to-accent-soft/90"
                    style={{ height: `${height}%` }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.7 + index * 0.04 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MockStat({ icon: Icon, value, label, points }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
      <div className="flex items-center justify-between">
        <span className="grid size-5 place-items-center rounded-md bg-accent/15 text-accent-soft">
          <Icon className="size-3" />
        </span>
        <svg viewBox="0 0 48 16" className="h-4 w-12" aria-hidden>
          <motion.polyline
            points={points}
            fill="none"
            stroke="#a78bfa"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.8 }}
          />
        </svg>
      </div>
      <div className="mt-1.5 text-base leading-tight font-semibold">
        <CountUp value={value} delay={0.6} />
        <span className="text-accent">+</span>
      </div>
      <div className="text-[0.625rem] text-subtle">{label}</div>
    </div>
  )
}

function InfoBar({ profile }) {
  const items = [
    profile.phone && { label: 'Teléfono', value: profile.phone, href: telHref(profile) },
    { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    profile.availableFor && { label: 'Disponible para', value: profile.availableFor },
  ].filter(Boolean)

  return (
    <div className="surface grid gap-4 p-4 sm:grid-cols-2 site-lg:grid-cols-[1fr_1.3fr_1.5fr_auto] site-lg:items-center site-lg:gap-6 site-lg:px-6">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <div className="text-[0.625rem] font-medium tracking-[0.22em] text-accent/80 uppercase">{item.label}</div>
          {item.href ? (
            <a href={item.href} className="block truncate text-sm transition-colors hover:text-accent-soft">
              {item.value}
            </a>
          ) : (
            <div className="truncate text-sm">{item.value}</div>
          )}
        </div>
      ))}
      <ButtonLink href="#contacto" className="sm:justify-self-start site-lg:justify-self-end">
        Conectemos <ArrowRight className={nudge} />
      </ButtonLink>
    </div>
  )
}
