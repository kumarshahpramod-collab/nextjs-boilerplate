import type { ReactNode } from "react"
import type { CellFlag } from "@/lib/types"

type Tone = "neutral" | "accent" | "success" | "warning" | "danger" | "info"

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted border-border",
  accent: "bg-accent-soft text-accent border-transparent",
  success: "bg-success-soft text-success border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  info: "bg-info-soft text-info border-transparent",
}

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-none ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function Dot({ tone = "neutral" }: { tone?: Tone }) {
  const bg: Record<Tone, string> = {
    neutral: "bg-muted-2",
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
  }
  return <span className={`inline-block size-1.5 rounded-full ${bg[tone]}`} />
}

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const tone = value >= 0.75 ? "bg-success" : value >= 0.6 ? "bg-warning" : "bg-danger"
  return (
    <span className="inline-flex items-center gap-1.5" title={`Extraction confidence ${pct}%`}>
      <span className="relative h-1 w-8 overflow-hidden rounded-full bg-border">
        <span className={`absolute inset-y-0 left-0 ${tone}`} style={{ width: `${pct}%` }} />
      </span>
      <span className="tnum text-[10px] text-muted-2">{pct}%</span>
    </span>
  )
}

export const FLAG_META: Record<CellFlag, { label: string; tone: Tone; short: string }> = {
  unit_mismatch: { label: "Unit mismatch", tone: "warning", short: "unit" },
  currency_mismatch: { label: "Off-currency", tone: "info", short: "fx" },
  low_confidence: { label: "Low confidence", tone: "danger", short: "conf" },
  unmatched: { label: "Unmatched line", tone: "warning", short: "?" },
  missing: { label: "No quote", tone: "neutral", short: "—" },
}

export function FlagBadge({ flag }: { flag: CellFlag }) {
  const m = FLAG_META[flag]
  return (
    <Badge tone={m.tone} className="uppercase tracking-wide">
      {m.short}
    </Badge>
  )
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-lg border border-border bg-surface ${className}`}>{children}</div>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-2">
      {children}
    </div>
  )
}
