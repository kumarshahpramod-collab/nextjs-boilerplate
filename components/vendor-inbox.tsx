"use client"

import { useMemo, useState } from "react"
import {
  Mail,
  FileText,
  Table2,
  FileSpreadsheet,
  ScanLine,
  Loader2,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MinusCircle,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { VENDOR_FORMAT_LABEL } from "@/lib/mock-data"
import { flagCell, vendorPassedQuestionnaire } from "@/lib/comparison"
import type { QuestionnaireVerdict, Vendor, VendorFormat } from "@/lib/types"
import { Badge, ConfidenceBar, FLAG_META, SectionLabel } from "@/components/primitives"

const FORMAT_ICON: Record<VendorFormat, typeof Mail> = {
  structured_table: Table2,
  pdf_text: FileText,
  email_freetext: Mail,
  spreadsheet_csv: FileSpreadsheet,
  scanned_notes: ScanLine,
}

const VERDICT_META: Record<
  QuestionnaireVerdict,
  { icon: typeof CheckCircle2; tone: "success" | "warning" | "danger"; label: string }
> = {
  pass: { icon: CheckCircle2, tone: "success", label: "Pass" },
  partial: { icon: AlertTriangle, tone: "warning", label: "Partial" },
  fail: { icon: XCircle, tone: "danger", label: "Fail" },
}

function timeAgo(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function VendorInbox() {
  const { vendors, rfx, parsed, status, parseVendor, parseAll } = useStore()
  const [selectedId, setSelectedId] = useState<string>(vendors[0].id)
  const selected = vendors.find((v) => v.id === selectedId)!
  const allParsed = vendors.every((v) => parsed[v.id])
  const anyParsing = vendors.some((v) => status[v.id] === "parsing")

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-2.5">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="tnum font-medium text-foreground">
            {Object.keys(parsed).length}/{vendors.length}
          </span>
          responses parsed into the common schema
        </div>
        <button
          onClick={parseAll}
          disabled={allParsed || anyParsing}
          className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-fg transition-opacity disabled:opacity-40"
        >
          {anyParsing ? <Loader2 className="size-3.5 animate-spin" /> : <Zap className="size-3.5" />}
          {allParsed ? "All parsed" : "Parse all responses"}
        </button>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Vendor list */}
        <div className="flex w-[300px] shrink-0 flex-col overflow-y-auto border-r border-border bg-surface">
          {vendors.map((v) => {
            const Icon = FORMAT_ICON[v.format]
            const st = status[v.id] ?? "idle"
            const isParsed = !!parsed[v.id]
            const passed = vendorPassedQuestionnaire(v, rfx)
            return (
              <button
                key={v.id}
                onClick={() => setSelectedId(v.id)}
                className={`flex flex-col gap-1.5 border-b border-border px-4 py-3 text-left transition-colors ${
                  selectedId === v.id ? "bg-accent-soft" : "hover:bg-surface-2"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-4 shrink-0 text-muted-2" />
                  <span className="flex-1 truncate text-[13px] font-medium">{v.name}</span>
                  {st === "parsing" ? (
                    <Loader2 className="size-3.5 animate-spin text-accent" />
                  ) : isParsed ? (
                    <CheckCircle2 className="size-3.5 text-success" />
                  ) : (
                    <MinusCircle className="size-3.5 text-muted-2" />
                  )}
                </div>
                <div className="truncate pl-6 text-[12px] text-muted">{v.subject}</div>
                <div className="flex items-center gap-2 pl-6">
                  <Badge>{VENDOR_FORMAT_LABEL[v.format]}</Badge>
                  <Badge tone={passed ? "success" : "danger"}>
                    {passed ? "compliant" : "non-compliant"}
                  </Badge>
                </div>
              </button>
            )
          })}
        </div>

        {/* Detail */}
        <div className="min-w-0 flex-1 overflow-y-auto bg-background">
          <VendorDetail
            key={selected.id}
            vendor={selected}
            parsed={!!parsed[selected.id]}
            parsing={status[selected.id] === "parsing"}
            onParse={() => parseVendor(selected.id)}
          />
        </div>
      </div>
    </>
  )
}

function VendorDetail({
  vendor,
  parsed,
  parsing,
  onParse,
}: {
  vendor: Vendor
  parsed: boolean
  parsing: boolean
  onParse: () => void
}) {
  const { rfx, parsed: allParsed } = useStore()
  const Icon = FORMAT_ICON[vendor.format]

  const cells = useMemo(() => {
    const pr = allParsed[vendor.id]
    if (!pr) return []
    const unitByRef = new Map(rfx.lineItems.map((li) => [li.ref, li.unit]))
    return pr.cells.map((c) => ({
      ...c,
      flags: flagCell(c, c.lineItemRef ? unitByRef.get(c.lineItemRef) ?? null : null, rfx.baselineCurrency),
    }))
  }, [allParsed, vendor.id, rfx])

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight">{vendor.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Icon className="size-3.5" /> {VENDOR_FORMAT_LABEL[vendor.format]}
            </span>
            <span>·</span>
            <span>{vendor.contact}</span>
            <span>·</span>
            <span>{timeAgo(vendor.receivedAt)}</span>
          </div>
        </div>
        {!parsed && (
          <button
            onClick={onParse}
            disabled={parsing}
            className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-fg transition-opacity disabled:opacity-60"
          >
            {parsing ? <Loader2 className="size-3.5 animate-spin" /> : <Zap className="size-3.5" />}
            {parsing ? "Parsing…" : "Parse response"}
          </button>
        )}
      </div>

      {/* Raw reply */}
      <div className="rounded-lg border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <SectionLabel>Raw reply — {VENDOR_FORMAT_LABEL[vendor.format]}</SectionLabel>
          <span className="text-[11px] text-muted-2">as received</span>
        </div>
        <pre className="tnum overflow-x-auto whitespace-pre-wrap p-4 text-[12px] leading-relaxed text-foreground/85">
          {vendor.rawContent}
        </pre>
      </div>

      {/* Questionnaire */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <SectionLabel>Questionnaire responses</SectionLabel>
        <ul className="mt-3 space-y-3">
          {rfx.questionnaire.map((q) => {
            const verdict = vendor.questionnaireVerdicts[q.id] ?? "fail"
            const meta = VERDICT_META[verdict]
            const VIcon = meta.icon
            return (
              <li key={q.id} className="flex gap-2.5 text-[13px]">
                <VIcon
                  className={`mt-0.5 size-4 shrink-0 ${
                    meta.tone === "success"
                      ? "text-success"
                      : meta.tone === "warning"
                        ? "text-warning"
                        : "text-danger"
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{q.question}</span>
                    {q.required && <Badge tone="warning">required</Badge>}
                  </div>
                  <div className="mt-0.5 text-muted">{vendor.questionnaireAnswers[q.id]}</div>
                </div>
                <Badge tone={meta.tone}>{meta.label}</Badge>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Extraction */}
      {parsed ? (
        <div className="rounded-lg border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <SectionLabel>Extracted → common schema</SectionLabel>
            <span className="tnum text-[11px] text-muted-2">{cells.length} rows</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-surface-2 text-left text-[11px] uppercase tracking-wider text-muted-2">
                  <th className="px-4 py-2 font-medium">Ref</th>
                  <th className="px-2 py-2 font-medium">Line</th>
                  <th className="px-2 py-2 text-right font-medium">Price</th>
                  <th className="px-2 py-2 font-medium">Cur</th>
                  <th className="px-2 py-2 font-medium">Unit</th>
                  <th className="px-2 py-2 font-medium">Conf.</th>
                  <th className="px-4 py-2 font-medium">Flags</th>
                </tr>
              </thead>
              <tbody>
                {cells.map((c, i) => (
                  <tr key={i} className="border-t border-border align-top hover:bg-surface-2">
                    <td className="tnum px-4 py-2 font-medium">
                      {c.lineItemRef ?? <span className="text-warning">?</span>}
                    </td>
                    <td className="px-2 py-2 text-muted">{c.vendorLineLabel}</td>
                    <td className="tnum px-2 py-2 text-right">
                      {c.unitPrice != null ? c.unitPrice : "—"}
                    </td>
                    <td className="px-2 py-2">{c.currency}</td>
                    <td className="px-2 py-2 text-muted">{c.unit}</td>
                    <td className="px-2 py-2">
                      <ConfidenceBar value={c.confidence} />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {c.flags.length ? (
                          c.flags.map((f) => (
                            <Badge key={f} tone={FLAG_META[f].tone}>
                              {FLAG_META[f].label}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-2">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border-strong bg-surface-2 p-6 text-center">
          <p className="text-[13px] text-muted">
            This reply is in <span className="font-medium text-foreground">{VENDOR_FORMAT_LABEL[vendor.format]}</span>{" "}
            format. Parse it to normalize every line into{" "}
            <code className="tnum rounded bg-surface px-1 py-0.5 text-[11px]">
              {"{ vendor, line_item, unit_price, currency, unit, confidence, source_snippet }"}
            </code>
            .
          </p>
        </div>
      )}
    </div>
  )
}
