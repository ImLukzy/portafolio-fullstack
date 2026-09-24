export class ApiError extends Error {
  constructor(message, status, fields = null) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

async function request(method, path, body) {
  let response
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor.', 0)
  }
  if (response.status === 204) return null
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(data?.error ?? `Error ${response.status}`, response.status, data?.fields)
  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body = {}) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),

  /** Sube un archivo a R2 vía /api/admin/upload con progreso (fetch no lo expone). */
  upload(file, folder, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `/api/admin/upload?folder=${encodeURIComponent(folder)}`)
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress?.(event.loaded / event.total)
      }
      xhr.onload = () => {
        let data = null
        try {
          data = JSON.parse(xhr.responseText)
        } catch {
          /* respuesta vacía */
        }
        if (xhr.status >= 200 && xhr.status < 300) resolve(data)
        else reject(new ApiError(data?.error ?? 'No se pudo subir el archivo.', xhr.status))
      }
      xhr.onerror = () => reject(new ApiError('Error de red al subir el archivo.', 0))
      const form = new FormData()
      form.append('file', file)
      xhr.send(form)
    })
  },
}
