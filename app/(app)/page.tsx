import { PageHeader } from "@/components/page-header"
import { RfxBuilder } from "@/components/rfx-builder"

export default function Page() {
  return (
    <>
      <PageHeader
        title="RFx Builder"
        subtitle="Describe a sourcing need and draft a structured RFx"
      />
      <RfxBuilder />
    </>
  )
}
