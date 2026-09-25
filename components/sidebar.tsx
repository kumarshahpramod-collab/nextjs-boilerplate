"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Boxes,
  Inbox,
  Table2,
  MessagesSquare,
  CircleCheck,
  CircleDashed,
} from "lucide-react"
import { useStore } from "@/lib/store"

const NAV = [
  { href: "/", label: "RFx Builder", icon: Boxes, hint: "Draft scope & lines" },
  { href: "/inbox", label: "Vendor Inbox", icon: Inbox, hint: "Parse replies" },
  { href: "/comparison", label: "Comparison", icon: Table2, hint: "Price matrix" },
  { href: "/chat", label: "Analyst", icon: MessagesSquare, hint: "Ask the data" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { vendors, parsed, rfx } = useStore()
  const parsedCount = Object.keys(parsed).length

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
        <div className="flex size-7 items-center justify-center rounded-md bg-accent text-accent-fg">
          <Boxes className="size-4" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">Procura</div>
          <div className="text-[11px] text-muted-2">RFx Comparison</div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 p-2">
        {NAV.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent-soft text-accent"
                  : "text-foreground/80 hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <Icon className={`size-4 ${active ? "text-accent" : "text-muted-2"}`} />
              <span className="flex-1 font-medium">{item.label}</span>
              {item.href === "/inbox" && (
                <span className="tnum flex items-center gap-1 text-[11px] text-muted-2">
                  {parsedCount === vendors.length ? (
                    <CircleCheck className="size-3.5 text-success" />
                  ) : (
                    <CircleDashed className="size-3.5" />
                  )}
                  {parsedCount}/{vendors.length}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-border p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-2">
          Active RFx
        </div>
        <div className="mt-1 line-clamp-2 text-xs text-muted">{rfx.title}</div>
        <div className="tnum mt-2 flex items-center gap-3 text-[11px] text-muted-2">
          <span>{rfx.lineItems.length} lines</span>
          <span>{vendors.length} vendors</span>
        </div>
      </div>
    </aside>
  )
}
