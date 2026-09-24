/**
 * Cloudflare R2 uploader (API compatible con S3 vía @aws-sdk/client-s3).
 *
 * Variables de entorno requeridas:
 *   CLOUDFLARE_ACCOUNT_ID   ID de la cuenta (Dashboard → R2 → "Account ID")
 *   R2_ACCESS_KEY_ID        Token de API de R2 (Object Read & Write)
 *   R2_SECRET_ACCESS_KEY    Secreto del token
 *   R2_BUCKET_NAME          Nombre del bucket
 *   R2_PUBLIC_URL           Dominio público del bucket (r2.dev o dominio propio)
 */
import { randomUUID } from 'node:crypto'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { MAX_UPLOAD_MB } from '../shared/constants.js'
import './env.js'

const EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
}

/** Qué tipos acepta cada carpeta del bucket. */
export const UPLOAD_FOLDERS = {
  projects: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
  profile: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  documents: ['application/pdf'],
}

export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024

function config() {
  const read = (key) => (process.env[key] ?? '').trim()
  return {
    accountId: read('CLOUDFLARE_ACCOUNT_ID'),
    accessKeyId: read('R2_ACCESS_KEY_ID'),
    secretAccessKey: read('R2_SECRET_ACCESS_KEY'),
    bucket: read('R2_BUCKET_NAME'),
    publicUrl: read('R2_PUBLIC_URL').replace(/\/+$/, ''),
  }
}

export function isR2Configured() {
  return Object.values(config()).every(Boolean)
}

let client = null

function getClient() {
  const { accountId, accessKeyId, secretAccessKey } = config()
  client ??= new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    // R2 no admite todos los checksums que el SDK v3 añade por defecto.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  })
  return client
}

export class UploadError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

/**
 * Sube un archivo a R2 y devuelve su URL pública.
 * @param {{ buffer: Buffer, contentType: string, folder: keyof UPLOAD_FOLDERS }} file
 * @returns {Promise<{ key: string, url: string }>}
 */
export async function uploadToR2({ buffer, contentType, folder }) {
  if (!isR2Configured()) {
    throw new UploadError('Cloudflare R2 no está configurado. Revisa las variables R2_* en .env.', 503)
  }
  const allowed = UPLOAD_FOLDERS[folder]
  if (!allowed) throw new UploadError(`Carpeta no permitida: ${folder}`)
  if (!allowed.includes(contentType)) {
    throw new UploadError(`Tipo de archivo no permitido en "${folder}": ${contentType}`)
  }
  if (buffer.length > MAX_UPLOAD_BYTES) throw new UploadError(`El archivo supera ${MAX_UPLOAD_MB} MB.`, 413)

  const { bucket, publicUrl } = config()
  const key = `${folder}/${new Date().getFullYear()}/${randomUUID()}.${EXTENSIONS[contentType]}`

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // Las claves son únicas (UUID), así que el archivo nunca cambia: caché inmutable.
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  )

  return { key, url: `${publicUrl}/${key}` }
}

export async function deleteFromR2(key) {
  if (!isR2Configured()) return
  const { bucket } = config()
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}

/** Convierte una URL pública de este bucket en su clave. Devuelve null si es externa. */
export function keyFromPublicUrl(url) {
  const { publicUrl } = config()
  if (!url || !publicUrl || !url.startsWith(`${publicUrl}/`)) return null
  return url.slice(publicUrl.length + 1)
}

/** Borra el objeto si la URL pertenece al bucket. Nunca lanza: la limpieza es "best effort". */
export async function deleteFromR2ByUrl(url) {
  const key = keyFromPublicUrl(url)
  if (!key) return
  try {
    await deleteFromR2(key)
  } catch (error) {
    console.warn(`[r2] No se pudo borrar ${key}:`, error.message)
  }
}
