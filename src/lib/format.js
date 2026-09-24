/** "51984182233" → "+51 984 182 233" (agrupa los 9 dígitos nacionales en tríos). */
export function formatWhatsApp(digits) {
  if (!digits) return ''
  if (digits.length <= 9) return digits.replace(/(\d{3})(?=\d)/g, '$1 ')
  const national = digits.slice(-9).replace(/(\d{3})(?=\d)/g, '$1 ')
  return `+${digits.slice(0, -9)} ${national}`
}

export function telHref(profile) {
  if (profile.whatsapp) return `tel:+${profile.whatsapp}`
  return profile.phone ? `tel:${profile.phone.replace(/[^\d+]/g, '')}` : null
}

export function whatsappHref(digits, message) {
  if (!digits) return null
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}

export const initials = (profile) => `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()

export const paragraphs = (text) => (text ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
