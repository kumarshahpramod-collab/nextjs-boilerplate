import type {
  ExtractedCell,
  QuestionnaireItem,
  Rfx,
  RfxLineItem,
  Vendor,
} from "./types"

// ---------------------------------------------------------------------------
// RFx line items — corrugated packaging category, 30 lines.
// `base` is an internal reference price only used to synthesize vendor quotes;
// buyers never set price on an RFx.
// ---------------------------------------------------------------------------
const RAW_LINES: Array<Omit<RfxLineItem, "id"> & { base: number }> = [
  { ref: "CP-001", description: "RSC shipping box 12x9x6 in", spec: "32 ECT, single wall, kraft", qty: 20000, unit: "per case", base: 0.62 },
  { ref: "CP-002", description: "RSC shipping box 16x12x8 in", spec: "32 ECT, single wall, kraft", qty: 15000, unit: "per case", base: 0.94 },
  { ref: "CP-003", description: "RSC shipping box 18x14x10 in", spec: "44 ECT, single wall, kraft", qty: 12000, unit: "per case", base: 1.28 },
  { ref: "CP-004", description: "RSC shipping box 24x18x12 in", spec: "48 ECT, double wall, kraft", qty: 8000, unit: "per case", base: 2.15 },
  { ref: "CP-005", description: "Die-cut mailer 10x8x2 in", spec: "White exterior, E-flute", qty: 25000, unit: "per case", base: 0.41 },
  { ref: "CP-006", description: "Die-cut mailer 12x9x3 in", spec: "Kraft, E-flute, tuck-in", qty: 22000, unit: "per case", base: 0.55 },
  { ref: "CP-007", description: "Corrugated pad 12x12 in", spec: "Single wall, C-flute", qty: 40000, unit: "per 1000", base: 118 },
  { ref: "CP-008", description: "Corrugated pad 18x18 in", spec: "Double wall, BC-flute", qty: 30000, unit: "per 1000", base: 214 },
  { ref: "CP-009", description: "Pallet tier sheet 48x40 in", spec: "Single wall, C-flute", qty: 18000, unit: "per 1000", base: 268 },
  { ref: "CP-010", description: "Full overlap box 20x20x20 in", spec: "51 ECT, double wall", qty: 6000, unit: "per case", base: 2.72 },
  { ref: "CP-011", description: "Half slotted container 15x15x15 in", spec: "44 ECT, single wall", qty: 9000, unit: "per case", base: 1.46 },
  { ref: "CP-012", description: "Bin box 6x4x4 in", spec: "200# test, kraft", qty: 50000, unit: "per case", base: 0.22 },
  { ref: "CP-013", description: "Telescoping box lid + base 22x18x8 in", spec: "48 ECT, double wall", qty: 5000, unit: "per set", base: 3.35 },
  { ref: "CP-014", description: "Corrugated partition 12-cell 12x9x6", spec: "Chipboard-lined dividers", qty: 11000, unit: "per set", base: 0.78 },
  { ref: "CP-015", description: "Book wrap mailer 15x11x3 in", spec: "E-flute, self-locking", qty: 16000, unit: "per case", base: 0.63 },
  { ref: "CP-016", description: "Heavy duty export box 30x20x20 in", spec: "Triple wall, 82 ECT", qty: 3000, unit: "per case", base: 6.10 },
  { ref: "CP-017", description: "Single-face corrugated roll 48 in x 250 ft", spec: "B-flute, kraft", qty: 2500, unit: "per roll", base: 21.5 },
  { ref: "CP-018", description: "Kraft RSC 14x10x4 in", spec: "32 ECT, single wall", qty: 26000, unit: "per case", base: 0.58 },
  { ref: "CP-019", description: "White RSC 14x10x4 in", spec: "32 ECT, mottled white", qty: 20000, unit: "per case", base: 0.71 },
  { ref: "CP-020", description: "Edge protector / corner board 48 in", spec: "0.160 in, L-profile", qty: 35000, unit: "per 1000", base: 92 },
  { ref: "CP-021", description: "Corrugated sheet blank 40x48 in", spec: "Double wall, BC-flute", qty: 14000, unit: "per 1000", base: 312 },
  { ref: "CP-022", description: "Pallet box / gaylord 40x48x36 in", spec: "Triple wall bulk bin", qty: 2000, unit: "per case", base: 9.85 },
  { ref: "CP-023", description: "Retail shelf-ready tray 400x300x120 mm", spec: "Litho-laminated, printed", qty: 12000, unit: "per case", base: 0.88 },
  { ref: "CP-024", description: "E-flute mailer 9x6x2 in", spec: "White, peel-and-seal strip", qty: 30000, unit: "per case", base: 0.38 },
  { ref: "CP-025", description: "Corrugated drawer insert 16x12 in", spec: "Die-cut, 4-compartment", qty: 9000, unit: "per set", base: 0.94 },
  { ref: "CP-026", description: "Wardrobe moving box 24x21x46 in", spec: "48 ECT with metal bar", qty: 4000, unit: "per case", base: 4.45 },
  { ref: "CP-027", description: "Corrugated mailing tube 3 in x 36 in", spec: "Spiral wound, kraft", qty: 15000, unit: "per case", base: 1.12 },
  { ref: "CP-028", description: "Perforated tear-strip box 12x10x4 in", spec: "32 ECT, easy-open", qty: 17000, unit: "per case", base: 0.69 },
  { ref: "CP-029", description: "Honeycomb panel 48x40x1 in", spec: "Kraft faced, structural", qty: 6000, unit: "per case", base: 3.05 },
  { ref: "CP-030", description: "Custom printed RSC 16x12x8 in", spec: "32 ECT, 2-color flexo", qty: 18000, unit: "per case", base: 1.15 },
]

