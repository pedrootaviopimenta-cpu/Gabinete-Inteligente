import { getAuthenticatedUser } from "@/lib/auth";
import {
  badRequestResponse,
  forbiddenResponse,
  hasOnlyAllowedKeys,
  jsonNoStore,
  logControlledError,
  readJsonWithLimit,
  unauthorizedResponse
} from "@/lib/api-security";
import {
  getOrganizationSettings,
  updateOrganizationSettings
} from "@/lib/organization-settings";
import {
  organizationSettingFields,
  type UpdateOrganizationSettingsInput
} from "@/lib/organization-settings-types";
import { canManageUsers } from "@/lib/permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  try {
    const settings = await getOrganizationSettings();
    return jsonNoStore({ settings });
  } catch (error) {
    logControlledError("organization_settings_get", error);
    return jsonNoStore({ error: "Não foi possível carregar as configurações institucionais." }, 500);
  }
}

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return unauthorizedResponse();
  }

  if (!canManageUsers(user)) {
    return forbiddenResponse("Operação restrita ao administrador.");
  }

  const parsedBody = await readJsonWithLimit<UpdateOrganizationSettingsInput>(request, 60_000);

  if ("error" in parsedBody) {
    return badRequestResponse(parsedBody.error);
  }

  const body = parsedBody.data;

  if (!hasOnlyAllowedKeys(body, [...organizationSettingFields])) {
    return badRequestResponse("Requisição inválida.");
  }

  if (!String(body.organization_name || "").trim()) {
    return badRequestResponse("Informe o nome do município, secretaria ou órgão.");
  }

  try {
    const settings = await updateOrganizationSettings(body);
    return jsonNoStore({ settings });
  } catch (error) {
    logControlledError("organization_settings_update", error);
    return jsonNoStore({ error: "Não foi possível salvar as configurações institucionais." }, 500);
  }
}
