import { DocumentRequestsAdminList } from "@/components/document-requests-admin-list";
import { HumanReviewNotice } from "@/components/human-review-notice";

export default function AdminSolicitacoesPage() {
  return (
    <div className="space-y-6">
      <HumanReviewNotice />
      <DocumentRequestsAdminList />
    </div>
  );
}
