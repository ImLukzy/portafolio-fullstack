import { Eye, EyeOff, GripVertical, LoaderCircle, Pencil, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { AnimatePresence, Reorder, motion, useDragControls } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, ProjectCover, cn } from '../components/ui.jsx'
import { api } from '../lib/api.js'
import { EASE_DRAWER, EASE_OUT, SPRING_SNAPPY } from '../lib/motion.js'
import { SERVICE_ICON_COMPONENTS } from '../site/sections/Skills.jsx'
import { useRequest, useToast } from './context.jsx'
import { FormField, clearError, errorFor } from './fields.jsx'
import { PageHeader, RowsSkeleton } from './parts.jsx'

export function CollectionEditor({ config }) {
  const run = useRequest()
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [group, setGroup] = useState(config.groupBy?.options[0].value)
  const [editing, setEditing] = useState(null) // { item } — sin id = nuevo
  const base = `/admin/${config.endpoint}`
  const closeEditor = useCallback(() => setEditing(null), [])

  useEffect(() => {
    run(() => api.get(base))
      .then(setItems)
      .catch(() => setItems([]))
  }, [run, base])

  const groupKey = config.groupBy?.key
  const visible = useMemo(
    () => (items && groupKey ? items.filter((item) => item[groupKey] === group) : items),
    [items, groupKey, group],
  )
  const visibleRef = useRef(visible)
  visibleRef.current = visible

  // Valores ya usados en la colección, para sugerirlos en los campos de lista.
  const suggestions = useMemo(() => {
    const out = {}
    for (const field of config.fields) {
      if (field.suggest) out[field.name] = [...new Set((items ?? []).flatMap((item) => item[field.suggest] ?? []))]
    }
    return out
  }, [items, config.fields])

  const reorder = (next) => {
    setItems((current) => (groupKey ? [...next, ...current.filter((item) => item[groupKey] !== group)] : next))
  }

  const persistOrder = () => {
    const ids = visibleRef.current.map((item) => item.id)
    run(() => api.put(`${base}/order`, { ids })).catch(() => {})
  }

  /** Mover con teclado (flechas en el asa): accesible sin arrastrar. */
  const moveBy = (item, delta) => {
    const list = [...visibleRef.current]
    const from = list.indexOf(item)
    const to = from + delta
    if (to < 0 || to >= list.length) return
    list.splice(to, 0, list.splice(from, 1)[0])
    reorder(list)
    visibleRef.current = list
    persistOrder()
  }

  // El servidor desmarca los demás destacados; replicamos eso en local.
  const applySaved = (saved, isNew) => {
    setItems((current) => {
      const next = current.map((item) =>
        item.id === saved.id ? saved : saved.featured && item.featured ? { ...item, featured: false } : item,
      )
      return isNew ? [...next, saved] : next
    })
  }

  const save = async (values) => {
    const isNew = !editing.item.id
    const payload = Object.fromEntries(config.fields.map((field) => [field.name, values[field.name]]))
    if (groupKey === 'group' && payload.group === 'TOOL') payload.level = null
    const saved = await run(() => (isNew ? api.post(base, payload) : api.put(`${base}/${editing.item.id}`, payload)))
    applySaved(saved, isNew)
    if (groupKey) setGroup(saved[groupKey])
    toast.success(isNew ? `${capitalize(config.singular)} ${agree(config, 'creado', 'creada')}` : 'Cambios guardados')
    setEditing(null)
  }

  const remove = async (item) => {
    try {
      await run(() => api.delete(`${base}/${item.id}`))
    } catch {
      return
    }
    setItems((current) => current.filter((other) => other.id !== item.id))
    toast.success(`${capitalize(config.singular)} ${agree(config, 'eliminado', 'eliminada')}`)
  }

  const toggle = async (item) => {
    const field = config.toggle
    const saved = await run(() => api.patch(`${base}/${item.id}`, { [field]: !item[field] })).catch(() => null)
    if (saved) applySaved(saved, false)
  }

  return (
    <>
      <PageHeader
        title={config.title}
        description={config.description}
        action={
          <Button onClick={() => setEditing({ item: config.empty(group) })}>
            <Plus /> {agree(config, 'Nuevo', 'Nueva')} {config.singular}
          </Button>
        }
      />

      {config.groupBy && (
        <GroupTabs
          options={config.groupBy.options}
          value={group}
          onChange={setGroup}
          counts={Object.fromEntries(
            config.groupBy.options.map((option) => [
              option.value,
              items?.filter((item) => item[groupKey] === option.value).length ?? 0,
            ]),
          )}
        />
      )}

      <div className="mt-6">
        {!visible ? (
          <RowsSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState config={config} onCreate={() => setEditing({ item: config.empty(group) })} />
        ) : (
          <Reorder.Group axis="y" values={visible} onReorder={reorder} className="space-y-2">
            {visible.map((item) => (
              <Row
                key={item.id}
                item={item}
                config={config}
                onDragEnd={persistOrder}
                onMove={(delta) => moveBy(item, delta)}
                onEdit={() => setEditing({ item })}
                onDelete={() => remove(item)}
                onToggle={() => toggle(item)}
              />
            ))}
          </Reorder.Group>
        )}
      </div>

      <EditorDrawer
        editing={editing}
        config={config}
        suggestions={suggestions}
        onClose={closeEditor}
        onSave={save}
      />
    </>
  )
}

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)

