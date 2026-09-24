import { Brain, Building2, Check, FileCheck2, Layers, MapPin, Puzzle, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import {
  FadeImage,
  Reveal,
  RevealGroup,
  RevealItem,
  SectionTitle,
  SpotlightCard,
  SubHeading,
} from '../../components/ui.jsx'
import { initials, paragraphs } from '../../lib/format.js'
import { EASE_OUT, VIEWPORT } from '../../lib/motion.js'

const STRENGTH_ICONS = [Brain, Layers, FileCheck2, Puzzle, Sparkles]

export function About({ data }) {
  const { profile, experiences } = data

  return (
    <section id="perfil" className="py-24 site-lg:py-32">
      <div className="container-page">
        <div className="grid gap-6 site-lg:grid-cols-[1.15fr_0.9fr_0.7fr] site-lg:items-center site-lg:gap-8">
          <RevealGroup>
            <RevealItem>
              <SectionTitle script="Sobre">Mí</SectionTitle>
            </RevealItem>
            <RevealItem as="p" className="mt-5 text-[0.75rem] font-medium tracking-[0.3em] text-ink/80 uppercase">
              {profile.role}
            </RevealItem>
            {paragraphs(profile.bio).map((paragraph) => (
              <RevealItem as="p" key={paragraph} className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-pretty text-muted">
                {paragraph}
              </RevealItem>
            ))}
            {profile.aboutQuote && (
              <RevealItem as="blockquote" className="mt-6 max-w-lg border-l border-accent/40 pl-4 text-sm text-ink/90">
                “{profile.aboutQuote}”
              </RevealItem>
            )}
          </RevealGroup>

          <Reveal delay={0.1}>
            <SpotlightCard className="surface p-6">
              <p className="kicker">Mi enfoque</p>
              {profile.focusText && <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/90">{profile.focusText}</p>}
              <CheckList items={profile.focusPoints} className="mt-5" />
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.2}>
            <ProfileCard profile={profile} />
          </Reveal>
        </div>

        {profile.strengths.length > 0 && (
          <>
            <SubHeading className="mt-20">Mis fortalezas</SubHeading>
            <RevealGroup className="mt-6 grid gap-3 sm:grid-cols-2 site-lg:grid-cols-4">
              {profile.strengths.map((strength, index) => {
                const Icon = STRENGTH_ICONS[index % STRENGTH_ICONS.length]
                return (
                  <RevealItem key={strength.title}>
                    <SpotlightCard className="surface h-full p-5">
                      <span className="grid size-9 place-items-center rounded-lg bg-accent/10 text-accent-soft ring-1 ring-accent/20">
                        <Icon className="size-4" />
                      </span>
                      <h4 className="mt-4 text-[0.9375rem] font-medium tracking-tight">{strength.title}</h4>
                      <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">{strength.description}</p>
                    </SpotlightCard>
                  </RevealItem>
                )
              })}
            </RevealGroup>
          </>
        )}

        {experiences.length > 0 && (
          <>
            <SubHeading className="mt-20">Mi trayectoria</SubHeading>
            <Timeline items={experiences} />
          </>
        )}
      </div>
    </section>
  )
}

export function CheckList({ items, className }) {
  if (!items?.length) return null
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 py-1 text-sm text-ink/90">
          <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
            <Check className="size-2.5" strokeWidth={3} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  )
}

function ProfileCard({ profile }) {
  return (
    <div className="surface flex flex-col items-center px-6 py-8 text-center">
      <div className="relative size-32 overflow-hidden rounded-full bg-surface-3 ring-1 ring-line-strong ring-offset-4 ring-offset-surface">
        {profile.avatarUrl ? (
          <FadeImage src={profile.avatarUrl} alt={`${profile.firstName} ${profile.lastName}`} />
        ) : (
          <span className="absolute inset-0 grid place-items-center font-serif text-5xl text-accent italic">
            {initials(profile)}
          </span>
        )}
      </div>
      <p className="mt-5 font-serif text-3xl leading-none text-accent italic">{profile.firstName}</p>
      <p className="mt-2 text-sm font-semibold tracking-[0.12em] uppercase">{profile.lastName}</p>
      <p className="mt-1 text-[0.8125rem] text-muted">{profile.role}</p>
      <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface-2 px-3 py-1 text-xs text-ink/90">
        <MapPin className="size-3 text-accent" />
        {profile.location}
      </p>
    </div>
  )
}

function Timeline({ items }) {
  return (
    <RevealGroup as="ol" className="mt-8 grid gap-3 sm:grid-cols-2 site-lg:grid-cols-4 site-lg:gap-4" stagger={0.1}>
      {items.map((item, index) => (
        <RevealItem as="li" key={item.id} className="relative site-lg:pt-9">
          {/* Riel: cada hito dibuja su tramo hasta el siguiente. */}
          <motion.span
            aria-hidden
            className="absolute top-[0.4375rem] left-4 hidden h-px w-[calc(100%+1rem)] origin-left bg-linear-to-r from-accent/60 to-line-strong site-lg:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: index === items.length - 1 ? 0.4 : 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.2 + index * 0.12 }}
          />
          <span
            aria-hidden
            className="absolute top-0 left-0 hidden size-[0.9375rem] place-items-center rounded-full border border-accent/60 bg-bg site-lg:grid"
          >
            <span className="size-[0.3125rem] rounded-full bg-accent" />
          </span>
          <div className="surface h-full p-5">
            <span className="text-xs font-medium tracking-wide text-accent tabular-nums">{item.period}</span>
            <h4 className="mt-2 text-[0.9375rem] font-medium tracking-tight">{item.title}</h4>
            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">{item.description}</p>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-ink/80">
              <Building2 className="size-3.5 text-subtle" />
              {item.place}
            </p>
          </div>
        </RevealItem>
      ))}
    </RevealGroup>
  )
}
