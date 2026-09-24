import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client.ts'
import { env } from './env.js'

// En tiempo de ejecución usamos la URL *pooled* de Neon (host con "-pooler"),
// que soporta muchas conexiones cortas. Las migraciones usan DIRECT_URL.
let prisma = null

export function getPrisma() {
  if (!env.databaseUrl) return null
  prisma ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.databaseUrl, max: 5 }),
  })
  return prisma
}

export function requireDb(req, res, next) {
  const db = getPrisma()
  if (!db) {
    return res.status(503).json({
      error: 'Base de datos no configurada. Define DATABASE_URL en el archivo .env.',
      code: 'DB_NOT_CONFIGURED',
    })
  }
  req.db = db
  next()
}

export async function databaseStatus() {
  const db = getPrisma()
  if (!db) return 'not_configured'
  try {
    await db.$queryRaw`SELECT 1`
    return 'connected'
  } catch {
    return 'error'
  }
}
