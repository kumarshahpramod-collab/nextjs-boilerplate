"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Loader2, Zap, Table2, ArrowRight, TrendingDown } from "lucide-react"
import { useStore } from "@/lib/store"
import { buildComparison, vendorPassedQuestionnaire } from "@/lib/comparison"
import type { ComparisonCell } from "@/lib/types"
import { Badge, ConfidenceBar, FLAG_META } from "@/components/primitives"

export function ComparisonView() {
  const { rfx, vendors, parsedList, parseAll, status } = useStore()
  const [normalize, setNormalize] = useState(false)
  const [onlyCompliant, setOnlyCompliant] = useState(false)
  const anyParsing = vendors.some((v) => status[v.id] === "parsing")

  const matrix = useMemo(
    () => buildComparison(rfx, vendors, parsedList),
    [rfx, vendors, parsedList],
  )

  const shownVendors = useMemo(
    () =>
      vendors.filter((v) => {
        if (!parsedList.some((p) => p.vendorId === v.id)) return false
        if (onlyCompliant && !vendorPassedQuestionnaire(v, rfx)) return false
        return true
      }),
    [vendors, parsedList, onlyCompliant, rfx],
  )

  if (parsedList.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-surface">
          <Table2 className="size-5 text-muted-2" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Nothing to compare yet</h2>
          <p className="mt-1 max-w-xs text-[13px] text-muted">
            Parse the vendor replies to build the price matrix. Prices are joined by line
            reference and normalized for comparison.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={parseAll}
            disabled={anyParsing}
            className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-fg disabled:opacity-50"
          >
            {anyParsing ? <Loader2 className="size-3.5 animate-spin" /> : <Zap className="size-3.5" />}
            Parse all responses
          </button>
          <Link
            href="/inbox"
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-[13px] font-medium"
          >
            Open inbox <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-6 py-2.5">
        <div className="flex items-center gap-4 text-xs text-muted">
          <span>
            <span className="tnum font-medium text-foreground">{rfx.lineItems.length}</span> lines ×{" "}
            <span className="tnum font-medium text-foreground">{shownVendors.length}</span> vendors
          </span>
          <span className="flex items-center gap-1">
            <TrendingDown className="size-3.5 text-accent" /> lowest per line highlighted
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Toggle active={onlyCompliant} onClick={() => setOnlyCompliant((v) => !v)}>
            Compliant only
          </Toggle>
          <Toggle active={normalize} onClick={() => setNormalize((v) => !v)}>
            Normalize to {rfx.baselineCurrency}
          </Toggle>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-background">
        <table className="w-full border-separate border-spacing-0 text-[13px]">
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="sticky left-0 z-30 min-w-[240px] border-b border-r border-border bg-surface px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wider text-muted-2">
                Line item
              </th>
              {shownVendors.map((v) => {
                const passed = vendorPassedQuestionnaire(v, rfx)
                return (
                  <th
                    key={v.id}
                    className="min-w-[150px] border-b border-r border-border bg-surface px-3 py-2 text-left align-top"
                  >
                    <div className="truncate text-[13px] font-semibold text-foreground">
                      {v.name}
                    </div>
                    <div className="mt-1">
                      <Badge tone={passed ? "success" : "danger"}>
                        {passed ? "compliant" : "non-compliant"}
                      </Badge>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rfx.lineItems.map((li) => {
              const row = matrix.cells[li.ref]
              const prices = shownVendors
                .map((v) => row[v.id])
                .filter((c): c is ComparisonCell => !!c && c.normalizedPrice != null)
              const min =
                prices.length > 0
                  ? Math.min(...prices.map((c) => c.normalizedPrice as number))
                  : null
              return (
                <tr key={li.id} className="group">
                  <th className="sticky left-0 z-10 border-b border-r border-border bg-surface px-4 py-2 text-left align-top group-hover:bg-surface-2">
                    <div className="flex items-baseline gap-2">
                      <span className="tnum text-[12px] font-semibold text-accent">{li.ref}</span>
                    </div>
                    <div className="mt-0.5 max-w-[220px] truncate text-[12px] font-medium text-foreground">
                      {li.description}
                    </div>
                    <div className="tnum mt-0.5 text-[11px] text-muted-2">
                      {li.qty.toLocaleString()} · {li.unit}
                    </div>
                  </th>
                  {shownVendors.map((v) => {
                    const cell = row[v.id]
                    const isMin =
                      !!cell &&
                      cell.normalizedPrice != null &&
                      min != null &&
                      cell.normalizedPrice === min
                    return (
                      <PriceCell
                        key={v.id}
                        cell={cell}
                        isMin={isMin}
                        normalize={normalize}
                        baseline={rfx.baselineCurrency}
                        expectedUnit={li.unit}
                      />
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>

        <Legend baseline={rfx.baselineCurrency} />
      </div>
    </>
  )
}

function PriceCell({
  cell,
  isMin,
  normalize,
  baseline,
  expectedUnit,
}: {
  cell: ComparisonCell | undefined
  isMin: boolean
  normalize: boolean
  baseline: string
  expectedUnit: string
}) {
  if (!cell || cell.unitPrice == null) {
    return (
      <td className="border-b border-r border-border px-3 py-2 text-center align-middle text-muted-2 group-hover:bg-surface-2">
        <span className="text-[12px]">—</span>
      </td>
    )
  }

  const showFlags = cell.flags.filter((f) => f !== "missing")
  const primary = normalize
    ? `$${(cell.normalizedPrice ?? 0).toFixed(3)}`
    : cell.currency === "USD"
      ? `$${cell.unitPrice}`
      : `${cell.unitPrice}`
  const secondary = normalize
    ? `${cell.currency} ${cell.unitPrice}`
    : cell.currency !== baseline
      ? cell.currency
      : ""

  return (
    <td
      className={`border-b border-r border-border px-3 py-2 align-top ${
        isMin ? "bg-accent-soft" : "group-hover:bg-surface-2"
      }`}
    >
      <div className="flex items-baseline gap-1.5">
        <span className={`tnum text-[13px] font-semibold ${isMin ? "text-accent" : "text-foreground"}`}>
          {primary}
        </span>
        {secondary && <span className="tnum text-[11px] text-muted-2">{secondary}</span>}
        {isMin && <TrendingDown className="size-3 text-accent" />}
      </div>

      <div className="mt-1 flex flex-col gap-1">
        {cell.unit !== expectedUnit && (
          <span className="tnum text-[11px] text-warning">{cell.unit}</span>
        )}
        {cell.confidence < 0.75 && <ConfidenceBar value={cell.confidence} />}
        {showFlags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {showFlags.map((f) => (
              <Badge key={f} tone={FLAG_META[f].tone} className="uppercase tracking-wide">
                {FLAG_META[f].short}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </td>
  )
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
        active
          ? "border-transparent bg-accent text-accent-fg"
          : "border-border bg-surface text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

function Legend({ baseline }: { baseline: string }) {
  const items = [
    { tone: "warning" as const, short: FLAG_META.unit_mismatch.short, label: "Quoted in a different unit than requested" },
    { tone: "info" as const, short: FLAG_META.currency_mismatch.short, label: `Off-currency (not ${baseline})` },
    { tone: "danger" as const, short: FLAG_META.low_confidence.short, label: "Low extraction confidence — verify source" },
  ]
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border bg-surface px-6 py-3 text-[12px] text-muted">
      <span className="flex items-center gap-1.5">
        <span className="inline-block size-3 rounded bg-accent-soft ring-1 ring-accent/40" />
        Lowest per line (ranked on {baseline})
      </span>
      {items.map((it) => (
        <span key={it.short} className="flex items-center gap-1.5">
          <Badge tone={it.tone} className="uppercase tracking-wide">
            {it.short}
          </Badge>
          {it.label}
        </span>
      ))}
      <span className="text-muted-2">Flagged values are shown, never hidden or dropped.</span>
    </div>
  )
}
