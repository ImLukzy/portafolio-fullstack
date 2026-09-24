// Siembra el contenido inicial en Neon.  Uso: npm run db:seed
// Es idempotente: si ya hay datos en una tabla, no la toca (tus ediciones del CMS están a salvo).
// Para empezar de cero:  npm run db:seed -- --reset
import { getPrisma } from '../server/db.js'
import {
  defaultExperiences,
  defaultProfile,
  defaultProjects,
  defaultServices,
  defaultSkills,
} from '../shared/default-content.js'

const prisma = getPrisma()
if (!prisma) {
  console.error('✗ DATABASE_URL no está definido en .env')
  process.exit(1)
}

const reset = process.argv.includes('--reset')
const ordered = (items) => items.map((item, order) => ({ ...item, order }))

async function seedTable(label, delegate, rows) {
  if (reset) await delegate.deleteMany()
  if ((await delegate.count()) > 0) {
    console.log(`• ${label}: ya tiene datos, se omite`)
    return
  }
  await delegate.createMany({ data: ordered(rows) })
  console.log(`✓ ${label}: ${rows.length} registros`)
}

try {
  if (reset) await prisma.profile.deleteMany()
  const hasProfile = await prisma.profile.findUnique({ where: { id: 1 } })
  if (hasProfile) {
    console.log('• Perfil: ya existe, se omite')
  } else {
    await prisma.profile.create({ data: { id: 1, ...defaultProfile } })
    console.log('✓ Perfil creado')
  }
  await seedTable('Trayectoria', prisma.experience, defaultExperiences)
  await seedTable('Proyectos', prisma.project, defaultProjects)
  await seedTable('Habilidades', prisma.skill, defaultSkills)
  await seedTable('Servicios', prisma.service, defaultServices)
} finally {
  await prisma.$disconnect()
}
