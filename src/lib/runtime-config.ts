export type GiDeliveryMode = "assisted" | "hybrid" | "ai";

export type WorkspaceRuntimeConfig = {
  deliveryMode: GiDeliveryMode;
  clientAiEnabled: boolean;
  adminAiEnabled: boolean;
};

export function getGiDeliveryMode(): GiDeliveryMode {
  const value = process.env.GI_DELIVERY_MODE?.toLowerCase();

  if (value === "hybrid" || value === "ai") {
    return value;
  }

  return "assisted";
}

export function isClientAiEnabled() {
  const deliveryMode = getGiDeliveryMode();
  return deliveryMode !== "assisted" && readBooleanEnv("GI_AI_ENABLED", false);
}

export function isAdminAiEnabled() {
  return readBooleanEnv("GI_ADMIN_AI_ENABLED", false);
}

export function getWorkspaceRuntimeConfig(): WorkspaceRuntimeConfig {
  return {
    deliveryMode: getGiDeliveryMode(),
    clientAiEnabled: isClientAiEnabled(),
    adminAiEnabled: isAdminAiEnabled()
  };
}

export function isAssistedMode() {
  return getGiDeliveryMode() === "assisted";
}

function readBooleanEnv(name: string, fallback: boolean) {
  const value = process.env[name];

  if (value === undefined) {
    return fallback;
  }

  return ["1", "true", "yes", "sim", "on"].includes(value.toLowerCase());
}
