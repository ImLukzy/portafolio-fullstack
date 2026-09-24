import { ArrowRight, Check, Copy, Mail, Phone } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { WhatsAppIcon } from '../../components/BrandIcons.jsx'
import { PulseDot, Reveal, RevealGroup, RevealItem, buttonClasses, nudge } from '../../components/ui.jsx'
import { formatWhatsApp, telHref, whatsappHref } from '../../lib/format.js'
import { CheckList } from './About.jsx'
import { SocialLinks } from './Hero.jsx'

export function Contact({ data }) {
  const { profile, skills } = data

  return (
    <section id="contacto" className="relative isolate overflow-hidden py-24 site-lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-30%] left-1/2 -z-10 size-[44rem] -translate-x-1/2 rounded-full bg-accent-strong/10 blur-[8.75rem]"
      />
      <div className="container-page">
        <div className="grid gap-4 site-lg:grid-cols-[1.05fr_0.9fr_1fr] site-lg:gap-5">
          <RevealGroup className="flex flex-col">
            <RevealItem
              as="h2"
              className="text-[clamp(2.25rem,4.4vw,3.4rem)] leading-[0.95] font-semibold tracking-[-0.04em] uppercase"
            >
              <span className="block font-serif text-[1.08em] font-normal tracking-[-0.01em] text-accent normal-case italic">
                Conectemos y
              </span>
              Trabajemos
              <span className="text-gradient block">Juntos</span>
            </RevealItem>
            {profile.availableFor && (
              <RevealItem as="p" className="mt-5 text-[0.9375rem] leading-relaxed text-muted">
                Disponible para <span className="font-medium text-ink">{profile.availableFor.toLowerCase()}</span>.
              </RevealItem>
            )}
            <RevealItem className="mt-6 grid gap-2 sm:grid-cols-2 site-lg:grid-cols-1">
              {profile.phone && (
                <ContactCard icon={Phone} label="Teléfono" value={profile.phone} href={telHref(profile)} />
              )}
              <ContactCard icon={Mail} label="Email" value={profile.email} href={`mailto:${profile.email}`} />
            </RevealItem>
            {(profile.linkedinUrl || profile.githubUrl) && (
              <RevealItem className="surface mt-2 flex flex-wrap items-center gap-3 p-4">
                <span className="kicker mr-auto">Sígueme en</span>
                <SocialLinks profile={profile} />
              </RevealItem>
            )}
          </RevealGroup>

          <Reveal delay={0.08}>
            <CodeCard profile={profile} skills={skills} />
          </Reveal>

          <Reveal delay={0.16}>
            <WhatsAppCard profile={profile} />
          </Reveal>
        </div>

        <Reveal>
          <AvailabilityBar profile={profile} />
        </Reveal>
      </div>
    </section>
  )
}

