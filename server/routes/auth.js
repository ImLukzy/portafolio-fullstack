import { Router } from 'express'
import {
  clearFailures,
  endSession,
  hasSession,
  isAdminConfigured,
  loginGuard,
  pinMatches,
  registerFailure,
  startSession,
} from '../auth.js'

const router = Router()

router.get('/session', (req, res) => {
  res.json({ authenticated: hasSession(req), configured: isAdminConfigured() })
})

router.post('/login', loginGuard, (req, res) => {
  if (!isAdminConfigured()) {
    return res.status(503).json({ error: 'ADMIN_PIN no está definido en el archivo .env.' })
  }
  if (!pinMatches(req.body?.pin)) {
    registerFailure(req.ip)
    return res.status(401).json({ error: 'PIN incorrecto.' })
  }
  clearFailures(req.ip)
  startSession(res)
  res.json({ authenticated: true })
})

router.post('/logout', (req, res) => {
  endSession(res)
  res.json({ authenticated: false })
})

export default router
