import { Router } from 'express'
import { requireDb } from '../db.js'

const router = Router()

const byOrder = [{ order: 'asc' }, { createdAt: 'asc' }]

/** Todo el contenido del portafolio en una sola respuesta (una ida y vuelta a Neon). */
router.get('/portfolio', requireDb, async (req, res) => {
  const [profile, experiences, projects, skills, services] = await Promise.all([
    req.db.profile.findUnique({ where: { id: 1 } }),
    req.db.experience.findMany({ orderBy: byOrder }),
    req.db.project.findMany({ where: { published: true }, orderBy: byOrder }),
    req.db.skill.findMany({ orderBy: byOrder }),
    req.db.service.findMany({ orderBy: byOrder }),
  ])
  // "no-cache" + ETag automático de Express: el navegador revalida y recibe 304
  // si nada cambió, pero los cambios del CMS se ven al instante.
  res.set('Cache-Control', 'no-cache')
  res.json({ profile, experiences, projects, skills, services })
})

export default router
