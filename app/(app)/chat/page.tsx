import { PageHeader } from "@/components/page-header"
import { AnalystChat } from "@/components/analyst-chat"

export default function Page() {
  return (
    <>
      <PageHeader
        title="Analyst"
        subtitle="Ask free-text questions over the comparison — answers are computed and cited"
      />
      <AnalystChat />
    </>
  )
}
