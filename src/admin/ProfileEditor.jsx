import { LoaderCircle, Undo2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { defaultProfile } from '../../shared/default-content.js'
import { Button } from '../components/ui.jsx'
import { api } from '../lib/api.js'
import { EASE_OUT, SPRING_SOFT } from '../lib/motion.js'
import { PROFILE_FIELD_NAMES, PROFILE_SECTIONS } from './config.js'
import { useRequest, useToast } from './context.jsx'
import { FormField, clearError, errorFor } from './fields.jsx'
import { FormSection, PageHeader } from './parts.jsx'

/** Convierte el registro de la BD en valores de formulario (null → ""). */
function toForm(profile) {
  return Object.fromEntries(
    PROFILE_FIELD_NAMES.map((name) => {
      const value = profile?.[name]
      if (Array.isArray(defaultProfile[name])) return [name, Array.isArray(value) ? value : []]
      return [name, value ?? '']
    }),
  )
}

export function ProfileEditor() {
  const run = useRequest()
  const toast = useToast()
  const [saved, setSaved] = useState(null)
  const [values, setValues] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [isNew, setIsNew] = useState(false)

  useEffect(() => {
    run(() => api.get('/admin/profile'))
      .then((profile) => {
        // BD vacía: se parte del contenido por defecto y el primer guardado crea el perfil.
        const form = toForm(profile ?? defaultProfile)
        setIsNew(!profile)
        setSaved(form)
        setValues(form)
      })
      .catch(() => {})
  }, [run])

  const dirty = values && (isNew || JSON.stringify(values) !== JSON.stringify(saved))

  useEffect(() => {
    if (!dirty) return
    const warn = (event) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const setField = (name) => (value) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => clearError(current, name))
  }

  const save = async (event) => {
    event?.preventDefault()
    setSaving(true)
    try {
      const profile = await run(() => api.put('/admin/profile', values))
      const form = toForm(profile)
      setSaved(form)
      setValues(form)
      setErrors({})
      setIsNew(false)
      toast.success('Perfil guardado')
    } catch (error) {
      if (error.fields) setErrors(error.fields)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Perfil" description="Datos generales que aparecen en todas las secciones del portafolio." />

      {!values ? (
        <div className="mt-10 grid h-64 place-items-center text-subtle">
          <LoaderCircle className="size-5 animate-spin" />
        </div>
      ) : (
        <motion.form
          onSubmit={save}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="mt-8 pb-28"
        >
          {isNew && (
            <p className="mb-6 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent-soft">
              Aún no hay perfil en la base de datos. Revisa los datos de ejemplo y pulsa Guardar para crearlo.
            </p>
          )}
          {PROFILE_SECTIONS.map((section) => (
            <FormSection key={section.title} title={section.title} description={section.description}>
              {section.fields.map((field) => (
                <FormField
                  key={field.name}
                  field={field}
                  value={values[field.name]}
                  onChange={setField(field.name)}
                  error={errorFor(errors, field.name)}
                />
              ))}
            </FormSection>
          ))}
        </motion.form>
      )}

      <SaveBar visible={Boolean(dirty)} saving={saving} onSave={save} onDiscard={() => (setValues(saved), setErrors({}))} />
    </>
  )
}

/** Barra flotante (fixed): aparece con cambios pendientes sin mover el formulario. */
function SaveBar({ visible, saving, onSave, onDiscard }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0, transition: { duration: 0.2 } }}
          transition={SPRING_SOFT}
          className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 lg:pl-64"
        >
          <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-line-strong bg-surface-2/95 py-2 pr-2 pl-4 shadow-2xl shadow-black/50 backdrop-blur">
            <span className="flex-1 text-sm text-muted">Cambios sin guardar</span>
            <Button variant="ghost" size="sm" onClick={onDiscard} disabled={saving}>
              <Undo2 /> Descartar
            </Button>
            <Button size="sm" onClick={onSave} disabled={saving}>
              {saving && <LoaderCircle className="animate-spin" />}
              Guardar
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
