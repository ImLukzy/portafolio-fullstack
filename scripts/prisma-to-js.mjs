// Prisma 7 genera el cliente en TypeScript (server/generated/prisma/*.ts).
// Vercel empaqueta la función siguiendo imports de JavaScript y no incluye esos
// .ts, así que los transpilamos a .js: se quitan los tipos con el transpilador
// integrado de Node y los imports "./x.ts" pasan a "./x.js".
// Se ejecuta tras cada `prisma generate` (postinstall y build).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../server/generated/prisma')

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    return entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts') ? [full] : []
  })

// Especificadores relativos que terminan en .ts: `from './a.ts'`, `import('./b.ts')`.
const TS_SPECIFIER = /((?:from|import)\s*\(?\s*)(['"])(\.{1,2}\/[^'"]+?)\.ts\2/g

let count = 0
for (const file of walk(root)) {
  const js = stripTypeScriptTypes(readFileSync(file, 'utf8'), { mode: 'strip' }).replace(
    TS_SPECIFIER,
    (_, prefix, quote, spec) => `${prefix}${quote}${spec}.js${quote}`,
  )
  writeFileSync(file.replace(/\.ts$/, '.js'), js)
  count++
}
console.log(`✔ Cliente de Prisma transpilado a JavaScript (${count} archivos)`)
