import { NextResponse } from "next/server"
import { RFX, VENDORS } from "@/lib/mock-data"
import { answerQuestion, buildComparison } from "@/lib/comparison"
import type { ParsedResponse } from "@/lib/types"

/**
 * POST /api/reason — free-text analyst question → computed, cited answer.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  STUB. Wire this to your LLM.                                            │
 * │                                                                          │
 * │  Today this routes the question through a small deterministic engine     │
 * │  (lib/comparison.ts) so answers are real, computed, and cited without a  │
 * │  model. To make it real, treat those functions as TOOLS the model calls  │
 * │  — cheapestPerLine, basketTotals, questionnaireSummary, flaggedCells —   │
 * │  so every figure the model reports is backed by a deterministic          │
 * │  computation over the parsed comparison matrix (no hallucinated prices). │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Request body:  { question: string, parsed: ParsedResponse[] }
 * Response body: AnalystAnswer  ({ answer, table?, citations, stub })
 *
 * Suggested real implementation (pseudo-code):
 *
 *   import { generateText, tool } from "ai"
 *   const matrix = buildComparison(RFX, VENDORS, parsed)
 *   const { text, toolResults } = await generateText({
 *     model: "openai/gpt-4o",                 // via Vercel AI Gateway
 *     system: ANALYST_SYSTEM_PROMPT,
 *     prompt: question,
 *     tools: {
 *       cheapestPerLine: tool({ ..., execute: (a) => cheapestPerLine(matrix, a) }),
 *       basketTotals:    tool({ ..., execute: ()  => basketTotals(matrix) }),
 *       questionnaire:   tool({ ..., execute: ()  => questionnaireSummary(matrix) }),
 *       flagged:         tool({ ..., execute: ()  => flaggedCells(matrix) }),
 *     },
 *   })
 *   // Build the AnalystAnswer from the tool result the model chose + its prose.
 */
export async function POST(req: Request) {
  let question = ""
  let parsed: ParsedResponse[] = []
  try {
    const body = (await req.json()) as { question?: string; parsed?: ParsedResponse[] }
    question = body.question ?? ""
    parsed = body.parsed ?? []
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 })
  }

  if (!question.trim()) {
    return NextResponse.json({ error: "question is required" }, { status: 400 })
  }

  // ── BEGIN STUB ──────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 400))
  const matrix = buildComparison(RFX, VENDORS, parsed)
  const result = answerQuestion(matrix, question)
  // ── END STUB ────────────────────────────────────────────────────────────

  return NextResponse.json(result)
}
