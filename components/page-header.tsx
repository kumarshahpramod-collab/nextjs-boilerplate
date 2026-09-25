import type { ReactNode } from "react"

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-6 py-3.5">
      <div className="min-w-0">
        <h1 className="truncate text-[15px] font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 truncate text-xs text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}