/** Concordancia de género: "Nuevo proyecto" / "Nueva habilidad". */
const agree = (config, masculine, feminine) => (config.feminine ? feminine : masculine)

function GroupTabs({ options, value, onChange, counts }) {
  return (
    <div role="tablist" className="mt-8 inline-flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className="relative rounded-lg px-3.5 py-1.5 text-[13px]"
          >
            {active && (
              <motion.span layoutId="group-tab" transition={SPRING_SNAPPY} className="absolute inset-0 rounded-lg bg-surface-3 ring-1 ring-line-strong" />
            )}
            <span className={cn('relative flex items-center gap-2 transition-colors', active ? 'text-ink' : 'text-muted hover:text-ink')}>
              {option.label}
              <span className="text-[11px] text-subtle tabular-nums">{counts[option.value]}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

function Thumb({ item, config }) {
  if (config.endpoint === 'projects') {
    return <ProjectCover project={item} className="h-10 w-16 shrink-0 rounded-md border border-line" labelClassName="text-[10px] tracking-[0.15em]" />
  }
  if (config.endpoint === 'skills') {
    return (
      <span className="relative grid h-10 w-16 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-surface-2 text-xs font-semibold text-accent-soft">
        {item.abbr || item.name.slice(0, 2)}
        {item.group !== 'TOOL' && item.level != null && (
          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-surface-3">
            <span className="block h-full bg-accent" style={{ width: `${item.level}%` }} />
          </span>
        )}
      </span>
    )
  }
  const Icon = config.endpoint === 'services' ? (SERVICE_ICON_COMPONENTS[item.icon] ?? Sparkles) : config.icon
  return (
    <span className="grid h-10 w-16 shrink-0 place-items-center rounded-md border border-line bg-surface-2 text-accent-soft">
      <Icon className="size-4" />
    </span>
  )
}

function Row({ item, config, onDragEnd, onMove, onEdit, onDelete, onToggle }) {
  const controls = useDragControls()
  const [confirming, setConfirming] = useState(false)
  const meta = config.row(item)
  const badges = config.badges?.(item) ?? []
  const toggled = config.toggle ? item[config.toggle] : null

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.015, boxShadow: '0 24px 48px -16px rgb(0 0 0 / 0.7)' }}
      className="relative flex h-[62px] items-center gap-3 overflow-hidden rounded-xl border border-line bg-surface px-2.5 transition-colors hover:border-line-strong"
    >
      <button
        type="button"
        aria-label={`Reordenar ${meta.title} (arrastra o usa las flechas)`}
        onPointerDown={(event) => controls.start(event)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault()
            onMove(event.key === 'ArrowUp' ? -1 : 1)
          }
        }}
        className="grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-md text-subtle transition-colors hover:bg-white/5 hover:text-ink active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <Thumb item={item} config={config} />
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <span className="flex items-center gap-2">
          <span className={cn('truncate text-sm font-medium', toggled === false && 'text-muted')}>{meta.title}</span>
          {badges.map((badge) => (
            <span
              key={badge}
              className={cn(
                'shrink-0 rounded-full px-2 py-px text-[10px] font-medium',
                badge === 'Oculto' ? 'bg-surface-3 text-subtle' : 'bg-accent/15 text-accent-soft',
              )}
            >
              {badge}
            </span>
          ))}
        </span>
        {meta.subtitle && <span className="block truncate text-xs text-subtle">{meta.subtitle}</span>}
      </button>

      <div className="flex shrink-0 items-center gap-0.5">
        {config.toggle && (
          <IconButton label={toggled ? 'Ocultar del sitio' : 'Publicar'} onClick={onToggle}>
            {toggled ? <Eye /> : <EyeOff />}
          </IconButton>
        )}
        <IconButton label="Editar" onClick={onEdit}>
          <Pencil />
        </IconButton>
        <IconButton label="Eliminar" onClick={() => setConfirming(true)} danger>
          <Trash2 />
        </IconButton>
      </div>

      {/* Confirmación superpuesta: no cambia el ancho ni la altura de la fila. */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="absolute inset-y-1.5 right-1.5 flex items-center gap-2 rounded-lg border border-line-strong bg-surface-3 pr-1.5 pl-3"
          >
            <span className="text-xs text-muted">¿Eliminar?</span>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)} autoFocus>
              Cancelar
            </Button>
            <Button size="sm" variant="danger" onClick={onDelete}>
              Eliminar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  )
}

