// Shared domain model for the RFx comparison tool.

export type Currency = "USD" | "EUR" | "GBP"

export interface RfxLineItem {
  id: string
  /** Stable human reference, e.g. "CP-001". Used to join vendor extractions back to the RFx. */
  ref: string
  description: string
  spec: string
  qty: number
  /** The unit the buyer expects to be quoted in, e.g. "per case", "per 1000". */
  unit: string
}

export interface QuestionnaireItem {
  id: string
  question: string
  /** Whether a satisfactory answer is mandatory to be considered compliant. */
  required: boolean
}

export interface Rfx {
  id: string
  title: string
  category: string
  scope: string
  lineItems: RfxLineItem[]
  questionnaire: QuestionnaireItem[]
  commercialTerms: string[]
  /** Currency the buyer wants all quotes normalized to. */
  baselineCurrency: Currency
  createdAt: string
}

export type VendorFormat =
  | "structured_table"
  | "pdf_text"
  | "email_freetext"
  | "spreadsheet_csv"
  | "scanned_notes"

export type QuestionnaireVerdict = "pass" | "partial" | "fail"

export interface Vendor {
  id: string
  name: string
  format: VendorFormat
  contact: string
  receivedAt: string
  subject: string
  /** The reply exactly as the vendor sent it, in its native (messy) format. */
  rawContent: string
  /** Answers keyed by QuestionnaireItem.id. */
  questionnaireAnswers: Record<string, string>
  /** Per-question verdict keyed by QuestionnaireItem.id. */
  questionnaireVerdicts: Record<string, QuestionnaireVerdict>
}

export type CellFlag =
  | "unit_mismatch"
  | "currency_mismatch"
  | "low_confidence"
  | "unmatched"
  | "missing"

/** A single normalized extraction: one vendor's price for one line item. */
export interface ExtractedCell {
  vendorId: string
  /** Matched RfxLineItem.ref, or null when the parser could not confidently match. */
  lineItemRef: string | null
  /** What the vendor called this line, verbatim. */
  vendorLineLabel: string
  unitPrice: number | null
  currency: Currency | string
  unit: string
  /** Parser confidence, 0–1. Low values are surfaced, never hidden. */
  confidence: number
  /** The exact span of source text the value came from — used for citations. */
  sourceSnippet: string
}

export interface ParsedResponse {
  vendorId: string
  cells: ExtractedCell[]
  parsedAt: string
}

/** A comparison cell after normalization + flagging, ready to render. */
export interface ComparisonCell extends ExtractedCell {
  flags: CellFlag[]
  /** Price converted into the RFx baseline currency (best-effort, for ranking). */
  normalizedPrice: number | null
}

export interface AnalystCitation {
  vendorName: string
  lineItemRef: string | null
  snippet: string
}

export interface AnalystAnswer {
  answer: string
  citations: AnalystCitation[]
  /** Optional tabular result the UI can render as a mini table. */
  table?: {
    columns: string[]
    rows: (string | number)[][]
  }
  /** True when produced by the deterministic stub rather than a real model. */
  stub: boolean
}
