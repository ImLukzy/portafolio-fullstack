import { FileText, ImagePlus, LoaderCircle, Plus, Trash2, Upload, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useId, useRef, useState } from 'react'
import { cn } from '../components/ui.jsx'
import { api } from '../lib/api.js'
import { EASE_OUT, SPRING_SNAPPY } from '../lib/motion.js'
import { MAX_UPLOAD_MB } from '../../shared/constants.js'
import { SERVICE_ICON_COMPONENTS } from '../site/sections/Skills.jsx'
import { useAdmin } from './context.jsx'

export const inputClass = (invalid) =>
  cn(
    'w-full rounded-lg border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-subtle',
    'transition-[border-color,box-shadow] duration-150 focus:ring-2 focus:outline-none',
    invalid
      ? 'border-danger/60 focus:ring-danger/15'
      : 'border-line hover:border-line-strong focus:border-accent/60 focus:ring-accent/15',
  )

/** Error de un campo, incluidos los anidados del servidor ("strengths.0.title"). */
export function errorFor(errors, name) {
  if (errors[name]) return errors[name]
  const nested = Object.entries(errors).find(([key]) => key.startsWith(`${name}.`))
  if (!nested) return undefined
  const index = Number(nested[0].split('.')[1])
  return Number.isInteger(index) ? `Elemento ${index + 1}: ${nested[1]}` : nested[1]
}

/** Quita el error de un campo (y sus anidados) cuando el usuario lo edita. */
export function clearError(errors, name) {
  return Object.fromEntries(Object.entries(errors).filter(([key]) => key !== name && !key.startsWith(`${name}.`)))
}

// ─── Envoltorio: etiqueta, ayuda y error ─────────────────────────────
function Field({ id, label, hint, error, full, children }) {
  return (
    <div className={cn('min-w-0', full && 'sm:col-span-2')}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink/90">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-subtle">{hint}</p>}
      {/* El error entra con altura animada: el formulario se abre, no salta. */}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="overflow-hidden text-xs text-danger"
          >
            <span className="block pt-1.5">{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Renderiza el control adecuado según `field.type` (ver admin/config.js). */
export function FormField({ field, value, onChange, error, suggestions }) {
  const id = `field-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}-${field.name}`
  const describedBy = error ? `${id}-error` : undefined
  const common = { id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy }

  let control
  switch (field.type) {
    case 'textarea':
      control = (
        <textarea
          {...common}
          rows={field.rows ?? 3}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClass(error), 'resize-y leading-relaxed')}
        />
      )
      break
    case 'select':
      control = (
        <select
          {...common}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          className={cn(inputClass(error), 'appearance-none bg-[right_0.75rem_center] bg-no-repeat pr-8')}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%239d9daf' stroke-width='2'%3E%3Cpath d='m3 4.5 3 3 3-3'/%3E%3C/svg%3E\")",
          }}
        >
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
      break
    case 'toggle':
      return (
        <div className={cn('min-w-0', field.full && 'sm:col-span-2')}>
          <Toggle id={id} label={field.label} hint={field.hint} checked={Boolean(value)} onChange={onChange} />
        </div>
      )
    case 'range':
      control = <RangeInput id={id} value={value ?? 0} onChange={onChange} />
      break
    case 'list':
      control = (
        <TagInput
          id={id}
          value={value ?? []}
          onChange={onChange}
          max={field.max}
          maxLength={field.maxLength}
          invalid={Boolean(error)}
          suggestions={suggestions}
        />
      )
      break
    case 'image':
      control = <ImageInput value={value} onChange={onChange} folder={field.folder} aspect={field.aspect} />
      break
    case 'file':
      control = <FileInput value={value} onChange={onChange} folder={field.folder} accept={field.accept} />
      break
    case 'icon':
      control = <IconPicker value={value} onChange={onChange} options={field.options} />
      break
    case 'strengths':
      control = <StrengthsInput value={value ?? []} onChange={onChange} max={field.max} />
      break
    default:
      control = (
        <input
          {...common}
          type={field.type === 'email' || field.type === 'url' ? field.type : 'text'}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass(error)}
        />
      )
  }

  return (
    <Field id={id} label={field.label} hint={field.hint} error={error} full={field.full || field.type === 'image'}>
      {control}
    </Field>
  )
}

// ─── Interruptor ─────────────────────────────────────────────────────
function Toggle({ id, label, hint, checked, onChange }) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-surface-2/60 px-4 py-3 transition-colors hover:border-line-strong"
    >
      <span>
        <span className="block text-[13px] font-medium text-ink/90">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-subtle">{hint}</span>}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200',
          checked ? 'justify-end bg-accent' : 'justify-start bg-surface-3 ring-1 ring-line-strong',
        )}
      >
        <motion.span layout transition={SPRING_SNAPPY} className="size-5 rounded-full bg-white shadow-sm" />
      </button>
    </label>
  )
}

