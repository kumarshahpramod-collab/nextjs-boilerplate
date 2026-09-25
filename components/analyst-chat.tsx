"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowUp,
  Sparkles,
  Loader2,
  Quote,
  MessagesSquare,
  ArrowRight,
  FlaskConical,
} from "lucide-react"
import { useStore } from "@/lib/store"
import type { AnalystAnswer } from "@/lib/types"

interface Turn {
  role: "user" | "assistant"
  content: string
  data?: AnalystAnswer
}

const SUGGESTIONS = [
  "Cheapest per line among vendors who passed the questionnaire",
  "Estimated basket total per vendor",
  "Which vendors failed the questionnaire and why?",
  "Show all flagged extractions I should review",
]

export function AnalystChat() {
  const { parsedList } = useStore()
  const hasData = parsedList.length > 0
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  async function ask(text: string) {
    const question = text.trim()
    if (!question || loading || !hasData) return
    setInput("")
    setTurns((t) => [...t, { role: "user", content: question }])
    setLoading(true)
    try {
      const res = await fetch("/api/reason", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, parsed: parsedList }),
      })
      if (!res.ok) throw new Error(`reason failed: ${res.status}`)
      const data = (await res.json()) as AnalystAnswer
      setTurns((t) => [...t, { role: "assistant", content: data.answer, data }])
    } catch (err) {
      console.log("[v0] ask error:", (err as Error).message)
      setTurns((t) => [
        ...t,
        { role: "assistant", content: "Something went wrong reaching the reasoning route." },
      ])
    } finally {
      setLoading(false)
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
      })
    }
  }

  if (!hasData) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-surface">
          <MessagesSquare className="size-5 text-muted-2" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Parse responses to enable the analyst</h2>
          <p className="mt-1 max-w-xs text-[13px] text-muted">
            The analyst answers over the parsed comparison data. Parse the vendor replies first.
          </p>
        </div>
        <Link
          href="/inbox"
          className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-fg"
        >
          Open inbox <ArrowRight className="size-3.5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
        {turns.length === 0 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-accent">
                <Sparkles className="size-3" /> Analyst
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/90">
                Ask questions over the parsed comparison. Answers are computed from the price
                matrix and cited back to the vendor source snippets — never guessed.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="rounded-lg border border-border bg-surface px-3 py-2.5 text-left text-[13px] text-foreground/90 transition-colors hover:border-accent hover:bg-surface-2"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((t, i) =>
          t.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-lg bg-accent px-3 py-2 text-[13px] text-accent-fg">
                {t.content}
              </div>
            </div>
          ) : (
            <div key={i} className="space-y-3">
              <div className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-accent">
                  <Sparkles className="size-3" /> Analyst
                  {t.data?.stub && (
                    <span className="ml-1 inline-flex items-center gap-1 rounded bg-warning-soft px-1.5 py-0.5 text-[10px] font-medium text-warning">
                      <FlaskConical className="size-2.5" /> deterministic stub
                    </span>
                  )}
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90">
                  {t.content}
                </p>

                {t.data?.table && (
                  <div className="mt-3 overflow-x-auto rounded-md border border-border">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="bg-surface-2 text-left text-[11px] uppercase tracking-wider text-muted-2">
                          {t.data.table.columns.map((c) => (
                            <th key={c} className="px-3 py-2 font-medium">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {t.data.table.rows.map((row, ri) => (
                          <tr key={ri} className="border-t border-border">
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                className={`px-3 py-1.5 ${ci === 0 ? "tnum font-medium text-accent" : "text-foreground/90"}`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {t.data?.citations && t.data.citations.length > 0 && (
                <div className="rounded-lg border border-dashed border-border bg-surface-2 p-3">
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-2">
                    <Quote className="size-3" /> Citations
                  </div>
                  <ul className="space-y-2">
                    {t.data.citations.map((c, ci) => (
                      <li key={ci} className="text-[12px]">
                        <span className="font-medium text-foreground">{c.vendorName}</span>
                        {c.lineItemRef && (
                          <span className="tnum text-muted-2"> · {c.lineItemRef}</span>
                        )}
                        <div className="mt-0.5 border-l-2 border-border pl-2 italic text-muted">
                          &ldquo;{c.snippet}&rdquo;
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ),
        )}

        {loading && (
          <div className="flex items-center gap-2 text-[13px] text-muted">
            <Loader2 className="size-3.5 animate-spin" /> Computing over the comparison matrix…
          </div>
        )}
      </div>

      <div className="border-t border-border bg-background px-6 py-3">
        <div className="flex items-end gap-2 rounded-lg border border-border bg-surface p-2 focus-within:border-accent">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing &&
                e.keyCode !== 229
              ) {
                e.preventDefault()
                ask(input)
              }
            }}
            rows={1}
            placeholder="Ask about pricing, compliance, or flagged extractions…"
            className="max-h-32 min-h-[20px] flex-1 resize-none bg-transparent text-[13px] outline-none placeholder:text-muted-2"
          />
          <button
            onClick={() => ask(input)}
            disabled={!input.trim() || loading}
            className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-fg transition-opacity disabled:opacity-40"
            aria-label="Ask"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
