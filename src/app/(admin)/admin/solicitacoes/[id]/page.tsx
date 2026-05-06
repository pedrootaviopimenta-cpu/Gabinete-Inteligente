import { DocumentRequestDetailAdmin } from "@/components/document-request-detail-admin";
import { HumanReviewNotice } from "@/components/human-review-notice";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminSolicitacaoDetalhePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <HumanReviewNotice />
      <DocumentRequestDetailAdmin requestId={id} />
    </div>
  );
}
