// Constantes compartidas entre el servidor (validación) y el frontend (UI/CMS).

/** Tamaño máximo de subida. Vercel limita el cuerpo de cada petición a 4,5 MB. */
export const MAX_UPLOAD_MB = 4

export const SKILL_GROUPS = [
  { value: 'AREA', label: 'Habilidades técnicas', hint: 'Medidor circular' },
  { value: 'STACK', label: 'Stack de desarrollo', hint: 'Barra de nivel' },
  { value: 'TOOL', label: 'Herramientas', hint: 'Sin porcentaje' },
]

export const SERVICE_ICONS = [
  { value: 'code', label: 'Código' },
  { value: 'server', label: 'Servidor' },
  { value: 'database', label: 'Base de datos' },
  { value: 'cpu', label: 'Hardware / IoT' },
  { value: 'box', label: 'Prototipo 3D' },
  { value: 'palette', label: 'Diseño' },
  { value: 'rocket', label: 'Despliegue' },
  { value: 'file', label: 'Documentación' },
]
