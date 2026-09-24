import { cn } from '../components/ui.jsx'

export function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

/** Marcadores con la misma altura que las filas reales: al cargar no hay salto. */
export function RowsSkeleton({ rows = 4, className }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex h-[62px] items-center gap-3 rounded-xl border border-line bg-surface px-3">
          <div className="size-8 rounded-md bg-surface-3" />
          <div className="h-10 w-14 rounded-md bg-surface-3" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-surface-3" />
            <div className="h-2.5 w-1/2 animate-pulse rounded bg-surface-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function FormSection({ title, description, children }) {
  return (
    <section className="grid gap-6 border-t border-line py-8 first:border-t-0 first:pt-2 lg:grid-cols-[13rem_1fr]">
      <div>
        <h2 className="text-sm font-medium">{title}</h2>
        {description && <p className="mt-1 text-xs leading-relaxed text-subtle">{description}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}
