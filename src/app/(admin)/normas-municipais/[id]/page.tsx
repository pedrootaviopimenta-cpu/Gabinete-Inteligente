import { notFound } from "next/navigation";
import { MunicipalNormForm } from "@/components/municipal-norm-form";
import { isSafeUuid } from "@/lib/api-security";
import { getMunicipalNorm } from "@/lib/municipal-norms";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function NormaMunicipalDetalhePage({ params }: PageProps) {
  const { id } = await params;

  if (!isSafeUuid(id)) {
    notFound();
  }

  const norm = await getMunicipalNorm(id);

  if (!norm) {
    notFound();
  }

  return <MunicipalNormForm norm={norm} />;
}
