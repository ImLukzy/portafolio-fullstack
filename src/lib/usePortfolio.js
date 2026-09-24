import { useEffect, useState } from 'react'
import { buildDefaultPortfolio } from '../../shared/default-content.js'

const API_TIMEOUT_MS = 8000
const FONT_TIMEOUT_MS = 1500

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Carga explícitamente las fuentes antes de pintar la página.
 * Así el primer render ya usa la tipografía final: cero saltos por FOUT.
 */
function loadFonts() {
  if (!document.fonts?.load) return Promise.resolve()
  const loads = Promise.all([
    document.fonts.load('400 1em "Inter Variable"', 'Aá'),
    document.fonts.load('600 1em "Inter Variable"', 'Aá'),
    document.fonts.load('italic 400 1em "Instrument Serif"', 'Aá'),
  ]).catch(() => {})
  return Promise.race([loads, wait(FONT_TIMEOUT_MS)])
}

async function fetchPortfolio() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS)
  try {
    const response = await fetch('/api/portfolio', { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

function normalize(data) {
  const fallback = buildDefaultPortfolio()
  const profile = data.profile ?? fallback.profile
  return {
    profile: { ...profile, strengths: Array.isArray(profile.strengths) ? profile.strengths : [] },
    experiences: data.experiences ?? [],
    projects: data.projects ?? [],
    skills: data.skills ?? [],
    services: data.services ?? [],
  }
}

/** Datos del portafolio: API → Neon. Si la API no responde, usa el contenido por defecto. */
export function usePortfolio() {
  const [state, setState] = useState({ status: 'loading', data: null })

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetchPortfolio().catch((error) => {
        console.info('[portafolio] API no disponible, usando contenido por defecto:', error.message)
        return buildDefaultPortfolio()
      }),
      loadFonts(),
    ]).then(([data]) => {
      if (!cancelled) setState({ status: 'ready', data: normalize(data) })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
