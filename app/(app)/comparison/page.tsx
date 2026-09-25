import { PageHeader } from "@/components/page-header"
import { ComparisonView } from "@/components/comparison-view"

export default function Page() {
  return (
    <>
      <PageHeader
        title="Comparison"
        subtitle="One matrix — lines × vendors, with unit/currency mismatches and low-confidence extractions flagged"
      />
      <ComparisonView />
    </>
  )
}
