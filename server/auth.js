import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { env } from './env.js'

const COOKIE_NAME = 'lm_admin'
const SESSION_TTL_MS = 8 * 60 * 60 * 1000

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000

const secret = env.sessionSecret || randomBytes(32).toString('hex')
if (!env.sessionSecret) {
  console.warn('[auth] ADMIN_SESSION_SECRET vacío: se usa uno temporal (las sesiones se cierran al reiniciar).')
}

const sha256 = (value) => createHash('sha256').update(value).digest()
const sign = (value) => createHmac('sha256', secret).update(value).digest('base64url')

function safeEqual(a, b) {
  return a.length === b.length && timingSafeEqual(a, b)
}

export function isAdminConfigured() {
  return Boolean(env.adminPin)
}

export function pinMatches(pin) {
  if (!env.adminPin || typeof pin !== 'string') return false
  // Comparamos hashes para que la longitud del PIN no se filtre por tiempo.
  return safeEqual(sha256(pin), sha256(env.adminPin))
}

function createSessionToken() {
  const body = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS })).toString('base64url')
  return `${body}.${sign(body)}`
}

function verifySessionToken(token) {
  const [body, signature] = (token ?? '').split('.')
  if (!body || !signature) return false
  if (!safeEqual(Buffer.from(signature), Buffer.from(sign(body)))) return false
  try {
    const { exp } = JSON.parse(Buffer.from(body, 'base64url').toString())
    return typeof exp === 'number' && exp > Date.now()
  } catch {
    return false
  }
}

function readCookie(req, name) {
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return null
}

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: env.isProd,
  path: '/api',
}

export function startSession(res) {
  res.cookie(COOKIE_NAME, createSessionToken(), { ...cookieOptions, maxAge: SESSION_TTL_MS })
}

export function endSession(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions)
}

export function hasSession(req) {
  return verifySessionToken(readCookie(req, COOKIE_NAME))
}

export function requireAdmin(req, res, next) {
  if (!hasSession(req)) return res.status(401).json({ error: 'Sesión expirada. Vuelve a ingresar tu PIN.' })
  next()
}

// ── Límite de intentos (en memoria, por IP) ─────────────────────────
const failures = new Map()

export function loginGuard(req, res, next) {
  const entry = failures.get(req.ip)
  if (entry && entry.count >= MAX_FAILED_ATTEMPTS && entry.until > Date.now()) {
    const seconds = Math.ceil((entry.until - Date.now()) / 1000)
    res.set('Retry-After', String(seconds))
    return res.status(429).json({ error: `Demasiados intentos. Espera ${Math.ceil(seconds / 60)} min.` })
  }
  next()
}

export function registerFailure(ip) {
  if (failures.size > 1000) {
    for (const [key, value] of failures) if (value.until <= Date.now()) failures.delete(key)
  }
  const entry = failures.get(ip)
  const fresh = !entry || entry.until <= Date.now()
  failures.set(ip, {
    count: fresh ? 1 : entry.count + 1,
    until: Date.now() + LOCKOUT_MS,
  })
}

export function clearFailures(ip) {
  failures.delete(ip)
}
