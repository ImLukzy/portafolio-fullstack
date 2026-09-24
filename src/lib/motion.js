// Lenguaje de movimiento compartido.
// Entradas con ease-out rápido; interacciones con muelles críticamente amortiguados
// (sin rebote exagerado); duraciones cortas: la UI nunca debe hacer esperar.

export const EASE_OUT = [0.23, 1, 0.32, 1]
export const EASE_DRAWER = [0.32, 0.72, 0, 1]

/** Indicadores deslizantes (pill del nav, filtros, pestañas). */
export const SPRING_SNAPPY = { type: 'spring', stiffness: 420, damping: 36, mass: 0.7 }

/** Paneles, modales y elementos grandes. */
export const SPRING_SOFT = { type: 'spring', duration: 0.45, bounce: 0.12 }

export const fadeUp = {
  hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: EASE_OUT, delay },
  }),
}

export const staggerGroup = (stagger = 0.06, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
})

export const VIEWPORT = { once: true, amount: 0.2, margin: '0px 0px -8% 0px' }
