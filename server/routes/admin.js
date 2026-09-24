import { Router } from 'express'
import multer from 'multer'
import { requireAdmin } from '../auth.js'
import { databaseStatus, requireDb } from '../db.js'
import {
  MAX_UPLOAD_BYTES,
  UPLOAD_FOLDERS,
  deleteFromR2ByUrl,
  isR2Configured,
  uploadToR2,
} from '../r2-uploader.js'
import {
  experienceSchema,
  profileSchema,
  projectSchema,
  reorderSchema,
  serviceSchema,
  skillSchema,
} from '../validation.js'

const router = Router()
router.use(requireAdmin)

// ── Estado de las integraciones ─────────────────────────────────────
router.get('/status', async (req, res) => {
  res.json({ database: await databaseStatus(), r2: isR2Configured() })
})

// ── Subida de archivos a Cloudflare R2 ──────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
})

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo.' })
  const folder = String(req.query.folder ?? '')
  if (!(folder in UPLOAD_FOLDERS)) return res.status(400).json({ error: 'Carpeta inválida.' })

  const result = await uploadToR2({
    buffer: req.file.buffer,
    contentType: req.file.mimetype,
    folder,
  })
  res.status(201).json(result)
})

// Todo lo de abajo necesita base de datos.
router.use(requireDb)

// ── Perfil (fila única) ─────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  res.json(await req.db.profile.findUnique({ where: { id: 1 } }))
})

router.put('/profile', async (req, res) => {
  const data = profileSchema.parse(req.body)
  const previous = await req.db.profile.findUnique({ where: { id: 1 } })
  const profile = await req.db.profile.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  })
  for (const field of ['avatarUrl', 'cvUrl']) {
    if (previous?.[field] && previous[field] !== profile[field]) void deleteFromR2ByUrl(previous[field])
  }
  res.json(profile)
})

// ── Colecciones ordenables (CRUD genérico) ─────────────────────────
const COLLECTIONS = {
  experiences: { model: 'experience', schema: experienceSchema },
  projects: { model: 'project', schema: projectSchema, files: ['imageUrl'] },
  skills: { model: 'skill', schema: skillSchema },
  services: { model: 'service', schema: serviceSchema },
}

router.param('collection', (req, res, next, name) => {
  const config = Object.hasOwn(COLLECTIONS, name) ? COLLECTIONS[name] : null
  if (!config) return res.status(404).json({ error: `Colección desconocida: ${name}` })
  req.collection = { ...config, delegate: req.db[config.model] }
  next()
})

/** Solo puede haber un proyecto destacado: al marcar uno se desmarcan los demás. */
async function applyExclusiveFeatured(req, data, id) {
  if (req.collection.model === 'project' && data.featured === true) {
    await req.db.project.updateMany({
      where: { featured: true, ...(id && { NOT: { id } }) },
      data: { featured: false },
    })
  }
}

function cleanupReplacedFiles(req, previous, next) {
  for (const field of req.collection.files ?? []) {
    if (previous?.[field] && previous[field] !== next?.[field]) void deleteFromR2ByUrl(previous[field])
  }
}

router.get('/:collection', async (req, res) => {
  res.json(await req.collection.delegate.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }))
})

router.post('/:collection', async (req, res) => {
  const { delegate, schema } = req.collection
  const data = schema.parse(req.body)
  await applyExclusiveFeatured(req, data)
  const last = await delegate.findFirst({ orderBy: { order: 'desc' }, select: { order: true } })
  const item = await delegate.create({ data: { ...data, order: (last?.order ?? -1) + 1 } })
  res.status(201).json(item)
})

// Debe ir antes de "/:collection/:id" para que "order" no se tome como id.
router.put('/:collection/order', async (req, res) => {
  const { ids } = reorderSchema.parse(req.body)
  const { delegate } = req.collection
  await req.db.$transaction(ids.map((id, order) => delegate.update({ where: { id }, data: { order } })))
  res.json({ ok: true })
})

for (const method of ['put', 'patch']) {
  router[method]('/:collection/:id', async (req, res) => {
    const { delegate, schema } = req.collection
    // PUT reemplaza el formulario completo; PATCH solo cambia lo enviado (p. ej. publicar).
    const data = (method === 'put' ? schema : schema.partial()).parse(req.body)
    const previous = await delegate.findUniqueOrThrow({ where: { id: req.params.id } })
    await applyExclusiveFeatured(req, data, req.params.id)
    const item = await delegate.update({ where: { id: req.params.id }, data })
    cleanupReplacedFiles(req, previous, item)
    res.json(item)
  })
}

router.delete('/:collection/:id', async (req, res) => {
  const item = await req.collection.delegate.delete({ where: { id: req.params.id } })
  cleanupReplacedFiles(req, item, null)
  res.status(204).end()
})

export default router
