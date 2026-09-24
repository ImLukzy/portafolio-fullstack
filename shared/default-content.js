// Contenido inicial del portafolio. Tiene dos usos:
//   1. `npm run db:seed` lo inserta en Neon la primera vez.
//   2. El frontend lo muestra si la API/BD aún no está configurada.
// Una vez sembrada la BD, todo se edita desde /admin (no desde aquí).

export const defaultProfile = {
  firstName: 'Lukas',
  lastName: 'Melgar Casimiro',
  role: 'Desarrollador Full Stack Junior',
  location: 'Arequipa, Perú',
  avatarUrl: null,
  kicker: 'Tecnología · Diseño · Innovación',
  headline:
    'Desarrollo soluciones digitales que combinan tecnología, diseño y experiencia para crear impacto real.',
  heroQuote: 'Código que funciona. Diseño que conecta. Experiencias que transforman.',
  availableFor: 'Proyectos · Colaboraciones · Oportunidades',
  bio: [
    'Soy apasionado por la tecnología, el diseño y la innovación. Disfruto transformar ideas en soluciones digitales que generan impacto real.',
    'Egresado de Diseño y Desarrollo de Software en TECSUP con todos los cursos aprobados, y 280 horas de prácticas preprofesionales en Fibertell S.A.C.',
  ].join('\n\n'),
  aboutQuote: 'No solo escribo código, creo soluciones que conectan.',
  focusText:
    'Combino tecnología, diseño y estrategia para desarrollar productos digitales funcionales y centrados en el usuario.',
  focusPoints: ['Centrado en las personas', 'Orientado a resultados', 'Aprendizaje continuo', 'Innovación constante'],
  strengths: [
    { title: 'Pensamiento analítico', description: 'Descompongo problemas complejos en soluciones eficientes y escalables.' },
    { title: 'Desarrollo Full Stack', description: 'Aplicaciones modernas, responsivas y de alto rendimiento.' },
    { title: 'Documentación y despliegue', description: 'Soluciones probadas, documentadas y listas para producción.' },
    { title: 'Resolución de problemas', description: 'Me adapto rápido y encuentro soluciones creativas y efectivas.' },
  ],
  projectsIntro: 'Soluciones que combinan tecnología, diseño y experiencia.',
  skillsIntro: 'Soluciones digitales que generan impacto.',
  skillsQuote:
    'No se trata solo de usar herramientas, sino de resolver problemas reales con creatividad y lógica.',
  email: 'lukas.melgar@tecsup.edu.pe',
  phone: '984 182 233',
  whatsapp: '51984182233',
  whatsappMessage: 'Hola Lukas, vi tu portafolio y me gustaría conversar sobre un proyecto.',
  contactPitch: 'Cuéntame tu idea. Te respondo directo por WhatsApp.',
  contactPoints: ['Proyectos y colaboraciones', 'Sistemas web o IoT', 'Respuesta rápida'],
  availability: 'Inmediata',
  workModes: 'Remota · Híbrida · Presencial',
  linkedinUrl: 'https://www.linkedin.com/in/lukas-melgar-casimiro-90b41b3a7/',
  githubUrl: null,
  cvUrl: '/CV-Lukas-Melgar-Casimiro.pdf',
}

export const defaultExperiences = [
  { period: '2023 – 2026', title: 'Formación técnica', description: 'Diseño y Desarrollo de Software. Todos los cursos aprobados satisfactoriamente.', place: 'TECSUP Arequipa' },
  { period: 'Ene – Mar 2026', title: 'Prácticas · 280 h', description: 'Frontend, backend, API REST y Scrum con cumplimiento del 100 % de tareas.', place: 'Fibertell S.A.C.' },
  { period: '2024 – 2026', title: 'Proyectos reales', description: 'Gestión comercial, inventario, simulador UCI y prototipado 3D.', place: 'Proyectos propios' },
  { period: '2026 – Hoy', title: 'Crecimiento', description: 'Freelance y oportunidades como desarrollador junior.', place: 'Freelance' },
]

