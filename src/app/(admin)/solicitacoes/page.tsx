import { DocumentRequestsAdmin } from "@/components/document-requests-admin";
import { HumanReviewNotice } from "@/components/human-review-notice";

export default function SolicitacoesPage() {
  return (
    <div className="space-y-6">
      <HumanReviewNotice />
      <DocumentRequestsAdmin />
    </div>
  );
}
