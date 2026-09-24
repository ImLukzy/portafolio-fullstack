import express from 'express'
import multer from 'multer'
import { ZodError } from 'zod'
import { MAX_UPLOAD_MB } from '../shared/constants.js'
import { UploadError } from './r2-uploader.js'
import adminRoutes from './routes/admin.js'
import authRoutes from './routes/auth.js'
import publicRoutes from './routes/public.js'
import { fieldErrors } from './validation.js'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  // Detrás del proxy de Render/Railway/Fly: req.ip será la IP real del visitante.
  app.set('trust proxy', 1)

  const api = express.Router()
  // Dentro del router: así un JSON mal formado llega a errorHandler (respuesta JSON, sin traza).
  api.use(express.json({ limit: '200kb' }))
  api.get('/health', (req, res) => res.json({ ok: true }))
  api.use('/', publicRoutes)
  api.use('/auth', authRoutes)
  api.use('/admin', adminRoutes)
  api.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }))
  api.use(errorHandler)

  app.use('/api', api)
  return app
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)

  if (error instanceof ZodError) {
    return res.status(400).json({ error: 'Revisa los campos marcados.', fields: fieldErrors(error) })
  }
  if (error instanceof UploadError) {
    return res.status(error.status).json({ error: error.message })
  }
  if (error instanceof multer.MulterError) {
    const tooLarge = error.code === 'LIMIT_FILE_SIZE'
    return res.status(tooLarge ? 413 : 400).json({ error: tooLarge ? `El archivo supera ${MAX_UPLOAD_MB} MB.` : error.message })
  }
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido.' })
  }
  if (error?.code === 'P2025') {
    return res.status(404).json({ error: 'El elemento ya no existe.' })
  }

  console.error('[api]', error)
  res.status(500).json({ error: 'Error interno del servidor.' })
}