// ─── Nivel 0–100 con vista previa ───────────────────────────────────
function RangeInput({ id, value, onChange }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-line bg-surface-2 px-3 py-2.5">
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-surface-3 accent-accent"
        style={{ background: `linear-gradient(to right, #8b5cf6 ${value}%, var(--color-surface-3) ${value}%)` }}
      />
      <span className="w-10 text-right text-sm font-semibold tabular-nums">{value}%</span>
    </div>
  )
}

// ─── Lista de etiquetas ──────────────────────────────────────────────
function TagInput({ id, value, onChange, max = 10, maxLength = 40, invalid, suggestions = [] }) {
  const [draft, setDraft] = useState('')
  const full = value.length >= max

  const add = (raw) => {
    const tag = raw.trim().slice(0, maxLength)
    setDraft('')
    if (!tag || full || value.some((item) => item.toLowerCase() === tag.toLowerCase())) return
    onChange([...value, tag])
  }
  const remove = (tag) => onChange(value.filter((item) => item !== tag))
  const pending = suggestions.filter((tag) => !value.includes(tag)).slice(0, 8)

  return (
    <div>
      <div
        className={cn(
          inputClass(invalid),
          'flex min-h-10 cursor-text flex-wrap items-center gap-1.5 px-2 py-1.5 focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/15',
        )}
        onClick={(event) => event.currentTarget.querySelector('input')?.focus()}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {value.map((tag) => (
            <motion.span
              key={tag}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.12 } }}
              transition={SPRING_SNAPPY}
              className="inline-flex items-center gap-1 rounded-md border border-line-strong bg-surface-3 py-0.5 pr-1 pl-2 text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                aria-label={`Quitar ${tag}`}
                className="grid size-4 place-items-center rounded text-subtle hover:bg-white/10 hover:text-ink"
              >
                <X className="size-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          id={id}
          value={draft}
          disabled={full}
          maxLength={maxLength}
          placeholder={full ? `Máximo ${max}` : value.length ? '' : 'Escribe y pulsa Enter'}
          onChange={(event) => {
            const text = event.target.value
            if (text.endsWith(',')) add(text.slice(0, -1))
            else setDraft(text)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              add(draft)
            } else if (event.key === 'Backspace' && !draft && value.length) {
              remove(value.at(-1))
            }
          }}
          onBlur={() => add(draft)}
          className="min-w-[10ch] flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-subtle"
        />
      </div>
      {pending.length > 0 && !full && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-subtle">Usadas:</span>
          {pending.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => add(tag)}
              className="rounded-md border border-dashed border-line-strong px-1.5 py-0.5 text-[11px] text-muted transition-colors hover:border-accent/50 hover:text-ink"
            >
              + {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Subida a Cloudflare R2 ─────────────────────────────────────────
function useUpload(folder, onChange) {
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState(null)

  const upload = async (file) => {
    if (!file) return
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return setError(`El archivo supera ${MAX_UPLOAD_MB} MB.`)
    setError(null)
    setProgress(0)
    try {
      const { url } = await api.upload(file, folder, setProgress)
      onChange(url)
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setProgress(null)
    }
  }
  return { progress, error, upload }
}

function R2Hint() {
  const { status } = useAdmin()
  if (status?.r2 !== false) return null
  return (
    <p className="mt-1.5 text-xs text-amber-300/80">
      R2 no configurado: pega una URL o añade las claves R2_* en .env.
    </p>
  )
}

function ProgressBar({ progress }) {
  return (
    <div className="absolute inset-x-0 bottom-0 h-1 bg-black/40">
      <motion.div
        className="h-full bg-accent"
        initial={{ width: 0 }}
        animate={{ width: `${Math.round(progress * 100)}%` }}
        transition={{ duration: 0.2 }}
      />
    </div>
  )
}

function ImageInput({ value, onChange, folder, aspect = 'aspect-[16/10]' }) {
  const fileInput = useRef(null)
  const [dragging, setDragging] = useState(false)
  const { progress, error, upload } = useUpload(folder, onChange)
  const busy = progress !== null

  return (
    <div className={aspect === 'aspect-square' || aspect === 'aspect-[4/5]' ? 'max-w-56' : undefined}>
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          upload(event.dataTransfer.files?.[0])
        }}
        className={cn(
          'group relative overflow-hidden rounded-xl border border-dashed bg-surface-2 transition-colors',
          aspect,
          dragging ? 'border-accent bg-accent/5' : 'border-line-strong',
        )}
      >
        {value ? (
          <img src={value} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-subtle transition-colors hover:text-ink"
          >
            <ImagePlus className="size-6" />
            <span className="text-xs">Arrastra una imagen o haz clic</span>
          </button>
        )}
        {value && !busy && (
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-linear-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-1 text-xs text-white backdrop-blur hover:bg-white/25"
            >
              <Upload className="size-3" /> Cambiar
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-1 text-xs text-white backdrop-blur hover:bg-danger/70"
            >
              <Trash2 className="size-3" /> Quitar
            </button>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-black/50 text-xs text-white">
            <span className="flex items-center gap-2">
              <LoaderCircle className="size-4 animate-spin" /> {Math.round(progress * 100)}%
            </span>
            <ProgressBar progress={progress} />
          </div>
        )}
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          upload(event.target.files?.[0])
          event.target.value = ''
        }}
      />
      <input
        type="url"
        aria-label="URL de la imagen"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder="…o pega una URL https://"
        className={cn(inputClass(false), 'mt-2 text-xs')}
      />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      <R2Hint />
    </div>
  )
}