export const RFX_LINE_ITEMS: RfxLineItem[] = RAW_LINES.map((l, i) => ({
  id: `li-${i + 1}`,
  ref: l.ref,
  description: l.description,
  spec: l.spec,
  qty: l.qty,
  unit: l.unit,
}))

const BASE_PRICE: Record<string, number> = Object.fromEntries(
  RAW_LINES.map((l) => [l.ref, l.base]),
)

export const QUESTIONNAIRE: QuestionnaireItem[] = [
  { id: "q1", question: "Is all corrugated stock FSC or SFI chain-of-custody certified?", required: true },
  { id: "q2", question: "What is the average post-consumer recycled content (%)?", required: false },
  { id: "q3", question: "Standard lead time for catalog SKUs (business days)?", required: true },
  { id: "q4", question: "Is your primary converting facility ISO 9001 certified?", required: true },
  { id: "q5", question: "Can you hold 30 days of consignment inventory for top SKUs?", required: false },
  { id: "q6", question: "What is the minimum order quantity per SKU?", required: false },
]

export const RFX: Rfx = {
  id: "rfx-2026-cp-114",
  title: "Corrugated Packaging — North America DC Network FY26",
  category: "Corrugated Packaging",
  scope:
    "Competitive RFx for a rolling 12-month supply of corrugated packaging across five North American distribution centers. Awarded suppliers must support EDI ordering, palletized delivery to DC docks, and quarterly business reviews. Estimated annualized spend $3.8M across 30 active SKUs.",
  lineItems: RFX_LINE_ITEMS,
  questionnaire: QUESTIONNAIRE,
  commercialTerms: [
    "Payment terms: Net 45 from date of delivery.",
    "Pricing firm for 12 months; no surcharges without 60-day written notice.",
    "All prices quoted in USD, delivered duty paid (DDP) to each DC.",
    "Freight and fuel surcharges included in unit pricing.",
    "Volume rebate of 2% on annual spend above $500,000 per supplier.",
  ],
  baselineCurrency: "USD",
  createdAt: "2026-09-10T14:00:00.000Z",
}

