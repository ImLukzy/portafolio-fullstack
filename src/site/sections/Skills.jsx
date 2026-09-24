import { Box, CodeXml, Cpu, Database, FileText, Palette, Quote, Rocket, Server, Sparkles } from 'lucide-react'
import { motion, useInView } from 'motion/react'
import { useId, useRef } from 'react'
import {
  CountUp,
  Reveal,
  RevealGroup,
  RevealItem,
  SectionTitle,
  SpotlightCard,
  SubHeading,
} from '../../components/ui.jsx'
import { EASE_OUT } from '../../lib/motion.js'
import { CheckList } from './About.jsx'

export const SERVICE_ICON_COMPONENTS = {
  code: CodeXml,
  server: Server,
  database: Database,
  cpu: Cpu,
  box: Box,
  palette: Palette,
  rocket: Rocket,
  file: FileText,
}

export function Skills({ data }) {
  const { profile, skills, services } = data
  const areas = skills.filter((skill) => skill.group === 'AREA')
  const stack = skills.filter((skill) => skill.group === 'STACK')
  const tools = skills.filter((skill) => skill.group === 'TOOL')

  return (
    <section id="habilidades" className="py-24 lg:py-32">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-end lg:gap-12">
          <RevealGroup>
            <RevealItem as="p" className="kicker">
              {profile.kicker}
            </RevealItem>
            <RevealItem className="mt-5">
              <SectionTitle script="Habilidades">Servicios</SectionTitle>
            </RevealItem>
            {profile.skillsIntro && (
              <RevealItem as="p" className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
                {profile.skillsIntro}
              </RevealItem>
            )}
          </RevealGroup>

          {profile.skillsQuote && (
            <Reveal delay={0.1}>
              <figure className="surface relative overflow-hidden p-6 sm:p-7">
                <Quote aria-hidden className="absolute top-5 right-5 size-10 text-accent/10" />
                <blockquote className="max-w-md text-lg leading-snug text-pretty text-ink/90">
                  “{profile.skillsQuote}”
                </blockquote>
                <figcaption className="mt-4 font-serif text-2xl text-accent italic">
                  {profile.firstName} {profile.lastName.split(' ')[0]}
                </figcaption>
              </figure>
            </Reveal>
          )}
        </div>

        {(areas.length > 0 || stack.length > 0) && (
          <div className="mt-14 grid gap-3 lg:grid-cols-12">
            {areas.length > 0 && (
              <Reveal className={stack.length ? 'lg:col-span-5' : 'lg:col-span-12'}>
                <Panel title="Habilidades técnicas">
                  <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                    {areas.map((skill, index) => (
                      <RingMeter key={skill.id} label={skill.name} value={skill.level ?? 0} delay={index * 0.08} />
                    ))}
                  </div>
                </Panel>
              </Reveal>
            )}
            {stack.length > 0 && (
              <Reveal delay={0.08} className={areas.length ? 'lg:col-span-7' : 'lg:col-span-12'}>
                <Panel title="Stack de desarrollo">
                  <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                    {stack.map((skill, index) => (
                      <BarMeter key={skill.id} label={skill.name} value={skill.level ?? 0} delay={index * 0.05} />
                    ))}
                  </div>
                </Panel>
              </Reveal>
            )}
          </div>
        )}

        {services.length > 0 && (
          <>
            <SubHeading className="mt-20">Servicios que ofrezco</SubHeading>
            <RevealGroup className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => {
                const Icon = SERVICE_ICON_COMPONENTS[service.icon] ?? Sparkles
                return (
                  <RevealItem key={service.id}>
                    <SpotlightCard className="surface flex h-full flex-col p-5">
                      <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent-soft ring-1 ring-accent/20">
                        <Icon className="size-[18px]" />
                      </span>
                      <h4 className="mt-4 text-[15px] font-medium tracking-tight">{service.title}</h4>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{service.description}</p>
                      <CheckList items={service.features} className="mt-4 border-t border-line pt-3" />
                    </SpotlightCard>
                  </RevealItem>
                )
              })}
            </RevealGroup>
          </>
        )}

        {tools.length > 0 && (
          <>
            <SubHeading className="mt-20">Herramientas</SubHeading>
            <RevealGroup as="ul" stagger={0.03} className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-8">
              {tools.map((tool) => (
                <RevealItem
                  as="li"
                  key={tool.id}
                  className="group rounded-xl border border-line bg-surface px-2 py-3 text-center transition-colors duration-200 hover:border-accent/30 hover:bg-surface-2"
                >
                  <div className="text-sm font-semibold text-accent-soft">{tool.abbr || tool.name.slice(0, 2)}</div>
                  <div className="mt-0.5 truncate text-[11px] text-subtle transition-colors group-hover:text-muted">
                    {tool.name}
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </>
        )}
      </div>
    </section>
  )
}

function Panel({ title, children }) {
  return (
    <div className="surface flex h-full flex-col p-5 sm:p-6">
      <h3 className="kicker">{title}</h3>
      <div className="mt-6 grid flex-1 content-center">{children}</div>
    </div>
  )
}

function RingMeter({ label, value, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const gradientId = `ring-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  return (
    <div ref={ref} className="flex flex-col items-center gap-2.5">
      <div className="relative size-[76px]">
        <svg viewBox="0 0 64 64" className="size-full -rotate-90" aria-hidden>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ddd6fe" />
              <stop offset="1" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="28" fill="none" stroke="var(--color-surface-3)" strokeWidth="4" />
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: value / 100, opacity: 1 } : undefined}
            transition={{ duration: 1.2, ease: EASE_OUT, delay }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-sm font-semibold">
          <span>
            <CountUp value={value} delay={delay} />
            <span className="text-[11px] text-muted">%</span>
          </span>
        </span>
      </div>
      <span className="text-xs text-muted">{label}</span>
      <span className="sr-only">
        {label}: {value}%
      </span>
    </div>
  )
}

function BarMeter({ label, value, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.8 })

  return (
    <div ref={ref}>
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="font-medium">{label}</span>
        <span className="text-muted">
          <CountUp value={value} delay={delay} />%
        </span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3"
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* clip-path en vez de width/scaleX: no hay reflow y el radio no se deforma. */}
        <motion.div
          className="h-full rounded-full bg-linear-to-r from-accent-strong to-accent-soft"
          style={{ width: `${value}%` }}
          initial={{ clipPath: 'inset(0 100% 0 0 round 999px)' }}
          animate={inView ? { clipPath: 'inset(0 0% 0 0 round 999px)' } : undefined}
          transition={{ duration: 1, ease: EASE_OUT, delay }}
        />
      </div>
    </div>
  )
}