function ContactCard({ icon: Icon, label, value, href }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      /* portapapeles no disponible */
    }
  }

  return (
    <div className="surface flex min-w-0 items-center gap-3 p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-3 text-accent-soft">
        <Icon className="size-4" />
      </span>
      <a href={href} className="min-w-0 flex-1">
        <span className="block text-[0.625rem] font-medium tracking-[0.2em] text-subtle uppercase">{label}</span>
        <span className="block truncate text-sm transition-colors hover:text-accent-soft">{value}</span>
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copiar ${label.toLowerCase()}`}
        className="grid size-8 shrink-0 place-items-center rounded-md text-subtle transition-colors hover:bg-white/5 hover:text-ink"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? 'copied' : 'copy'}
            initial={{ opacity: 0, scale: 0.5, filter: 'blur(2px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.5, filter: 'blur(2px)' }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          >
            {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
          </motion.span>
        </AnimatePresence>
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? `${label} copiado` : ''}
      </span>
    </div>
  )
}

// Tokens del resaltado de sintaxis: palabra clave, propiedad, string, puntuación.
const K = ({ children }) => <span className="text-accent-soft">{children}</span>
const P = ({ children }) => <span className="text-ink/75">{children}</span>
const S = ({ children }) => <span className="text-emerald-300/90">'{children}'</span>
const D = ({ children }) => <span className="text-subtle">{children}</span>

function CodeCard({ profile, skills }) {
  const topStack = skills
    .filter((skill) => skill.group === 'STACK')
    .toSorted((a, b) => (b.level ?? 0) - (a.level ?? 0))
    .slice(0, 3)
    .map((skill) => skill.name)
  const chips = skills.filter((skill) => skill.group === 'STACK').slice(0, 6)

  return (
    <div className="surface flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]/70" />
        <span className="size-2.5 rounded-full bg-[#febc2e]/70" />
        <span className="size-2.5 rounded-full bg-[#28c840]/70" />
        <span className="ml-3 font-mono text-[0.6875rem] text-subtle">perfil.ts</span>
      </div>
      <pre className="flex-1 overflow-x-auto p-5 font-mono text-[0.7813rem] leading-6">
        <code>
          <K>const</K> <span className="text-ink">perfil</span> <D>=</D> <D>{'{'}</D>
          {'\n  '}
          <P>nombre</P>
          <D>:</D> <S>{`${profile.firstName} ${profile.lastName.split(' ')[0]}`}</S>
          <D>,</D>
          {'\n  '}
          <P>rol</P>
          <D>:</D> <S>{profile.role}</S>
          <D>,</D>
          {'\n  '}
          <P>stack</P>
          <D>: [</D>
          {topStack.map((name, index) => (
            <span key={name}>
              <S>{name}</S>
              {index < topStack.length - 1 && <D>, </D>}
            </span>
          ))}
          <D>],</D>
          {'\n  '}
          <P>base</P>
          <D>:</D> <S>{profile.location}</S>
          <D>,</D>
          {'\n  '}
          <P>disponible</P>
          <D>:</D> <span className="text-fuchsia-300">true</span>
          <D>,</D>
          {'\n'}
          <D>{'}'}</D>
          <span
            aria-hidden
            className="ml-0.5 inline-block h-4 w-[0.4375rem] translate-y-[0.1875rem] bg-accent/80 [animation:caret-blink_1.1s_steps(1)_infinite] motion-reduce:animate-none"
          />
        </code>
      </pre>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-line p-4">
          {chips.map((skill) => (
            <span key={skill.id} className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[0.6875rem] text-muted">
              {skill.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function WhatsAppCard({ profile }) {
  const [name, setName] = useState('')
  const [idea, setIdea] = useState('')

  const custom = name.trim() || idea.trim()
  const message = custom
    ? [
        name.trim() ? `Hola ${profile.firstName}, soy ${name.trim()}.` : `Hola ${profile.firstName}.`,
        idea.trim() || 'Me gustaría conversar sobre un proyecto.',
      ].join(' ')
    : profile.whatsappMessage
  const href = whatsappHref(profile.whatsapp, message)

  const input =
    'w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-subtle transition-colors duration-150 hover:border-line-strong focus:border-accent/60 focus:outline-none'

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface p-6">
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full bg-whatsapp/10 blur-3xl" />
      <p className="kicker">Hablemos de tu próximo proyecto</p>
      <p className="mt-3 font-serif text-4xl leading-none text-accent italic">¡Escríbeme!</p>
      {profile.contactPitch && <p className="mt-3 text-sm leading-relaxed text-muted">{profile.contactPitch}</p>}

      {profile.whatsapp && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
          <WhatsAppIcon className="size-5 text-whatsapp" />
          <div>
            <div className="text-[0.625rem] font-medium tracking-[0.2em] text-subtle uppercase">WhatsApp personal</div>
            <div className="text-sm font-medium tabular-nums">{formatWhatsApp(profile.whatsapp)}</div>
          </div>
        </div>
      )}

      <CheckList items={profile.contactPoints} className="mt-4" />

      {href && (
        <div className="mt-auto space-y-2 pt-5">
          <label className="sr-only" htmlFor="wa-name">
            Tu nombre
          </label>
          <input
            id="wa-name"
            className={input}
            placeholder="Tu nombre"
            maxLength={60}
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <label className="sr-only" htmlFor="wa-idea">
            Tu idea
          </label>
          <textarea
            id="wa-idea"
            className={`${input} resize-none`}
            placeholder="Cuéntame tu idea…"
            rows={2}
            maxLength={500}
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
          />
          <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClasses('whatsapp', 'lg', 'w-full')}>
            <WhatsAppIcon /> Escribirme por WhatsApp <ArrowRight className={nudge} />
          </a>
        </div>
      )}
    </div>
  )
}

function AvailabilityBar({ profile }) {
  const items = [
    profile.availability && { label: 'Disponibilidad', value: profile.availability, live: true },
    profile.workModes && { label: 'Modalidad', value: profile.workModes },
    { label: 'Base', value: profile.location },
  ].filter(Boolean)

  return (
    <div className="surface mt-4 grid gap-4 p-5 sm:grid-cols-3 sm:items-center">
      {items.map((item) => (
        <div key={item.label}>
          <div className="text-[0.625rem] font-medium tracking-[0.22em] text-accent/80 uppercase">{item.label}</div>
          <div className="mt-0.5 flex items-center gap-2 text-sm">
            {item.live && <PulseDot />}
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}

export function Footer({ profile }) {
  return (
    <footer className="border-t border-line">
      <div className="container-page flex flex-col gap-2 py-8 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.firstName} {profile.lastName} · {profile.location}
        </p>
        <p>Hecho con React, Neon y Cloudflare R2</p>
      </div>
    </footer>
  )
}