// ---------------------------------------------------------------------------
// Vendors — five replies in deliberately different formats.
// ---------------------------------------------------------------------------
export const VENDORS: Vendor[] = [
  {
    id: "v-meridian",
    name: "Meridian Packaging Co.",
    format: "structured_table",
    contact: "bids@meridianpkg.com",
    receivedAt: "2026-09-18T09:12:00.000Z",
    subject: "RE: RFX-2026-CP-114 — Meridian response (attached pricing grid)",
    questionnaireAnswers: {
      q1: "Yes — 100% FSC Mix certified, COC number FSC-C104520.",
      q2: "Average 43% post-consumer recycled content.",
      q3: "5 business days for catalog SKUs, 10 for printed.",
      q4: "Yes — ISO 9001:2015, cert #US-91442.",
      q5: "Yes, consignment available for top 12 SKUs.",
      q6: "MOQ 1 case for stock, 2,000 for custom print.",
    },
    questionnaireVerdicts: { q1: "pass", q2: "pass", q3: "pass", q4: "pass", q5: "pass", q6: "pass" },
    rawContent: `VENDOR: Meridian Packaging Co.
QUOTE REF: MPQ-55831 | VALID 90 DAYS | CURRENCY: USD | TERMS: Net 45 DDP

| Item Ref | Description                     | Unit     | Unit Price |
|----------|---------------------------------|----------|------------|
| CP-001   | RSC 12x9x6 32ECT                | per case | 0.61       |
| CP-002   | RSC 16x12x8 32ECT               | per case | 0.92       |
| CP-003   | RSC 18x14x10 44ECT              | per case | 1.24       |
| CP-004   | RSC 24x18x12 48ECT DW           | per case | 2.09       |
| CP-005   | Die-cut mailer 10x8x2 white     | per case | 0.40       |
| ...      | (full 30-line grid attached)    |          |            |

All lines quoted DDP, freight included. FSC + ISO 9001 certificates attached.`,
  },
  {
    id: "v-baltic",
    name: "Baltic Board Solutions",
    format: "email_freetext",
    contact: "sales@balticboard.eu",
    receivedAt: "2026-09-19T16:40:00.000Z",
    subject: "Our offer for your packaging tender",
    questionnaireAnswers: {
      q1: "FSC certified for kraft grades; white grades pending audit.",
      q2: "Typically 60-70% recycled fibre.",
      q3: "Around 3 weeks door-to-door incl. ocean freight.",
      q4: "ISO 9001 yes, ISO 14001 in progress.",
      q5: "Consignment not offered from EU.",
      q6: "MOQ one pallet per SKU.",
    },
    questionnaireVerdicts: { q1: "partial", q2: "pass", q3: "partial", q4: "pass", q5: "fail", q6: "pass" },
    rawContent: `Dear Buyer,

Thank you for the opportunity. Please find our indicative pricing below. All prices
are EUR per piece, EXW our Gdansk plant (freight quoted separately on request).

- 12x9x6 RSC box — €0.54 each
- 16x12x8 RSC box — €0.81 each
- 18x14x10 box — €1.09 each
- white die-cut mailer 10x8 — €0.36
- corrugated pad 12x12 — €0.11 each (note: priced per piece, not per 1000)
- pallet tier sheets 48x40 — €0.24 each
- ... remaining items in the body of this email ...

We are FSC certified on kraft. Lead time approx 3 weeks including ocean freight.
Best regards, Baltic Board Solutions`,
  },
  {
    id: "v-summit",
    name: "Summit Corrugated Inc.",
    format: "pdf_text",
    contact: "estimating@summitcorr.com",
    receivedAt: "2026-09-20T11:05:00.000Z",
    subject: "Summit Corrugated — Proposal (PDF)",
    questionnaireAnswers: {
      q1: "SFI certified sourcing across all board grades.",
      q2: "38% average recycled content.",
      q3: "7 business days standard.",
      q4: "ISO 9001:2015 certified (Memphis + Reno plants).",
      q5: "Consignment available on request for high-volume lines.",
      q6: "MOQ 5 cases stock; 3,000 custom.",
    },
    questionnaireVerdicts: { q1: "pass", q2: "pass", q3: "pass", q4: "pass", q5: "pass", q6: "pass" },
    rawContent: `SUMMIT CORRUGATED INC.  —  PROPOSAL 2026-Q3
(text extracted from PDF)

Pricing is USD. Where noted, certain small components are quoted per thousand (M).

CP-001  RSC 12x9x6 ................ $0.60 / case
CP-002  RSC 16x12x8 ............... $0.90 / case
CP-007  Pad 12x12 ................. $121.00 / M      <-- per 1000
CP-012  Bin box 6x4x4 ............. $215.00 / M      <-- quoted per 1000, RFx asked per case
CP-016  Export box 30x20x20 ....... $5.95 / case
CP-020  Edge protector 48in ....... $0.089 / each    <-- per each, RFx asked per 1000
... (remaining lines follow the same layout) ...

SFI certified. ISO 9001 Memphis & Reno. Lead time 7 business days.`,
  },
  {
    id: "v-trilateral",
    name: "Trilateral Fibre Ltd.",
    format: "spreadsheet_csv",
    contact: "tenders@trilateralfibre.co.uk",
    receivedAt: "2026-09-21T08:22:00.000Z",
    subject: "RFX-2026-CP-114 pricing.csv",
    questionnaireAnswers: {
      q1: "FSC Recycled certified.",
      q2: "85% recycled content.",
      q3: "10-12 working days from UK.",
      q4: "No — ISO 9001 certification lapsed, renewal expected Q1.",
      q5: "No.",
      q6: "MOQ 500 units.",
    },
    questionnaireVerdicts: { q1: "pass", q2: "pass", q3: "partial", q4: "fail", q5: "fail", q6: "pass" },
    rawContent: `ref,description,price_gbp,uom
CP-001,RSC 12x9x6,0.49,case
CP-002,RSC 16x12x8,0.74,case
CP-003,RSC 18x14x10,1.02,case
CP-004,RSC 24x18x12 DW,1.71,case
CP-008,Pad 18x18 DW,0.19,each
CP-021,Sheet blank 40x48,0.27,each
CP-030,Printed RSC 16x12x8,0.91,case
# note: prices GBP ex-works Leeds; ISO9001 currently lapsed
# some rows OCR-imported, verify CP-013 and CP-026`,
  },
  {
    id: "v-quickbox",
    name: "QuickBox Supply",
    format: "scanned_notes",
    contact: "orders@quickboxsupply.com",
    receivedAt: "2026-09-22T19:55:00.000Z",
    subject: "quote (scan)",
    questionnaireAnswers: {
      q1: "Not certified / unsure.",
      q2: "Did not state.",
      q3: "\"usually a few days\"",
      q4: "Did not state.",
      q5: "No.",
      q6: "No minimum.",
    },
    questionnaireVerdicts: { q1: "fail", q2: "fail", q3: "partial", q4: "fail", q5: "fail", q6: "pass" },
    rawContent: `[scanned handwritten note — OCR, low quality]

QuickBox quote:
12x9x6 box ...... .58 ea (case?)
16x12x8 ......... ~.88
mailer 10x8 ..... .39
big export box .. 6ish??  (illegible)
"pad 12x12 - call for price"
tubes 3x36 ...... 1.05
--- rest of sheet unreadable ---
no cert info. cash/check pref. "can ship quick"`,
  },
]

