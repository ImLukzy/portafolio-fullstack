import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { GitHubIcon, LinkedInIcon } from '../../components/BrandIcons.jsx'
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
import { initials, telHref } from '../../lib/format.js'

export function Hero({ data }) {
  const { profile, skills, projects } = data
  const heroSkills = skills.filter((skill) => skill.showInHero).slice(0, 8)

  return (
    <section id="inicio" className="relative isolate flex min-h-svh flex-col overflow-hidden pt-16">
      <Backdrop />

      <div className="container-page grid flex-1 content-center gap-12 py-12 lg:grid-cols-[1.15fr_0.72fr_1fr] lg:items-center lg:gap-8 lg:py-10">
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
          <RevealItem as="p" className="mt-5 text-[12px] font-medium tracking-[0.3em] text-ink/80 uppercase">
            {profile.role}
          </RevealItem>
          <RevealItem as="p" className="mt-4 max-w-md text-[15px] leading-relaxed text-pretty text-muted">
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

        <Reveal delay={0.2} className="flex justify-center py-4">
          <AvatarOrb profile={profile} />
        </Reveal>

        <RevealGroup className="flex flex-col gap-5" stagger={0.08} delay={0.3}>
          {heroSkills.length > 0 && (
            <RevealItem>
              <p className="kicker">Tecnología que construyo</p>
              <ul className="mt-3 grid grid-cols-4 gap-2">
                {heroSkills.map((skill) => (
                  <li
                    key={skill.id}
                    className="group rounded-xl border border-line bg-surface-2/60 px-1.5 py-2.5 text-center transition-colors duration-200 hover:border-accent/40 hover:bg-surface-3"
                  >
                    <div className="text-sm font-semibold transition-colors duration-200 group-hover:text-accent-soft">
                      {skill.abbr || skill.name}
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-subtle">{skill.caption || skill.name}</div>
                  </li>
                ))}
              </ul>
            </RevealItem>
          )}
          <RevealItem>
            <MiniDashboard profile={profile} projects={projects} skills={skills} />
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
      <div className="absolute -top-48 left-[5%] size-[40rem] rounded-full bg-accent-strong/20 blur-[140px]" />
      <div className="absolute right-[-10%] bottom-[-25%] size-[32rem] rounded-full bg-indigo-500/10 blur-[140px]" />
      {/* Guiño al corte diagonal del diseño original */}
      <div className="absolute inset-0 bg-[linear-gradient(112deg,transparent_60%,rgb(139_92_246/0.035)_60%)] max-lg:hidden" />
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
        'inline-flex h-8 items-center gap-2 rounded-full border border-line px-3.5 text-[13px] text-muted transition-colors duration-150 hover:border-accent/50 hover:text-ink',
        className,
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </a>
  ))
}

function AvatarOrb({ profile }) {
  return (
    <div className="relative aspect-square w-[clamp(180px,19vw,248px)]">
      <div aria-hidden className="absolute -inset-8 rounded-full bg-accent-strong/25 blur-3xl" />
      {/* Anillo cónico girando: solo transform, compuesto en GPU. */}
      <div
        aria-hidden
        className="absolute inset-0 animate-[spin-slow_12s_linear_infinite] rounded-full [background:conic-gradient(from_0deg,transparent_0%,transparent_40%,#8b5cf6_70%,#ddd6fe_86%,transparent_100%)] motion-reduce:animate-none"
      />
      <div className="absolute inset-[3px] grid place-items-center overflow-hidden rounded-full bg-surface ring-1 ring-line">
        {profile.avatarUrl ? (
          <FadeImage src={profile.avatarUrl} alt={`${profile.firstName} ${profile.lastName}`} />
        ) : (
          <span className="font-serif text-[clamp(3.5rem,6vw,5rem)] text-accent italic">{initials(profile)}</span>
        )}
      </div>
      <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line-strong bg-surface-2/90 px-3 py-1.5 text-xs whitespace-nowrap backdrop-blur">
        <PulseDot />
        Disponible
      </div>
    </div>
  )
}

function MiniDashboard({ profile, projects, skills }) {
  const technologies = skills.filter((skill) => skill.group !== 'AREA').length
  return (
    <div className="surface overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-line px-3 py-2.5">
        <span className="size-2 rounded-full bg-line-strong" />
        <span className="size-2 rounded-full bg-line-strong" />
        <span className="size-2 rounded-full bg-line-strong" />
        <span className="ml-2 font-mono text-[11px] text-subtle">portafolio / admin</span>
      </div>
      <div className="flex">
        <div className="hidden w-28 shrink-0 space-y-0.5 border-r border-line p-2 text-[11px] sm:block">
          <div className="px-2 pt-1 pb-2 font-semibold">LM Portfolio</div>
          {['Dashboard', 'Proyectos', 'Habilidades', 'Contacto'].map((item, index) => (
            <div
              key={item}
              className={cn('rounded-md px-2 py-1', index === 0 ? 'bg-accent/15 text-accent-soft' : 'text-subtle')}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="flex-1 p-3.5">
          <div className="text-[13px] font-medium">Panel general</div>
          <div className="text-[11px] text-subtle">¡Bienvenido, {profile.firstName}!</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat value={projects.length} label="Proyectos" />
            <Stat value={technologies} label="Tecnologías" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div className="rounded-lg border border-line bg-surface-2 px-3 py-2">
      <div className="text-lg leading-tight font-semibold">
        <CountUp value={value} delay={0.6} />
        <span className="text-accent">+</span>
      </div>
      <div className="text-[11px] text-subtle">{label}</div>
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
    <div className="surface grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1.3fr_1.5fr_auto] lg:items-center lg:gap-6 lg:px-6">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <div className="text-[10px] font-medium tracking-[0.22em] text-accent/80 uppercase">{item.label}</div>
          {item.href ? (
            <a href={item.href} className="block truncate text-sm transition-colors hover:text-accent-soft">
              {item.value}
            </a>
          ) : (
            <div className="truncate text-sm">{item.value}</div>
          )}
        </div>
      ))}
      <ButtonLink href="#contacto" className="sm:justify-self-start lg:justify-self-end">
        Conectemos <ArrowRight className={nudge} />
      </ButtonLink>
    </div>
  )
}