function FileInput({ value, onChange, folder, accept }) {
  const fileInput = useRef(null)
  const { progress, error, upload } = useUpload(folder, onChange)
  const name = value ? decodeURIComponent(value.split('/').at(-1)) : null

  return (
    <div>
      <div className="relative flex items-center gap-3 overflow-hidden rounded-lg border border-line bg-surface-2 p-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-surface-3 text-accent-soft">
          <FileText className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          {value ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="block truncate text-sm hover:text-accent-soft">
              {name}
            </a>
          ) : (
            <span className="text-sm text-subtle">Sin archivo</span>
          )}
        </div>
        <button
          type="button"
          disabled={progress !== null}
          onClick={() => fileInput.current?.click()}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line-strong px-2.5 text-xs transition-colors hover:bg-surface-3 disabled:opacity-50"
        >
          {progress !== null ? <LoaderCircle className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          Subir PDF
        </button>
        {progress !== null && <ProgressBar progress={progress} />}
      </div>
      <input
        ref={fileInput}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          upload(event.target.files?.[0])
          event.target.value = ''
        }}
      />
      <input
        type="text"
        aria-label="URL del archivo"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder="…o una URL: https://… o /archivo.pdf"
        className={cn(inputClass(false), 'mt-2 text-xs')}
      />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      <R2Hint />
    </div>
  )
}

// ─── Selector de icono ───────────────────────────────────────────────
function IconPicker({ value, onChange, options }) {
  return (
    <div role="radiogroup" className="grid grid-cols-4 gap-2 sm:grid-cols-8">
      {options.map((option) => {
        const Icon = SERVICE_ICON_COMPONENTS[option.value]
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            title={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative grid aspect-square place-items-center rounded-lg border transition-colors duration-150',
              selected ? 'border-accent/60 text-accent-soft' : 'border-line text-subtle hover:border-line-strong hover:text-ink',
            )}
          >
            {selected && (
              <motion.span layoutId="icon-picker" transition={SPRING_SNAPPY} className="absolute inset-0 rounded-lg bg-accent/10" />
            )}
            <Icon className="relative size-4" />
            <span className="sr-only">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Fortalezas: pares título + descripción ─────────────────────────
function StrengthsInput({ value, onChange, max = 8 }) {
  const update = (index, patch) => onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)))

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {value.map((item, index) => (
          <motion.div
            // El índice basta: las fortalezas solo se añaden al final o se borran.
            key={index}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 rounded-xl border border-line bg-surface-2/50 p-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-surface-3 text-xs text-subtle tabular-nums">
                {index + 1}
              </span>
              <div className="grid flex-1 gap-2">
                <input
                  aria-label={`Título de la fortaleza ${index + 1}`}
                  value={item.title}
                  maxLength={80}
                  placeholder="Título"
                  onChange={(event) => update(index, { title: event.target.value })}
                  className={inputClass(false)}
                />
                <textarea
                  aria-label={`Descripción de la fortaleza ${index + 1}`}
                  value={item.description}
                  maxLength={300}
                  rows={2}
                  placeholder="Descripción"
                  onChange={(event) => update(index, { description: event.target.value })}
                  className={cn(inputClass(false), 'resize-none')}
                />
              </div>
              <button
                type="button"
                aria-label={`Eliminar fortaleza ${index + 1}`}
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="grid size-7 shrink-0 place-items-center rounded-md text-subtle transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {value.length < max && (
        <button
          type="button"
          onClick={() => onChange([...value, { title: '', description: '' }])}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line-strong py-2.5 text-xs text-muted transition-colors hover:border-accent/50 hover:text-ink"
        >
          <Plus className="size-3.5" /> Añadir fortaleza
        </button>
      )}
    </div>
  )
}
