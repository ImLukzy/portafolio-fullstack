import dotenv from 'dotenv'

dotenv.config({ quiet: true })

const read = (key) => (process.env[key] ?? '').trim()

export const env = {
  isProd: read('NODE_ENV') === 'production',
  port: Number(read('PORT')) || 3001,
  databaseUrl: read('DATABASE_URL'),
  adminPin: read('ADMIN_PIN'),
  sessionSecret: read('ADMIN_SESSION_SECRET'),
}
