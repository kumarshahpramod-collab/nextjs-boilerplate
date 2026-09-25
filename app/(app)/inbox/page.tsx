import { PageHeader } from "@/components/page-header"
import { VendorInbox } from "@/components/vendor-inbox"

export default function Page() {
  return (
    <>
      <PageHeader
        title="Vendor Inbox"
        subtitle="Five replies, five formats — parsed into one common schema"
      />
      <VendorInbox />
    </>
  )
}
