import { HumanReviewNotice } from "@/components/human-review-notice";
import { RequesterDocumentRequestsList } from "@/components/requester-document-requests-list";

export default function MinhasSolicitacoesPage() {
  return (
    <div className="space-y-6">
      <HumanReviewNotice />
      <RequesterDocumentRequestsList />
    </div>
  );
}