// ---------------------------------------------------------------------------
// Canned extractions.
// This is what the /api/extract stub returns per vendor. When you wire a real
// LLM, replace the body of the extract route with a model call that produces
// this same ExtractedCell[] shape from Vendor.rawContent.
// ---------------------------------------------------------------------------

interface VendorExtractionProfile {
  currency: string
  /** Multiplier applied to BASE_PRICE to synthesize this vendor's number. */
  priceFactor: number
  /** Baseline parser confidence for clean lines. */
  baseConfidence: number
  /** Refs this vendor did not quote at all. */
  missing?: string[]
  /** Refs quoted in a different unit than the RFx asked for. */
  unitOverride?: Record<string, string>
  /** Refs the parser flagged as shaky (low confidence). */
  lowConfidence?: Record<string, number>
  /** Fabricated lines the parser could not match to any RFx ref. */
  unmatched?: Array<{ label: string; price: number; unit: string; confidence: number; snippet: string }>
  /** Optional per-ref price override (native currency) for authored quirks. */
  priceOverride?: Record<string, number>
}

const PROFILES: Record<string, VendorExtractionProfile> = {
  "v-meridian": {
    currency: "USD",
    priceFactor: 0.975,
    baseConfidence: 0.97,
  },
  "v-baltic": {
    currency: "EUR",
    priceFactor: 0.86,
    baseConfidence: 0.82,
    // Baltic quoted pads/sheets/tier-sheets per piece instead of per 1000.
    unitOverride: {
      "CP-007": "per piece",
      "CP-008": "per piece",
      "CP-009": "per piece",
      "CP-020": "per piece",
      "CP-021": "per piece",
    },
    priceOverride: {
      "CP-007": 0.11,
      "CP-008": 0.2,
      "CP-009": 0.24,
      "CP-020": 0.089,
      "CP-021": 0.29,
    },
    lowConfidence: { "CP-023": 0.44, "CP-030": 0.51 },
    missing: ["CP-013", "CP-025", "CP-029"],
  },
  "v-summit": {
    currency: "USD",
    priceFactor: 0.965,
    baseConfidence: 0.94,
    unitOverride: {
      "CP-012": "per 1000",
      "CP-020": "per piece",
    },
    priceOverride: {
      "CP-012": 215,
      "CP-020": 0.089,
    },
    lowConfidence: { "CP-026": 0.55 },
    missing: ["CP-017"],
  },
  "v-trilateral": {
    currency: "GBP",
    priceFactor: 0.8,
    baseConfidence: 0.88,
    unitOverride: {
      "CP-008": "per piece",
      "CP-021": "per piece",
    },
    priceOverride: {
      "CP-008": 0.19,
      "CP-021": 0.27,
    },
    lowConfidence: { "CP-013": 0.38, "CP-026": 0.41 },
    missing: ["CP-014", "CP-022", "CP-027", "CP-029"],
    unmatched: [
      {
        label: "Assorted void-fill kraft (bundle)",
        price: 14.5,
        unit: "per bundle",
        confidence: 0.35,
        snippet: "extra row: void-fill kraft bundle,14.50,GBP (not in RFx)",
      },
    ],
  },
  "v-quickbox": {
    currency: "USD",
    priceFactor: 0.99,
    baseConfidence: 0.42,
    // OCR note only legible for a handful of lines.
    missing: [
      "CP-003", "CP-004", "CP-007", "CP-008", "CP-009", "CP-010", "CP-011",
      "CP-013", "CP-014", "CP-017", "CP-018", "CP-019", "CP-020", "CP-021",
      "CP-022", "CP-023", "CP-024", "CP-025", "CP-026", "CP-028", "CP-029", "CP-030",
    ],
    lowConfidence: {
      "CP-001": 0.5,
      "CP-002": 0.33,
      "CP-005": 0.47,
      "CP-016": 0.22,
      "CP-027": 0.4,
    },
    unmatched: [
      {
        label: '"big export box" (illegible size)',
        price: 6,
        unit: "unknown",
        confidence: 0.18,
        snippet: 'big export box .. 6ish??  (illegible)',
      },
    ],
  },
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000
}

