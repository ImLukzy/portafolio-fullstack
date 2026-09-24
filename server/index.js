import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { isAdminConfigured } from './auth.js'
import { createApp } from './app.js'
import { env } from './env.js'
import { isR2Configured } from './r2-uploader.js'

const app = createApp()

// En producción, el mismo proceso sirve la SPA compilada por Vite (dist/).
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
if (existsSync(dist)) {
  // Los assets llevan hash en el nombre: se pueden cachear para siempre.
  app.use('/assets', express.static(path.join(dist, 'assets'), { immutable: true, maxAge: '1y' }))
  app.use(express.static(dist, { index: false }))
  // Fallback SPA: /admin, /cualquier-ruta → index.html (React Router decide).
  app.get('/{*splat}', (req, res) => res.sendFile(path.join(dist, 'index.html')))
}

// Express 5 pasa al callback el error de arranque (p. ej. puerto ocupado).
app.listen(env.port, (error) => {
  if (error) {
    console.error(`\n  ✗ No se pudo iniciar en el puerto ${env.port}: ${error.message}`)
    console.error('    Cambia PORT en .env o cierra el proceso que lo usa.\n')
    process.exit(1)
  }
  const mark = (ok) => (ok ? '✓' : '✗')
  console.log(`\n  API lista en http://localhost:${env.port}`)
  console.log(`  ${mark(env.databaseUrl)} Neon (DATABASE_URL)`)
  console.log(`  ${mark(isR2Configured())} Cloudflare R2`)
  console.log(`  ${mark(isAdminConfigured())} PIN de administración\n`)
})