export const defaultProjects = [
  {
    title: 'Reloj Inteligente — Simulador UCI',
    summary: 'Dispositivo que simula el monitoreo de una cama UCI de emergencias, con despliegue funcional y pruebas reales.',
    description:
      'Dispositivo tipo reloj inteligente que simula el monitoreo de una cama UCI de emergencias. Incluye hardware, lógica de monitoreo, despliegue funcional y documentación técnica.',
    categories: ['IoT / 3D'],
    tags: ['IoT', 'Hardware', 'Despliegue'],
    coverLabel: 'UCI',
    featured: true,
  },
  {
    title: 'Gestión Comercial',
    summary: 'Plataforma web full stack con módulos frontend y backend, base de datos y documentación.',
    description:
      'Sistema web para gestión comercial con módulos frontend y backend, base de datos PostgreSQL, API REST y trabajo bajo Scrum.',
    categories: ['Web', 'Backend'],
    tags: ['Astro', 'TypeScript', 'PostgreSQL'],
    coverLabel: 'SGC',
  },
  {
    title: 'App de Inventario',
    summary: 'Control de stock y reportes con lógica de negocio en C# y Python.',
    description:
      'Aplicación para control de stock, con lógica de negocio en C# (.NET) y Python, conexión a SQL Server y reportes.',
    categories: ['Backend', 'Web'],
    tags: ['C#', '.NET', 'SQL Server'],
    coverLabel: 'INV',
  },
  {
    title: 'Prototipado 3D',
    summary: 'Piezas y prototipos de apoyo para proyectos con máquinas 3D.',
    description: 'Prototipado y piezas de apoyo para proyectos, con operación de equipos y acabados funcionales.',
    categories: ['IoT / 3D'],
    tags: ['3D', 'Taller'],
    coverLabel: '3D',
  },
  {
    title: 'Páginas Responsivas',
    summary: 'Sitios con UI limpia y adaptable a móvil y escritorio.',
    description: 'Páginas web responsivas con énfasis en UI limpia, accesible y adaptable a móvil y escritorio.',
    categories: ['Web'],
    tags: ['HTML', 'CSS', 'JavaScript'],
    coverLabel: 'WEB',
  },
]

export const defaultSkills = [
  { name: 'Frontend', level: 90, group: 'AREA' },
  { name: 'Backend', level: 85, group: 'AREA' },
  { name: 'Datos', level: 85, group: 'AREA' },
  { name: 'Despliegue', level: 80, group: 'AREA' },
  { name: 'HTML', abbr: 'HTML', caption: 'Web', level: 90, group: 'STACK', showInHero: true },
  { name: 'CSS', abbr: 'CSS', caption: 'Estilos', level: 90, group: 'STACK', showInHero: true },
  { name: 'JavaScript', abbr: 'JS', caption: 'Frontend', level: 85, group: 'STACK', showInHero: true },
  { name: 'TypeScript', abbr: 'TS', caption: 'Escalable', level: 80, group: 'STACK', showInHero: true },
  { name: 'C#', abbr: 'C#', caption: 'Backend', level: 80, group: 'STACK', showInHero: true },
  { name: 'Python', abbr: 'Py', caption: 'Lógica', level: 80, group: 'STACK', showInHero: true },
  { name: 'SQL', abbr: 'SQL', caption: 'Datos', level: 85, group: 'STACK', showInHero: true },
  { name: 'Git', abbr: 'Git', caption: 'Versiones', group: 'TOOL', showInHero: true },
  { name: 'VS Code', abbr: 'VS', group: 'TOOL' },
  { name: 'GitHub', abbr: 'GH', group: 'TOOL' },
  { name: 'Astro', abbr: 'As', group: 'TOOL' },
  { name: '.NET', abbr: '.N', group: 'TOOL' },
  { name: 'PostgreSQL', abbr: 'PG', group: 'TOOL' },
  { name: 'Java', abbr: 'Jv', group: 'TOOL' },
  { name: 'Scrum', abbr: 'Sc', group: 'TOOL' },
]

export const defaultServices = [
  { title: 'Desarrollo web', description: 'Interfaces intuitivas y centradas en el usuario.', features: ['Apps a medida', 'Responsive y UI', 'Soporte'], icon: 'code' },
  { title: 'APIs y backend', description: 'Soluciones robustas y escalables.', features: ['API REST', 'Bases SQL', 'Lógica de negocio'], icon: 'server' },
  { title: 'Prototipos IoT', description: 'Dispositivos que validan ideas en el mundo real.', features: ['Monitoreo', 'Despliegue', 'Pruebas reales'], icon: 'cpu' },
  { title: 'Docs y 3D', description: 'Manuales técnicos y piezas físicas.', features: ['Docs técnicas', 'Prototipado 3D', 'Soporte'], icon: 'file' },
]

/** Misma forma que devuelve GET /api/portfolio (con ids y orden sintéticos). */
export function buildDefaultPortfolio() {
  const withMeta = (items, prefix) =>
    items.map((item, index) => ({ id: `${prefix}-${index}`, order: index, ...item }))
  return {
    profile: { id: 1, ...defaultProfile },
    experiences: withMeta(defaultExperiences, 'exp'),
    projects: withMeta(defaultProjects, 'proj').map((p) => ({
      imageUrl: null, liveUrl: null, repoUrl: null, featured: false, published: true, ...p,
    })),
    skills: withMeta(defaultSkills, 'skill').map((s) => ({
      abbr: null, caption: null, level: null, showInHero: false, ...s,
    })),
    services: withMeta(defaultServices, 'svc'),
  }
}
