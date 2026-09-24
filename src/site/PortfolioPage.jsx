import { AnimatePresence, motion } from 'motion/react'
import { useEffect } from 'react'
import { useActiveSection } from '../lib/useActiveSection.js'
import { usePortfolio } from '../lib/usePortfolio.js'
import { EASE_OUT } from '../lib/motion.js'
import { Navbar, SideRail, SECTION_IDS } from './Navigation.jsx'
import { About } from './sections/About.jsx'
import { Contact, Footer } from './sections/Contact.jsx'
import { Hero } from './sections/Hero.jsx'
import { Projects } from './sections/Projects.jsx'
import { Skills } from './sections/Skills.jsx'

export default function PortfolioPage() {
  const { status, data } = usePortfolio()

  useEffect(() => {
    if (!data) return
    const { firstName, lastName, role } = data.profile
    document.title = `${firstName} ${lastName} | ${role}`
  }, [data])

  // La página se pinta de una sola vez, con datos y fuentes ya listos:
  // nada cambia de tamaño después del primer frame.
  return (
    <AnimatePresence mode="wait">
      {status === 'loading' ? (
        <Splash key="splash" />
      ) : (
        <motion.div
          key="site"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
        >
          <Site data={data} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Site({ data }) {
  const active = useActiveSection(SECTION_IDS)
  return (
    <>
      <Navbar active={active} />
      <SideRail active={active} />
      <main>
        <Hero data={data} />
        <About data={data} />
        <Projects data={data} />
        <Skills data={data} />
        <Contact data={data} />
      </main>
      <Footer profile={data.profile} />
    </>
  )
}

function Splash() {
  return (
    <motion.div
      exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE_OUT } }}
      className="fixed inset-0 grid place-items-center bg-bg"
      aria-busy="true"
      aria-label="Cargando portafolio"
    >
      {/* Aparece con 250 ms de retraso: en conexiones rápidas ni se llega a ver. */}
      <div className="flex flex-col items-center gap-5 [animation:splash-in_400ms_var(--ease-snappy)_250ms_both]">
        <div className="grid size-14 place-items-center rounded-2xl border border-line-strong bg-surface text-lg font-semibold tracking-tight text-accent">
          LM
        </div>
        <div className="h-px w-24 overflow-hidden rounded-full bg-line">
          <div className="h-full w-1/3 rounded-full bg-accent [animation:splash-bar_1.1s_var(--ease-drawer)_infinite]" />
        </div>
      </div>
    </motion.div>
  )
}
