import type {
  AnalystAnswer,
  CellFlag,
  ComparisonCell,
  Currency,
  ExtractedCell,
  ParsedResponse,
  Rfx,
  Vendor,
} from "./types"

// Indicative FX to USD. Used only to rank quotes across currencies; the raw
// native price and currency are always preserved and shown.
export const FX_TO_USD: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
}

export function toBaseline(
  price: number | null,
  currency: string,
  baseline: Currency,
): number | null {
  if (price == null) return null
  const rate = FX_TO_USD[currency]
  const baseRate = FX_TO_USD[baseline]
  if (!rate || !baseRate) return null
  return (price * rate) / baseRate
}

export function flagCell(
  cell: ExtractedCell,
  expectedUnit: string | null,
  baseline: Currency,
  lowConfidenceThreshold = 0.6,
): CellFlag[] {
  const flags: CellFlag[] = []
  if (cell.lineItemRef == null) flags.push("unmatched")
  if (cell.unitPrice == null) flags.push("missing")
  if (expectedUnit && cell.unit && cell.unit !== expectedUnit) flags.push("unit_mismatch")
  if (cell.currency !== baseline) flags.push("currency_mismatch")
  if (cell.confidence < lowConfidenceThreshold) flags.push("low_confidence")
  return flags
}

export interface ComparisonMatrix {
  rfx: Rfx
  vendors: Vendor[]
  /** cells[lineRef][vendorId] -> ComparisonCell (may be undefined if not quoted). */
  cells: Record<string, Record<string, ComparisonCell>>
  /** Extractions the parser could not match to any RFx line, keyed by vendorId. */
  unmatched: Record<string, ComparisonCell[]>
}

export function buildComparison(
  rfx: Rfx,
  vendors: Vendor[],
  parsed: ParsedResponse[],
): ComparisonMatrix {
  const cells: ComparisonMatrix["cells"] = {}
  const unmatched: ComparisonMatrix["unmatched"] = {}
  const unitByRef = new Map(rfx.lineItems.map((li) => [li.ref, li.unit]))

  for (const li of rfx.lineItems) cells[li.ref] = {}

  for (const pr of parsed) {
    for (const raw of pr.cells) {
      const expectedUnit = raw.lineItemRef ? unitByRef.get(raw.lineItemRef) ?? null : null
      const flags = flagCell(raw, expectedUnit, rfx.baselineCurrency)
      const cell: ComparisonCell = {
        ...raw,
        flags,
        normalizedPrice: toBaseline(raw.unitPrice, raw.currency, rfx.baselineCurrency),
      }
      if (raw.lineItemRef && cells[raw.lineItemRef]) {
        cells[raw.lineItemRef][raw.vendorId] = cell
      } else {
        ;(unmatched[raw.vendorId] ??= []).push(cell)
      }
    }
  }

  return { rfx, vendors, cells, unmatched }
}

export function vendorPassedQuestionnaire(vendor: Vendor, rfx: Rfx): boolean {
  return rfx.questionnaire
    .filter((q) => q.required)
    .every((q) => vendor.questionnaireVerdicts[q.id] === "pass")
}

// ---------------------------------------------------------------------------
// Deterministic analyst engine.
// The /api/reason stub calls this so the chat is demonstrable before an LLM is
// wired in. When you connect a model, keep these helpers as the "tools" the
// model calls, or as a verification layer over its answers.
// ---------------------------------------------------------------------------

function fmtMoney(n: number, currency = "USD"): string {
  return `${currency === "USD" ? "$" : ""}${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  })}${currency !== "USD" ? " " + currency : ""}`
}

export function cheapestPerLine(
  matrix: ComparisonMatrix,
  opts: { onlyPassed?: boolean } = {},
): AnalystAnswer {
  const { rfx, vendors } = matrix
  const eligible = new Set(
    vendors
      .filter((v) => (opts.onlyPassed ? vendorPassedQuestionnaire(v, rfx) : true))
      .map((v) => v.id),
  )
  const vendorName = new Map(vendors.map((v) => [v.id, v.name]))
  const rows: (string | number)[][] = []
  const citations: AnalystAnswer["citations"] = []

  for (const li of rfx.lineItems) {
    const row = matrix.cells[li.ref]
    let best: ComparisonCell | null = null
    for (const [vid, cell] of Object.entries(row)) {
      if (!eligible.has(vid)) continue
      if (cell.normalizedPrice == null) continue
      if (!best || cell.normalizedPrice < (best.normalizedPrice ?? Infinity)) best = cell
    }
    if (best) {
      rows.push([
        li.ref,
        vendorName.get(best.vendorId) ?? best.vendorId,
        fmtMoney(best.unitPrice ?? 0, best.currency),
        best.flags.length ? best.flags.join(", ") : "—",
      ])
      citations.push({
        vendorName: vendorName.get(best.vendorId) ?? best.vendorId,
        lineItemRef: li.ref,
        snippet: best.sourceSnippet,
      })
    } else {
      rows.push([li.ref, "— no eligible quote —", "—", "—"])
    }
  }

  return {
    answer: `Cheapest eligible quote per line${
      opts.onlyPassed ? " (restricted to vendors that passed all required questionnaire items)" : ""
    }, ranked by price normalized to ${rfx.baselineCurrency}. Native price and currency are shown; flags note any unit or currency mismatch to verify before award.`,
    table: {
      columns: ["Line", "Cheapest vendor", "Native price", "Flags"],
      rows,
    },
    citations: citations.slice(0, 8),
    stub: true,
  }
}

