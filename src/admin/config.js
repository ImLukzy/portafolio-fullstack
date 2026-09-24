// Formularios del CMS descritos como datos: añadir un campo aquí (y en
// schema.prisma + server/validation.js) basta para que aparezca en /admin.
import { Briefcase, FolderKanban, Gauge, Milestone } from 'lucide-react'
import { SERVICE_ICONS, SKILL_GROUPS } from '../../shared/constants.js'

export const PROFILE_SECTIONS = [
  {
    title: 'Identidad',
    description: 'Cómo te presentas en todo el sitio.',
    fields: [
      { name: 'firstName', label: 'Nombre', type: 'text', maxLength: 60, hint: 'Se muestra en cursiva lila.' },
      { name: 'lastName', label: 'Apellidos', type: 'text', maxLength: 80 },
      { name: 'role', label: 'Rol', type: 'text', maxLength: 120 },
      { name: 'location', label: 'Ubicación', type: 'text', maxLength: 120 },
      {
        name: 'avatarUrl',
        label: 'Foto de perfil',
        type: 'image',
        folder: 'profile',
        aspect: 'aspect-[4/5]',
        hint: 'Foto recortada: PNG o WebP con fondo transparente, vertical (4:5), mínimo 800 × 1000 px.',
      },
    ],
  },
  {
    title: 'Inicio',
    description: 'La primera pantalla del portafolio.',
    fields: [
      { name: 'kicker', label: 'Etiqueta superior', type: 'text', maxLength: 120, full: true },
      { name: 'headline', label: 'Presentación', type: 'textarea', rows: 3, maxLength: 400, full: true },
      { name: 'heroQuote', label: 'Frase', type: 'text', maxLength: 300, full: true },
      { name: 'availableFor', label: 'Disponible para', type: 'text', maxLength: 160, full: true },
    ],
  },
  {
    title: 'Sobre mí',
    description: 'Biografía, enfoque y fortalezas.',
    fields: [
      {
        name: 'bio',
        label: 'Biografía',
        type: 'textarea',
        rows: 6,
        maxLength: 3000,
        full: true,
        hint: 'Separa los párrafos con una línea en blanco.',
      },
      { name: 'aboutQuote', label: 'Frase personal', type: 'text', maxLength: 300, full: true },
      { name: 'focusText', label: 'Mi enfoque', type: 'textarea', rows: 3, maxLength: 600, full: true },
      { name: 'focusPoints', label: 'Puntos del enfoque', type: 'list', max: 8, maxLength: 80, full: true },
      { name: 'strengths', label: 'Mis fortalezas', type: 'strengths', max: 8, full: true },
    ],
  },
  {
    title: 'Textos de sección',
    description: 'Introducciones de Proyectos y Habilidades.',
    fields: [
      { name: 'projectsIntro', label: 'Intro de proyectos', type: 'text', maxLength: 300, full: true },
      { name: 'skillsIntro', label: 'Intro de habilidades', type: 'text', maxLength: 300, full: true },
      { name: 'skillsQuote', label: 'Cita de habilidades', type: 'textarea', rows: 2, maxLength: 300, full: true },
    ],
  },
  {
    title: 'Contacto',
    description: 'Datos visibles y mensaje de WhatsApp.',
    fields: [
      { name: 'email', label: 'Email', type: 'email', maxLength: 160 },
      { name: 'phone', label: 'Teléfono (como se muestra)', type: 'text', maxLength: 40 },
      {
        name: 'whatsapp',
        label: 'WhatsApp',
        type: 'text',
        maxLength: 20,
        placeholder: '51984182233',
        hint: 'Solo dígitos, con código de país.',
      },
      { name: 'availability', label: 'Disponibilidad', type: 'text', maxLength: 80 },
      { name: 'workModes', label: 'Modalidad', type: 'text', maxLength: 120, full: true },
      {
        name: 'whatsappMessage',
        label: 'Mensaje predeterminado de WhatsApp',
        type: 'textarea',
        rows: 2,
        maxLength: 500,
        full: true,
      },
      { name: 'contactPitch', label: 'Texto de la tarjeta de WhatsApp', type: 'text', maxLength: 400, full: true },
      { name: 'contactPoints', label: 'Puntos de contacto', type: 'list', max: 8, maxLength: 80, full: true },
    ],
  },
  {
    title: 'Enlaces y archivos',
    description: 'Redes y CV descargable.',
    fields: [
      { name: 'linkedinUrl', label: 'LinkedIn', type: 'url', placeholder: 'https://www.linkedin.com/in/…' },
      { name: 'githubUrl', label: 'GitHub', type: 'url', placeholder: 'https://github.com/…' },
      { name: 'cvUrl', label: 'CV (PDF)', type: 'file', folder: 'documents', accept: 'application/pdf', full: true },
    ],
  },
]

export const PROFILE_FIELD_NAMES = PROFILE_SECTIONS.flatMap((section) => section.fields.map((field) => field.name))

