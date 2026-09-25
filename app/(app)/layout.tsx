import type { ReactNode } from "react"
import { StoreProvider } from "@/lib/store"
import { Sidebar } from "@/components/sidebar"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </StoreProvider>
  )
}
