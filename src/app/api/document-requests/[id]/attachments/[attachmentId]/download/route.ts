import { getAuthenticatedUser } from "@/lib/auth";
import {
  badRequestResponse,
  isSafeUuid,
  logControlledError,
  notFoundResponse,
  unauthorizedResponse
} from "@/lib/api-security";
import { getDocumentRequest } from "@/lib/document-requests";
import { getAttachmentDownload } from "@/lib/file-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string; attachmentId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const { id, attachmentId } = await context.params;

  if (!isSafeUuid(id) || !isSafeUuid(attachmentId)) {
    return badRequestResponse("Identificador inválido.");
  }

  try {
    const documentRequest = await getDocumentRequest(id);

    if (!documentRequest) {
      return notFoundResponse("Solicitação não encontrada.");
    }

    const download = await getAttachmentDownload(id, attachmentId);

    if (!download) {
      return notFoundResponse("Documento anexo não encontrado.");
    }

    const fileName = download.attachment.file_name || "documento";
    const body = new ArrayBuffer(download.data.byteLength);
    new Uint8Array(body).set(download.data);

    return new Response(body, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Content-Type": download.attachment.file_type,
        "Content-Length": String(download.attachment.file_size),
        "Content-Disposition": `attachment; filename="${fileName.replaceAll('"', "")}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
      }
    });
  } catch (error) {
    logControlledError("attachments_download", error);
    return new Response("Não foi possível baixar o documento anexo.", {
      status: 500,
      headers: {
        "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  }
}
