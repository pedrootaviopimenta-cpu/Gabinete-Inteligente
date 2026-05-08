"use client";

import { useEffect, useState } from "react";
import { Building2, Save } from "lucide-react";
import {
  buildEmptyOrganizationSettings,
  type OrganizationSettings
} from "@/lib/organization-settings-types";

type SettingsPayload = {
  settings?: OrganizationSettings;
  error?: string;
};

const textFields: Array<{
  name: keyof OrganizationSettings;
  label: string;
  placeholder?: string;
  width?: "half" | "full";
}> = [
  { name: "organization_name", label: "Nome do município, secretaria ou órgão" },
  { name: "city", label: "Cidade", width: "half" },
  { name: "state", label: "UF", placeholder: "Ex.: SP", width: "half" },
  { name: "cnpj", label: "CNPJ", width: "half" },
  { name: "phone", label: "Telefone", width: "half" },
  { name: "email", label: "E-mail institucional", width: "half" },
  { name: "website", label: "Site", width: "half" },
  { name: "address", label: "Endereço" },
  { name: "mayor_name", label: "Prefeito(a)", width: "half" },
  { name: "attorney_name", label: "Procurador(a)", width: "half" },
  { name: "default_secretary_name", label: "Secretário(a) padrão", width: "half" },
  { name: "logo_url", label: "URL do logotipo/brasão futuro", width: "half" }
];

export function OrganizationSettingsForm() {
  const [settings, setSettings] = useState<OrganizationSettings>(buildEmptyOrganizationSettings());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadSettings();
  }, []);

  async function loadSettings() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/settings/organization", { cache: "no-store" });
      const payload = (await response.json()) as SettingsPayload;

      if (!response.ok || !payload.settings) {
        setError(payload.error || "Não foi possível carregar as configurações institucionais.");
        return;
      }

      setSettings(payload.settings);
    } catch {
      setError("Não foi possível carregar as configurações institucionais.");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSettings() {
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/settings/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(settings))
      });
      const payload = (await response.json()) as SettingsPayload;

      if (!response.ok || !payload.settings) {
        setError(payload.error || "Não foi possível salvar as configurações institucionais.");
        return;
      }

      setSettings(payload.settings);
      setMessage("Configurações institucionais salvas com segurança.");
    } catch {
      setError("Não foi possível salvar as configurações institucionais.");
    } finally {
      setIsSaving(false);
    }
  }

  function updateField(name: keyof OrganizationSettings, value: string) {
    setSettings((current) => ({ ...current, [name]: value }));
  }

  return (
    <section className="gi-panel p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gi-gold/30 bg-gi-gold/10 text-gi-navy">
          <Building2 className="h-5 w-5" aria-hidden={true} />
        </div>
        <div>
          <p className="gi-eyebrow">Templates institucionais</p>
          <h2 className="mt-2 text-lg font-semibold text-gi-ink">
            Identidade do município, secretaria ou órgão
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gi-muted">
            Esses dados serão usados gradualmente em exportações DOCX, cabeçalhos, rodapés e
            modelos institucionais por município.
          </p>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-5 rounded-md border border-gi-line bg-gi-background p-4 text-sm leading-6 text-gi-muted">
          Carregando configurações institucionais...
        </p>
      ) : (
        <form
          className="mt-5 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            void saveSettings();
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {textFields.map((field) => (
              <label
                key={field.name}
                className={field.width === "half" ? "block text-sm font-medium text-gi-ink" : "block text-sm font-medium text-gi-ink md:col-span-2"}
              >
                {field.label}
                <input
                  value={String(settings[field.name] || "")}
                  onChange={(event) => updateField(field.name, event.target.value)}
                  className="gi-input"
                  placeholder={field.placeholder}
                />
              </label>
            ))}

            <label className="block text-sm font-medium text-gi-ink md:col-span-2">
              Texto de cabeçalho
              <textarea
                value={settings.header_text}
                onChange={(event) => updateField("header_text", event.target.value)}
                rows={3}
                className="gi-input resize-y"
                placeholder="Ex.: Prefeitura Municipal, Secretaria competente, endereço e contatos institucionais."
              />
            </label>

            <label className="block text-sm font-medium text-gi-ink md:col-span-2">
              Texto de rodapé
              <textarea
                value={settings.footer_text}
                onChange={(event) => updateField("footer_text", event.target.value)}
                rows={3}
                className="gi-input resize-y"
                placeholder="Ex.: Documento de apoio administrativo. Revisão humana obrigatória antes de uso oficial."
              />
            </label>
          </div>

          {message ? (
            <p className="rounded-md border border-gi-gold/35 bg-gi-gold/10 p-3 text-sm leading-6 text-gi-ink">
              {message}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={isSaving} className="gi-button-primary">
            <Save className="h-4 w-4" aria-hidden={true} />
            {isSaving ? "Salvando" : "Salvar configurações institucionais"}
          </button>
        </form>
      )}
    </section>
  );
}

function toPayload(settings: OrganizationSettings) {
  return {
    organization_name: settings.organization_name,
    city: settings.city,
    state: settings.state,
    cnpj: settings.cnpj,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    website: settings.website,
    mayor_name: settings.mayor_name,
    attorney_name: settings.attorney_name,
    default_secretary_name: settings.default_secretary_name,
    header_text: settings.header_text,
    footer_text: settings.footer_text,
    logo_url: settings.logo_url
  };
}
