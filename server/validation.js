import { z } from 'zod'
import { SERVICE_ICONS, SKILL_GROUPS } from '../shared/constants.js'

// Nota: sin .default() a propósito. Los PATCH parciales no deben rellenar
// campos ausentes; los valores por defecto viven en schema.prisma.

const required = (max) => z.string().trim().min(1, 'Campo requerido').max(max, `Máximo ${max} caracteres`)

/** Texto opcional: "" se guarda como null; ausente (undefined) no se toca. */
const optional = (max) =>
  z.string().trim().max(max, `Máximo ${max} caracteres`).transform((v) => v || null).nullish()

/** Enlace absoluto http(s) o ruta local "/…". Bloquea javascript: y similares. */
const link = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === '' || /^(https?:\/\/|\/(?!\/))/i.test(v), 'Debe empezar con https:// o /')
  .transform((v) => v || null)
  .nullish()

const list = (maxItems, maxLength) =>
  z
    .array(z.string().trim().min(1).max(maxLength, `Cada elemento: máximo ${maxLength} caracteres`))
    .max(maxItems, `Máximo ${maxItems} elementos`)
    .transform((items) => [...new Set(items)])

export const profileSchema = z.object({
  firstName: required(60),
  lastName: required(80),
  role: required(120),
  location: required(120),
  avatarUrl: link,
  kicker: required(120),
  headline: required(400),
  heroQuote: optional(300),
  availableFor: optional(160),
  bio: required(3000),
  aboutQuote: optional(300),
  focusText: optional(600),
  focusPoints: list(8, 80),
  strengths: z.array(z.object({ title: required(80), description: required(300) })).max(8),
  projectsIntro: optional(300),
  skillsIntro: optional(300),
  skillsQuote: optional(300),
  email: z.email('Email inválido').max(160),
  phone: optional(40),
  whatsapp: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v === '' || (v.length >= 8 && v.length <= 15), 'Usa solo dígitos con código de país: 51984182233')
    .transform((v) => v || null)
    .nullish(),
  whatsappMessage: optional(500),
  contactPitch: optional(400),
  contactPoints: list(8, 80),
  availability: optional(80),
  workModes: optional(120),
  linkedinUrl: link,
  githubUrl: link,
  cvUrl: link,
})

export const experienceSchema = z.object({
  period: required(40),
  title: required(80),
  description: required(300),
  place: required(80),
})

export const projectSchema = z.object({
  title: required(100),
  summary: required(240),
  description: optional(4000),
  categories: list(6, 30).optional(),
  tags: list(12, 30).optional(),
  coverLabel: optional(8),
  imageUrl: link,
  liveUrl: link,
  repoUrl: link,
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
})

export const skillSchema = z.object({
  name: required(40),
  abbr: optional(6),
  caption: optional(30),
  level: z.number({ error: 'Debe ser un número' }).int().min(0, 'Entre 0 y 100').max(100, 'Entre 0 y 100').nullish(),
  group: z.enum(SKILL_GROUPS.map((g) => g.value), { error: 'Grupo inválido' }),
  showInHero: z.boolean().optional(),
})

export const serviceSchema = z.object({
  title: required(80),
  description: required(300),
  features: list(8, 80).optional(),
  icon: z.enum(SERVICE_ICONS.map((i) => i.value), { error: 'Icono inválido' }).nullish(),
})

export const reorderSchema = z.object({
  ids: z.array(z.string().min(1).max(64)).min(1).max(500),
})

/** Formatea un ZodError como { campo: "mensaje" } para mostrarlo en el CMS. */
export function fieldErrors(error) {
  const out = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_'
    out[key] ??= issue.message
  }
  return out
}
