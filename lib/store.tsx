"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { RFX, VENDORS } from "./mock-data"
import type { ExtractedCell, ParsedResponse, Rfx, Vendor } from "./types"

type ParseStatus = "idle" | "parsing" | "parsed" | "error"

interface StoreValue {
  rfx: Rfx
  vendors: Vendor[]
  parsed: Record<string, ParsedResponse>
  status: Record<string, ParseStatus>
  parsedList: ParsedResponse[]
  parseVendor: (vendorId: string) => Promise<void>
  parseAll: () => Promise<void>
  resetParsing: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [parsed, setParsed] = useState<Record<string, ParsedResponse>>({})
  const [status, setStatus] = useState<Record<string, ParseStatus>>({})

  const parseVendor = useCallback(async (vendorId: string) => {
    setStatus((s) => ({ ...s, [vendorId]: "parsing" }))
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ vendorId }),
      })
      if (!res.ok) throw new Error(`extract failed: ${res.status}`)
      const data = (await res.json()) as { cells: ExtractedCell[] }
      setParsed((p) => ({
        ...p,
        [vendorId]: {
          vendorId,
          cells: data.cells,
          parsedAt: new Date().toISOString(),
        },
      }))
      setStatus((s) => ({ ...s, [vendorId]: "parsed" }))
    } catch (err) {
      console.log("[v0] parseVendor error:", (err as Error).message)
      setStatus((s) => ({ ...s, [vendorId]: "error" }))
    }
  }, [])

  const parseAll = useCallback(async () => {
    await Promise.all(VENDORS.map((v) => parseVendor(v.id)))
  }, [parseVendor])

  const resetParsing = useCallback(() => {
    setParsed({})
    setStatus({})
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      rfx: RFX,
      vendors: VENDORS,
      parsed,
      status,
      parsedList: Object.values(parsed),
      parseVendor,
      parseAll,
      resetParsing,
    }),
    [parsed, status, parseVendor, parseAll, resetParsing],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
