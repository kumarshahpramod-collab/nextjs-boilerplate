"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowUp,
  Sparkles,
  FileText,
  ListChecks,
  Scale,
  Package,
  ArrowRight,
  Check,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { Badge, Card, SectionLabel } from "@/components/primitives"

interface ChatMsg {
  role: "user" | "assistant"
  content: string
}

const SEED_PROMPT =
  "We need corrugated packaging for our 5 North American DCs for the next 12 months — around 30 SKUs: RSC shipping boxes in several sizes, die-cut mailers, corrugated pads and pallet tier sheets, export boxes, and a couple of printed cartons. Net 45, delivered, and we want FSC/ISO compliant suppliers. Draft the RFx.",

const STEPS = [
  { key: "scope", label: "Scope", icon: FileText },
  { key: "lines", label: "Line items", icon: Package },
  { key: "questionnaire", label: "Questionnaire", icon: ListChecks },
  { key: "terms", label: "Commercial terms", icon: Scale },
]

export function RfxBuilder() {
  const { rfx } = useStore()
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "Describe what you need to source and I'll draft a structured RFx — scope, line items with spec/qty/unit, a vendor questionnaire, and commercial terms. Try the corrugated packaging example below to see a full draft.",
    },
  ])
  const [input, setInput] = useState("")
  const [drafting, setDrafting] = useState(false)
  const [drafted, setDrafted] = useState(false)
  const [builtSteps, setBuiltSteps] = useState<string[]>([])
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  function send(text: string) {
    const content = text.trim()
    if (!content || drafting) return
    setInput("")
    setMessages((m) => [...m, { role: "user", content }])
    setDrafting(true)
    setBuiltSteps([])

    // Simulated drafting. Replace this block with a call to your RFx-drafting
    // model (e.g. POST /api/reason or a dedicated /api/draft route) that returns
    // the same Rfx shape rendered on the right.
    timers.current.forEach(clearTimeout)
    timers.current = []
    STEPS.forEach((s, i) => {
      timers.current.push(
        setTimeout(() => setBuiltSteps((prev) => [...prev, s.key]), 350 * (i + 1)),
      )
    })
    timers.current.push(
      setTimeout(() => {
        setDrafted(true)
        setDrafting(false)
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: `Drafted "${rfx.title}". I structured it into ${rfx.lineItems.length} line items across the corrugated category, a ${rfx.questionnaire.length}-question vendor questionnaire (${rfx.questionnaire.filter((q) => q.required).length} required), and ${rfx.commercialTerms.length} commercial terms. Review it on the right, then send it to vendors and parse their replies in the inbox.`,
          },
        ])
      }, 350 * (STEPS.length + 1) + 200),
    )
  }

  return (
    <div className="flex min-h-0 flex-1">
      {/* Chat column */}
      <div className="flex w-[380px] shrink-0 flex-col border-r border-border bg-surface">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={`max-w-[92%] rounded-lg px-3 py-2 text-[13px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-accent text-accent-fg"
                    : "border border-border bg-surface-2 text-foreground"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-accent">
                    <Sparkles className="size-3" /> RFx Assistant
                  </div>
                )}
                {m.content}
              </div>
            </div>
          ))}

          {drafting && (
            <div className="space-y-1.5 rounded-lg border border-border bg-surface-2 p-3">
              {STEPS.map((s) => {
                const done = builtSteps.includes(s.key)
                return (
                  <div key={s.key} className="flex items-center gap-2 text-[13px]">
                    <span
                      className={`flex size-4 items-center justify-center rounded-full border ${
                        done
                          ? "border-transparent bg-success text-white"
                          : "border-border-strong"
                      }`}
                    >
                      {done && <Check className="size-2.5" />}
                    </span>
                    <span className={done ? "text-foreground" : "text-muted-2"}>
                      {done ? "Drafted" : "Drafting"} {s.label.toLowerCase()}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {!drafted && (
          <div className="px-4 pb-2">
            <button
              onClick={() => send(SEED_PROMPT)}
              disabled={drafting}
              className="w-full rounded-md border border-dashed border-border-strong bg-surface-2 px-3 py-2 text-left text-[12px] text-muted transition-colors hover:border-accent hover:text-foreground disabled:opacity-50"
            >
              <span className="mb-0.5 flex items-center gap-1.5 font-medium text-foreground">
                <Sparkles className="size-3 text-accent" /> Example prompt
              </span>
              Corrugated packaging, ~30 SKUs, 5 DCs, Net 45, FSC/ISO compliant…
            </button>
          </div>
        )}

        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2 rounded-lg border border-border bg-surface-2 p-2 focus-within:border-accent">
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
                  send(input)
                }
              }}
              rows={1}
              placeholder="Describe what you need to source…"
              className="max-h-32 min-h-[20px] flex-1 resize-none bg-transparent text-[13px] outline-none placeholder:text-muted-2"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || drafting}
              className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-fg transition-opacity disabled:opacity-40"
              aria-label="Send"
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Document preview */}
      <div className="min-w-0 flex-1 overflow-y-auto bg-background">
        {!drafted ? (
          <EmptyDraft />
        ) : (
          <div className="mx-auto max-w-3xl space-y-5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone="accent">{rfx.category}</Badge>
                  <span className="tnum text-xs text-muted-2">{rfx.id.toUpperCase()}</span>
                </div>
                <h2 className="mt-2 text-lg font-semibold tracking-tight">{rfx.title}</h2>
              </div>
              <Link
                href="/inbox"
                className="flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-fg"
              >
                Send to vendors <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <Card className="p-4">
              <SectionLabel>Scope</SectionLabel>
              <p className="mt-2 text-[13px] leading-relaxed text-foreground/90">{rfx.scope}</p>
            </Card>

            <Card className="overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5">
                <SectionLabel>Line items</SectionLabel>
                <span className="tnum text-[11px] text-muted-2">{rfx.lineItems.length} lines</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-t border-border text-[13px]">
                  <thead>
                    <tr className="bg-surface-2 text-left text-[11px] uppercase tracking-wider text-muted-2">
                      <th className="px-4 py-2 font-medium">Ref</th>
                      <th className="px-2 py-2 font-medium">Description</th>
                      <th className="px-2 py-2 font-medium">Spec</th>
                      <th className="px-2 py-2 text-right font-medium">Qty</th>
                      <th className="px-4 py-2 font-medium">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rfx.lineItems.map((li) => (
                      <tr key={li.id} className="border-t border-border hover:bg-surface-2">
                        <td className="tnum px-4 py-2 font-medium text-accent">{li.ref}</td>
                        <td className="px-2 py-2">{li.description}</td>
                        <td className="px-2 py-2 text-muted">{li.spec}</td>
                        <td className="tnum px-2 py-2 text-right">{li.qty.toLocaleString()}</td>
                        <td className="px-4 py-2 text-muted">{li.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card className="p-4">
                <SectionLabel>Vendor questionnaire</SectionLabel>
                <ul className="mt-3 space-y-2.5">
                  {rfx.questionnaire.map((q, i) => (
                    <li key={q.id} className="flex gap-2 text-[13px]">
                      <span className="tnum mt-0.5 text-muted-2">{i + 1}.</span>
                      <span className="flex-1">
                        {q.question}{" "}
                        {q.required && <Badge tone="warning">required</Badge>}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-4">
                <SectionLabel>Commercial terms</SectionLabel>
                <ul className="mt-3 space-y-2.5">
                  {rfx.commercialTerms.map((t, i) => (
                    <li key={i} className="flex gap-2 text-[13px]">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                      <span className="flex-1">{t}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-md bg-accent-soft px-3 py-2 text-[12px] text-accent">
                  Quotes will be normalized to {rfx.baselineCurrency}. Off-currency and off-unit
                  replies are flagged, not rejected.
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyDraft() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-surface">
        <FileText className="size-5 text-muted-2" />
      </div>
      <h2 className="mt-4 text-sm font-semibold">No RFx drafted yet</h2>
      <p className="mt-1 max-w-xs text-[13px] text-muted">
        Describe your sourcing need in the chat. The assistant will structure it into a
        reviewable RFx document here.
      </p>
    </div>
  )
}
