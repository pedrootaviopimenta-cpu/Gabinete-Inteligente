import { NextResponse } from "next/server";
import { getDocumentRequest, updateDocumentRequest } from "@/lib/document-requests";
import {
  isDocumentRequestStatus,
  type UpdateDocumentRequestInput
} from "@/lib/document-request-types";
import { getAuthenticatedUser } from "@/lib/auth";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type UpdatePayload = {
  status?: string;
  internal_notes?: string;
  final_document_text?: string;
  final_document_url?: string;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;
  const documentRequest = await getDocumentRequest(id);

  if (!documentRequest) {
    return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ request: documentRequest });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;
  const body = (await request.json()) as UpdatePayload;
  const update: UpdateDocumentRequestInput = {};

  if (body.status !== undefined) {
    if (!isDocumentRequestStatus(body.status)) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }

    update.status = body.status;
  }

  if (typeof body.internal_notes === "string") {
    update.internal_notes = body.internal_notes;
  }

  if (typeof body.final_document_text === "string") {
    update.final_document_text = body.final_document_text;
  }

  if (typeof body.final_document_url === "string") {
    update.final_document_url = body.final_document_url;
  }

  const documentRequest = await updateDocumentRequest(id, update);

  if (!documentRequest) {
    return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 });
  }

  return NextResponse.json({ request: documentRequest });
}

function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Acesso restrito a usuários autorizados." },
    { status: 401 }
  );
}
