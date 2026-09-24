// Constantes compartidas entre el servidor (validación) y el frontend (UI/CMS).

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
