import { getAuthenticatedUser } from "@/lib/auth";
import {
  isAllowedAttachmentMimeType,
  maxAttachmentSizeBytes,
  maxAttachmentsPerRequest
} from "@/lib/attachment-constants";
import {
  badRequestResponse,
  isSafeUuid,
  jsonNoStore,
  logControlledError,
  notFoundResponse,
  unauthorizedResponse
} from "@/lib/api-security";
import { getDocumentRequest } from "@/lib/document-requests";
import { listAttachments, saveAttachment } from "@/lib/file-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const maxMultipartPayloadBytes = maxAttachmentSizeBytes * maxAttachmentsPerRequest + 1_000_000;

export async function GET(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;

  if (!isSafeUuid(id)) {
    return badRequestResponse("Identificador inválido.");
  }

  try {
    const documentRequest = await getDocumentRequest(id);

    if (!documentRequest) {
      return notFoundResponse("Solicitação não encontrada.");
    }

    const attachments = await listAttachments(id);
    return jsonNoStore({ attachments });
  } catch (error) {
    logControlledError("attachments_list", error);
    return jsonNoStore({ error: "Não foi possível carregar os documentos anexos." }, 500);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;

  if (!isSafeUuid(id)) {
    return badRequestResponse("Identificador inválido.");
  }

  const contentLength = Number(request.headers.get("content-length") || "0");

  if (contentLength > maxMultipartPayloadBytes) {
    return badRequestResponse("Arquivo excede o limite permitido.");
  }

  try {
    const documentRequest = await getDocumentRequest(id);

    if (!documentRequest) {
      return notFoundResponse("Solicitação não encontrada.");
    }

    const currentAttachments = await listAttachments(id);

    if (currentAttachments.length >= maxAttachmentsPerRequest) {
      return badRequestResponse("Limite de documentos anexos atingido.");
    }

    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => typeof File !== "undefined" && entry instanceof File)
      .filter((file) => file.size > 0);

    if (!files.length) {
      return badRequestResponse("Selecione ao menos um documento para anexar.");
    }

    if (currentAttachments.length + files.length > maxAttachmentsPerRequest) {
      return badRequestResponse("Limite de documentos anexos atingido.");
    }

    for (const file of files) {
      if (!isAllowedAttachmentMimeType(file.type)) {
        return badRequestResponse("Tipo de arquivo não permitido.");
      }

      if (file.size > maxAttachmentSizeBytes) {
        return badRequestResponse("Arquivo excede o limite permitido.");
      }
    }

    const attachments = [];

    for (const file of files) {
      const data = Buffer.from(await file.arrayBuffer());
      attachments.push(
        await saveAttachment({
          requestId: id,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          data,
          uploadedBy: user.username
        })
      );
    }

    return jsonNoStore(
      {
        attachments,
        message: "Documento anexado com segurança à solicitação."
      },
      201
    );
  } catch (error) {
    logControlledError("attachments_upload", error);
    return jsonNoStore({ error: "Não foi possível anexar o documento." }, 500);
  }
}