function IconButton({ label, onClick, danger, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'grid size-8 place-items-center rounded-md text-subtle transition-colors [&_svg]:size-4',
        danger ? 'hover:bg-danger/10 hover:text-danger' : 'hover:bg-white/5 hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

function EmptyState({ config, onCreate }) {
  const Icon = config.icon
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
      <span className="grid size-11 place-items-center rounded-xl bg-accent/10 text-accent-soft ring-1 ring-accent/20">
        <Icon className="size-5" />
      </span>
      <p className="mt-4 text-sm font-medium">Todavía no hay nada aquí</p>
      <p className="mt-1 text-xs text-subtle">Crea tu {agree(config, 'primer', 'primera')} {config.singular} para que aparezca en el portafolio.</p>
      <Button size="sm" variant="secondary" className="mt-5" onClick={onCreate}>
        <Plus /> {agree(config, 'Nuevo', 'Nueva')} {config.singular}
      </Button>
    </div>
  )
}

// ─── Panel lateral de edición ───────────────────────────────────────
function EditorDrawer({ editing, config, suggestions, onClose, onSave }) {
  useEffect(() => {
    if (!editing) return
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    const onKey = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      root.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [editing, onClose])

  return (
    <AnimatePresence>
      {editing && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%', transition: { duration: 0.25, ease: EASE_DRAWER } }}
            transition={{ duration: 0.45, ease: EASE_DRAWER }}
            className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-line-strong bg-surface shadow-2xl shadow-black/60"
          >
            <DrawerForm
              key={editing.item.id ?? 'new'}
              item={editing.item}
              config={config}
              suggestions={suggestions}
              onClose={onClose}
              onSave={onSave}
            />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

function DrawerForm({ item, config, suggestions, onClose, onSave }) {
  const [values, setValues] = useState(() => {
    const empty = config.empty(item.group)
    return Object.fromEntries(Object.keys(empty).map((key) => [key, item[key] ?? empty[key]]))
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const isNew = !item.id

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await onSave(values)
    } catch (error) {
      if (error.fields) setErrors(error.fields)
      setSaving(false)
    }
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-6">
        <h2 id="drawer-title" className="text-[15px] font-medium">
          {isNew ? `${agree(config, 'Nuevo', 'Nueva')} ${config.singular}` : `Editar ${config.singular}`}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="grid size-8 place-items-center rounded-md text-subtle transition-colors hover:bg-white/5 hover:text-ink"
        >
          <X className="size-4" />
        </button>
      </header>

      <form id="drawer-form" onSubmit={submit} className="flex-1 overflow-y-auto overscroll-contain px-6 py-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {config.fields
            .filter((field) => !field.visible || field.visible(values))
            .map((field) => (
              <FormField
                key={field.name}
                field={field}
                value={values[field.name]}
                suggestions={suggestions[field.name]}
                error={errorFor(errors, field.name)}
                onChange={(value) => {
                  setValues((current) => ({ ...current, [field.name]: value }))
                  setErrors((current) => clearError(current, field.name))
                }}
              />
            ))}
        </div>
      </form>

      <footer className="flex shrink-0 justify-end gap-2 border-t border-line px-6 py-4">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" form="drawer-form" disabled={saving}>
          {saving && <LoaderCircle className="animate-spin" />}
          {isNew ? 'Crear' : 'Guardar'}
        </Button>
      </footer>
    </>
  )
}
