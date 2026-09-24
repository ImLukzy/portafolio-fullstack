// Iconos de tecnologías a color. Logotipos de Simple Icons (CC0, colores oficiales);
// Vite solo incluye en el bundle los que se importan aquí.
import { Box, CodeXml, Cpu, Database, PenTool, RefreshCcw } from 'lucide-react'
import {
  siAngular,
  siArduino,
  siAstro,
  siCloudflare,
  siCss,
  siDocker,
  siDotnet,
  siFigma,
  siGit,
  siGithub,
  siHtml5,
  siJavascript,
  siLaravel,
  siLinux,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPhp,
  siPostgresql,
  siPrisma,
  siPython,
  siRaspberrypi,
  siReact,
  siSqlite,
  siTailwindcss,
  siTypescript,
  siVite,
  siVuedotjs,
} from 'simple-icons'
import { cn } from './ui.jsx'

const brand = (icon, overrides = {}) => ({ kind: 'brand', path: icon.path, hex: icon.hex, ...overrides })
const glyph = (Icon, hex) => ({ kind: 'glyph', Icon, hex })
const text = (label, hex) => ({ kind: 'text', label, hex })

// Claves normalizadas (minúsculas, sin espacios extra). Se busca por nombre y luego por abreviatura.
const ICONS = {
  html: brand(siHtml5),
  html5: brand(siHtml5),
  css: brand(siCss),
  css3: brand(siCss),
  // El logo de JS es un cuadrado con las letras vaciadas: se rellenan en negro.
  javascript: brand(siJavascript, { knockout: '#000000' }),
  js: brand(siJavascript, { knockout: '#000000' }),
  typescript: brand(siTypescript),
  ts: brand(siTypescript),
  react: brand(siReact, { hex: '087EA4' }), // Azul oficial de react.dev: legible sobre fondo claro
  python: brand(siPython),
  py: brand(siPython),
  figma: brand(siFigma),
  git: brand(siGit),
  github: brand(siGithub),
  gh: brand(siGithub),
  postgresql: brand(siPostgresql),
  postgres: brand(siPostgresql),
  pg: brand(siPostgresql),
  mysql: brand(siMysql),
  sqlite: brand(siSqlite),
  mongodb: brand(siMongodb),
  astro: brand(siAstro),
  '.net': brand(siDotnet),
  dotnet: brand(siDotnet),
  java: brand(siOpenjdk, { hex: 'ED8B00' }),
  'node.js': brand(siNodedotjs),
  node: brand(siNodedotjs),
  nodejs: brand(siNodedotjs),
  'tailwind css': brand(siTailwindcss),
  tailwind: brand(siTailwindcss),
  vite: brand(siVite),
  prisma: brand(siPrisma),
  docker: brand(siDocker),
  linux: brand(siLinux, { hex: '1A1A1A' }),
  'next.js': brand(siNextdotjs),
  nextjs: brand(siNextdotjs),
  'vue.js': brand(siVuedotjs),
  vue: brand(siVuedotjs),
  angular: brand(siAngular, { hex: 'DD0031' }),
  php: brand(siPhp),
  laravel: brand(siLaravel),
  arduino: brand(siArduino),
  'raspberry pi': brand(siRaspberrypi),
  cloudflare: brand(siCloudflare),
  // Sin logotipo en Simple Icons: icono genérico o monograma en el color de la marca.
  'c#': text('C#', '9B4F96'),
  csharp: text('C#', '9B4F96'),
  sql: glyph(Database, 'CC2927'),
  'sql server': glyph(Database, 'CC2927'),
  'vs code': glyph(CodeXml, '007ACC'),
  vscode: glyph(CodeXml, '007ACC'),
  'visual studio code': glyph(CodeXml, '007ACC'),
  'ui/ux': glyph(PenTool, '8B5CF6'),
  'ux/ui': glyph(PenTool, '8B5CF6'),
  'diseño ui': glyph(PenTool, '8B5CF6'),
  scrum: glyph(RefreshCcw, '009FDA'),
  iot: glyph(Cpu, '00878F'),
  '3d': glyph(Box, 'F97316'),
}

const normalize = (value) => (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, ' ')

export function resolveTechIcon(skill) {
  return ICONS[normalize(skill.name)] ?? ICONS[normalize(skill.abbr)] ?? null
}

/** Logotipo a color de la tecnología; si no hay, monograma con la abreviatura. */
export function TechIcon({ skill, className }) {
  const icon = resolveTechIcon(skill)
  const box = cn('size-7 shrink-0', className)

  if (!icon) {
    return (
      <span className={cn(box, 'grid place-items-center rounded-md bg-accent-strong text-[0.625rem] font-bold text-white')}>
        {(skill.abbr || skill.name).slice(0, 3)}
      </span>
    )
  }
  if (icon.kind === 'text') {
    return (
      <span
        className={cn(box, 'grid place-items-center rounded-md text-[0.6875rem] font-bold text-white')}
        style={{ backgroundColor: `#${icon.hex}` }}
      >
        {icon.label}
      </span>
    )
  }
  if (icon.kind === 'glyph') {
    const { Icon } = icon
    return <Icon className={box} style={{ color: `#${icon.hex}` }} strokeWidth={2.2} aria-hidden />
  }
  return (
    <svg viewBox="0 0 24 24" className={box} aria-hidden>
      {icon.knockout && <rect x="2" y="2" width="20" height="20" fill={icon.knockout} />}
      <path d={icon.path} fill={`#${icon.hex}`} />
    </svg>
  )
}
