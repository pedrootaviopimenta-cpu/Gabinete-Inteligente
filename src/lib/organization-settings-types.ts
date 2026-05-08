export type OrganizationSettings = {
  id: string;
  organization_name: string;
  city: string;
  state: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  mayor_name: string;
  attorney_name: string;
  default_secretary_name: string;
  header_text: string;
  footer_text: string;
  logo_url: string;
  created_at: string;
  updated_at: string;
};

export type UpdateOrganizationSettingsInput = Partial<
  Omit<OrganizationSettings, "id" | "created_at" | "updated_at">
>;

export const organizationSettingFields = [
  "organization_name",
  "city",
  "state",
  "cnpj",
  "address",
  "phone",
  "email",
  "website",
  "mayor_name",
  "attorney_name",
  "default_secretary_name",
  "header_text",
  "footer_text",
  "logo_url"
] as const;

export function buildEmptyOrganizationSettings(): OrganizationSettings {
  const now = new Date().toISOString();

  return {
    id: "",
    organization_name: "",
    city: "",
    state: "",
    cnpj: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    mayor_name: "",
    attorney_name: "",
    default_secretary_name: "",
    header_text: "",
    footer_text: "",
    logo_url: "",
    created_at: now,
    updated_at: now
  };
}