export function basketTotals(matrix: ComparisonMatrix): AnalystAnswer {
  const { rfx, vendors } = matrix
  const rows: (string | number)[][] = []
  for (const v of vendors) {
    let total = 0
    let lines = 0
    for (const li of rfx.lineItems) {
      const cell = matrix.cells[li.ref]?.[v.id]
      if (cell?.normalizedPrice != null) {
        total += cell.normalizedPrice * li.qty
        lines += 1
      }
    }
    rows.push([
      v.name,
      `${lines}/${rfx.lineItems.length}`,
      fmtMoney(total, rfx.baselineCurrency),
      vendorPassedQuestionnaire(v, rfx) ? "pass" : "fail",
    ])
  }
  rows.sort((a, b) => {
    const pa = Number(String(a[2]).replace(/[^0-9.]/g, ""))
    const pb = Number(String(b[2]).replace(/[^0-9.]/g, ""))
    return pa - pb
  })
  return {
    answer: `Estimated annualized basket cost per vendor (unit price × RFx quantity, normalized to ${rfx.baselineCurrency}). Coverage shows how many of the 30 lines each vendor quoted — totals are not directly comparable when coverage differs.`,
    table: { columns: ["Vendor", "Lines quoted", "Est. basket", "Questionnaire"], rows },
    citations: [],
    stub: true,
  }
}

export function questionnaireSummary(matrix: ComparisonMatrix): AnalystAnswer {
  const { rfx, vendors } = matrix
  const rows = vendors.map((v) => {
    const failed = rfx.questionnaire
      .filter((q) => q.required && v.questionnaireVerdicts[q.id] !== "pass")
      .map((q) => q.id.toUpperCase())
    return [
      v.name,
      vendorPassedQuestionnaire(v, rfx) ? "PASS" : "FAIL",
      failed.length ? failed.join(", ") : "—",
    ]
  })
  return {
    answer:
      "Compliance against required questionnaire items. A vendor passes only if every required item is a full pass; partial or failed required items block compliance.",
    table: { columns: ["Vendor", "Required items", "Failed required"], rows },
    citations: vendors.map((v) => ({
      vendorName: v.name,
      lineItemRef: null,
      snippet: Object.values(v.questionnaireAnswers)[0] ?? "",
    })),
    stub: true,
  }
}

export function flaggedCells(matrix: ComparisonMatrix): AnalystAnswer {
  const { vendors } = matrix
  const vendorName = new Map(vendors.map((v) => [v.id, v.name]))
  const rows: (string | number)[][] = []
  for (const [ref, row] of Object.entries(matrix.cells)) {
    for (const cell of Object.values(row)) {
      if (cell.flags.length) {
        rows.push([
          ref,
          vendorName.get(cell.vendorId) ?? cell.vendorId,
          fmtMoney(cell.unitPrice ?? 0, cell.currency),
          cell.unit,
          `${Math.round(cell.confidence * 100)}%`,
          cell.flags.join(", "),
        ])
      }
    }
  }
  return {
    answer: `Found ${rows.length} extraction(s) that need review before award — unit mismatches, off-currency quotes, and low-confidence reads. None are dropped; each is listed with its confidence so you can decide.`,
    table: {
      columns: ["Line", "Vendor", "Native price", "Unit", "Confidence", "Flags"],
      rows,
    },
    citations: [],
    stub: true,
  }
}

/**
 * Very small intent router for the stub. A real model would replace this with
 * tool-calling over the same helper functions.
 */
export function answerQuestion(matrix: ComparisonMatrix, question: string): AnalystAnswer {
  const q = question.toLowerCase()
  const onlyPassed = /pass|complian|qualif|eligible|questionnaire/.test(q)

  if (/cheap|lowest|best price|per line|per-line/.test(q)) {
    return cheapestPerLine(matrix, { onlyPassed })
  }
  if (/basket|total|annual|overall cost|spend|who is cheapest overall/.test(q)) {
    return basketTotals(matrix)
  }
  if (/questionnaire|complian|pass|fail|certif|iso|fsc/.test(q)) {
    return questionnaireSummary(matrix)
  }
  if (/flag|mismatch|confidence|risk|review|currency|unit/.test(q)) {
    return flaggedCells(matrix)
  }

  // Fallback: give an overview so the panel is never empty.
  const overview = basketTotals(matrix)
  return {
    ...overview,
    answer: `I ran a deterministic overview (the reasoning model is not wired up yet). Try: "cheapest per line among vendors who passed the questionnaire", "estimated basket total per vendor", "which vendors failed the questionnaire", or "show all flagged extractions".\n\n${overview.answer}`,
  }
}