function buildExtraction(vendor: Vendor): ExtractedCell[] {
  const p = PROFILES[vendor.id]
  const missing = new Set(p.missing ?? [])
  const cells: ExtractedCell[] = []

  for (const li of RFX_LINE_ITEMS) {
    if (missing.has(li.ref)) continue
    const nativePrice =
      p.priceOverride?.[li.ref] ?? round(BASE_PRICE[li.ref] * p.priceFactor)
    const unit = p.unitOverride?.[li.ref] ?? li.unit
    const confidence = p.lowConfidence?.[li.ref] ?? p.baseConfidence
    const priceLabel =
      p.currency === "USD" ? `$${nativePrice}` : `${nativePrice} ${p.currency}`
    cells.push({
      vendorId: vendor.id,
      lineItemRef: li.ref,
      vendorLineLabel: li.description,
      unitPrice: nativePrice,
      currency: p.currency,
      unit,
      confidence,
      sourceSnippet: `${li.ref} ${li.description} — ${priceLabel} ${unit}`,
    })
  }

  for (const u of p.unmatched ?? []) {
    cells.push({
      vendorId: vendor.id,
      lineItemRef: null,
      vendorLineLabel: u.label,
      unitPrice: u.price,
      currency: p.currency,
      unit: u.unit,
      confidence: u.confidence,
      sourceSnippet: u.snippet,
    })
  }

  return cells
}

/** Returns the canned extraction for a vendor — used by the /api/extract stub. */
export function getCannedExtraction(vendorId: string): ExtractedCell[] {
  const vendor = VENDORS.find((v) => v.id === vendorId)
  if (!vendor) return []
  return buildExtraction(vendor)
}

export const VENDOR_FORMAT_LABEL: Record<Vendor["format"], string> = {
  structured_table: "Structured table",
  pdf_text: "PDF text",
  email_freetext: "Email free-text",
  spreadsheet_csv: "Spreadsheet / CSV",
  scanned_notes: "Scanned notes (OCR)",
}