export const COLLECTIONS = {
  trayectoria: {
    endpoint: 'experiences',
    title: 'Trayectoria',
    singular: 'hito',
    description: 'Hitos de “Mi trayectoria”. Arrastra para cambiar el orden.',
    icon: Milestone,
    empty: () => ({ period: '', title: '', description: '', place: '' }),
    fields: [
      { name: 'period', label: 'Periodo', type: 'text', maxLength: 40, placeholder: '2023 – 2026' },
      { name: 'place', label: 'Lugar', type: 'text', maxLength: 80, placeholder: 'TECSUP Arequipa' },
      { name: 'title', label: 'Título', type: 'text', maxLength: 80, full: true },
      { name: 'description', label: 'Descripción', type: 'textarea', rows: 3, maxLength: 300, full: true },
    ],
    row: (item) => ({ title: item.title, subtitle: `${item.period} · ${item.place}` }),
  },

  proyectos: {
    endpoint: 'projects',
    title: 'Proyectos',
    singular: 'proyecto',
    description: 'El destacado aparece en grande; las categorías generan los filtros.',
    icon: FolderKanban,
    empty: () => ({
      title: '',
      summary: '',
      description: '',
      categories: [],
      tags: [],
      coverLabel: '',
      imageUrl: '',
      liveUrl: '',
      repoUrl: '',
      featured: false,
      published: true,
    }),
    fields: [
      { name: 'imageUrl', label: 'Portada', type: 'image', folder: 'projects', aspect: 'aspect-[16/10]', full: true },
      { name: 'title', label: 'Título', type: 'text', maxLength: 100, full: true },
      { name: 'summary', label: 'Resumen', type: 'textarea', rows: 2, maxLength: 240, full: true, hint: 'Se ve en la tarjeta.' },
      {
        name: 'description',
        label: 'Descripción completa',
        type: 'textarea',
        rows: 5,
        maxLength: 4000,
        full: true,
        hint: 'Se ve al abrir el proyecto.',
      },
      {
        name: 'categories',
        label: 'Categorías (filtros)',
        type: 'list',
        max: 6,
        maxLength: 30,
        full: true,
        suggest: 'categories',
      },
      { name: 'tags', label: 'Tecnologías', type: 'list', max: 12, maxLength: 30, full: true, suggest: 'tags' },
      {
        name: 'coverLabel',
        label: 'Monograma de portada',
        type: 'text',
        maxLength: 8,
        placeholder: 'SGC',
        hint: 'Si no hay imagen.',
      },
      { name: 'liveUrl', label: 'Demo', type: 'url', placeholder: 'https://…' },
      { name: 'repoUrl', label: 'Repositorio', type: 'url', placeholder: 'https://github.com/…', full: true },
      { name: 'featured', label: 'Proyecto destacado', type: 'toggle', hint: 'Solo uno a la vez.' },
      { name: 'published', label: 'Publicado', type: 'toggle', hint: 'Oculto = no aparece en el sitio.' },
    ],
    row: (item) => ({ title: item.title, subtitle: [...item.categories, ...item.tags].join(' · ') }),
    badges: (item) => [item.featured && 'Destacado', !item.published && 'Oculto'].filter(Boolean),
    toggle: 'published',
  },

  habilidades: {
    endpoint: 'skills',
    title: 'Habilidades',
    singular: 'habilidad',
    feminine: true,
    description: 'Medidores, barras de nivel y herramientas.',
    icon: Gauge,
    groupBy: { key: 'group', options: SKILL_GROUPS },
    empty: (group = 'STACK') => ({ name: '', abbr: '', caption: '', level: 80, group, showInHero: false }),
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', maxLength: 40 },
      { name: 'group', label: 'Sección', type: 'select', options: SKILL_GROUPS },
      { name: 'abbr', label: 'Abreviatura', type: 'text', maxLength: 6, placeholder: 'JS' },
      { name: 'caption', label: 'Subtítulo (inicio)', type: 'text', maxLength: 30, placeholder: 'Frontend' },
      { name: 'level', label: 'Nivel', type: 'range', full: true, visible: (values) => values.group !== 'TOOL' },
      {
        name: 'showInHero',
        label: 'Mostrar en el inicio',
        type: 'toggle',
        full: true,
        hint: 'Cuadrícula “Tecnología que construyo” (máx. 8).',
      },
    ],
    row: (item) => ({
      title: item.name,
      subtitle: [item.caption, item.showInHero && 'En el inicio'].filter(Boolean).join(' · '),
    }),
  },

  servicios: {
    endpoint: 'services',
    title: 'Servicios',
    singular: 'servicio',
    description: 'Tarjetas de “Servicios que ofrezco”.',
    icon: Briefcase,
    empty: () => ({ title: '', description: '', features: [], icon: 'code' }),
    fields: [
      { name: 'icon', label: 'Icono', type: 'icon', options: SERVICE_ICONS, full: true },
      { name: 'title', label: 'Título', type: 'text', maxLength: 80, full: true },
      { name: 'description', label: 'Descripción', type: 'textarea', rows: 2, maxLength: 300, full: true },
      { name: 'features', label: 'Incluye', type: 'list', max: 8, maxLength: 80, full: true },
    ],
    row: (item) => ({ title: item.title, subtitle: item.features.join(' · ') }),
  },
}
