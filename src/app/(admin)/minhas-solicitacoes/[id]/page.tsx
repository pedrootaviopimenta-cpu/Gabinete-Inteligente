import { HumanReviewNotice } from "@/components/human-review-notice";
import { RequesterDocumentRequestDetailView } from "@/components/requester-document-request-detail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MinhaSolicitacaoDetalhePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <HumanReviewNotice />
      <RequesterDocumentRequestDetailView requestId={id} />
    </div>
  );
}
