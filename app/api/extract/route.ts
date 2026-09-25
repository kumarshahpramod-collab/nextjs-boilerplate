import { NextResponse } from "next/server"
import { getCannedExtraction, VENDORS } from "@/lib/mock-data"
import type { ExtractedCell } from "@/lib/types"

/**
 * POST /api/extract  — Vendor reply → normalized line-item extractions.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  STUB. Wire this to your LLM.                                            │
 * │                                                                          │
 * │  Right now this returns a canned ExtractedCell[] per vendor so the UI    │
 * │  is fully demonstrable. To make it real, replace the marked block below  │
 * │  with a model call that reads the vendor's raw reply (any format:        │
 * │  table, PDF text, email, CSV, OCR) and returns the SAME ExtractedCell[]  │
 * │  shape. Keep the response contract identical and nothing else changes.   │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Request body:  { vendorId: string, rawContent?: string }
 * Response body: { cells: ExtractedCell[] }
 *
 * Suggested real implementation (pseudo-code):
 *
 *   import { generateObject } from "ai"
 *   const vendor = VENDORS.find(v => v.id === vendorId)
 *   const { object } = await generateObject({
 *     model: "openai/gpt-4o-mini",              // via Vercel AI Gateway
 *     schema: extractedCellsSchema,             // zod schema matching ExtractedCell[]
 *     system: EXTRACTION_SYSTEM_PROMPT,         // include the RFx line-item catalog
 *     prompt: vendor.rawContent,
 *   })
 *   return NextResponse.json({ cells: object.cells })
 */
export async function POST(req: Request) {
  let vendorId = ""
  try {
    const body = (await req.json()) as { vendorId?: string }
    vendorId = body.vendorId ?? ""
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 })
  }

  const vendor = VENDORS.find((v) => v.id === vendorId)
  if (!vendor) {
    return NextResponse.json({ error: `unknown vendorId: ${vendorId}` }, { status: 404 })
  }

  // ── BEGIN STUB ──────────────────────────────────────────────────────────
  // Simulate model latency, then return the canned extraction.
  await new Promise((r) => setTimeout(r, 500 + Math.random() * 500))
  const cells: ExtractedCell[] = getCannedExtraction(vendorId)
  // ── END STUB ────────────────────────────────────────────────────────────

  return NextResponse.json({ cells })
}
