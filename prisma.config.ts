import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

config({ quiet: true })

// El CLI (migraciones, db push, studio) usa la conexión DIRECTA de Neon:
// el pooler (PgBouncer) no soporta los bloqueos que usan las migraciones.
// La app en tiempo de ejecución usa DATABASE_URL (pooled) — ver server/db.js.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js', // también: npm run db:seed
  },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || '',
  },
})
