import { CircleAlert, CircleCheck, KeyRound } from "lucide-react";
import { HumanReviewNotice } from "@/components/human-review-notice";
import { getWorkspaceRuntimeConfig } from "@/lib/runtime-config";

const variables = [
  {
    name: "GI_DELIVERY_MODE",
    scope: "Servidor",
    description: "Define o modo de entrega do produto. O modo inicial recomendado é assisted."
  },
  {
    name: "GI_AI_ENABLED",
    scope: "Servidor",
    description: "Habilita ou desabilita geração automática por IA para o cliente."
  },
  {
    name: "GI_ADMIN_AI_ENABLED",
    scope: "Servidor",
    description: "Reserva futura para recursos de IA em área administrativa."
  },
  {
    name: "GI_ADMIN_USERNAME",
    scope: "Servidor",
    description: "Nome de usuário do administrador inicial autorizado a acessar a plataforma."
  },
  {
    name: "GI_ADMIN_PASSWORD",
    scope: "Servidor",
    description: "Senha do administrador inicial. O valor nunca é exibido na interface."
  },
  {
    name: "GI_ADMIN_RECOVERY_EMAIL",
    scope: "Servidor",
    description: "E-mail auxiliar para futura recuperação de senha e contato administrativo."
  },
  {
    name: "OPENAI_API_KEY",
    scope: "Servidor",
    description: "Chave server-side preservada para modos híbrido ou IA em etapa futura."
  },
  {
    name: "OPENAI_MODEL",
    scope: "Servidor",
    description: "Modelo utilizado pela rota interna de geração, quando informado."
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    scope: "Cliente",
    description: "URL pública do projeto Supabase."
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    scope: "Cliente",
    description: "Chave pública anon do Supabase para autenticação no navegador."
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    scope: "Servidor",
    description: "Chave privada para rotinas administrativas server-side."
  },
  {
    name: "APP_BASE_URL",
    scope: "Servidor",
    description: "Endereço base utilizado por integrações e callbacks futuros."
  }
];

export default function ConfiguracoesPage() {
  const runtimeConfig = getWorkspaceRuntimeConfig();

  return (
    <main className="space-y-6">
      <section className="gi-panel p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gi-gold/30 bg-gi-gold/10 text-gi-navy">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="gi-eyebrow">
              Ambiente e segurança
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-gi-ink">Configurações</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gi-muted">
              Esta página mostra apenas o status das variáveis de ambiente. Segredos,
              chaves privadas e tokens não são exibidos na interface.
            </p>
          </div>
        </div>
      </section>

      <HumanReviewNotice />

      <section className="gi-panel p-5">
        <h2 className="text-base font-semibold text-gi-ink">Status operacional</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <StatusPanel
            title="Modo de entrega"
            configured={runtimeConfig.deliveryMode === "assisted"}
            configuredText="Modo Assistido ativo. O cliente envia solicitações e recebe protocolo interno."
            missingText="Modo diferente de assisted configurado. Revise as variáveis antes de expor ao cliente."
          />
          <StatusPanel
            title="IA para cliente"
            configured={!runtimeConfig.clientAiEnabled}
            configuredText="Geração automática por IA desabilitada para o cliente."
            missingText="Geração automática por IA habilitada. Use apenas em modo futuro devidamente revisado."
          />
          <StatusPanel
            title="Persistência Supabase"
            configured={
              Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
              Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
              Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
            }
            configuredText="Credenciais públicas e chave server-side do Supabase configuradas."
            missingText="Sem Supabase completo, o ambiente local usa armazenamento assistido em arquivo ignorado pelo Git."
          />
          <StatusPanel
            title="Acesso restrito"
            configured={Boolean(process.env.GI_ADMIN_USERNAME) && Boolean(process.env.GI_ADMIN_PASSWORD)}
            configuredText="Administrador inicial configurado por usuário e senha em variáveis de ambiente."
            missingText="Configure GI_ADMIN_USERNAME e GI_ADMIN_PASSWORD antes de usar a plataforma."
          />
        </div>
      </section>

      <section className="gi-panel p-5">
        <h2 className="text-base font-semibold text-gi-ink">Variáveis de ambiente</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-gi-line">
          <div className="hidden bg-gi-navy px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white sm:grid sm:grid-cols-[1.1fr_0.7fr_0.7fr]">
            <span>Variável</span>
            <span>Escopo</span>
            <span>Status</span>
          </div>
          {variables.map((variable) => {
            const configured = Boolean(process.env[variable.name]);

            return (
              <div
                key={variable.name}
                className="grid gap-3 border-t border-gi-line px-4 py-3 text-sm sm:grid-cols-[1.1fr_0.7fr_0.7fr]"
              >
                <div className="min-w-0">
                  <p className="break-all font-medium text-gi-ink">{variable.name}</p>
                  <p className="mt-1 text-xs leading-5 text-gi-muted">{variable.description}</p>
                </div>
                <span className="text-gi-muted">
                  <span className="font-medium text-gi-ink sm:hidden">Escopo: </span>
                  {variable.scope}
                </span>
                <span
                  className={
                    configured
                       ? "font-medium text-gi-navy"
                      : "font-medium text-gi-amber"
                  }
                >
                  <span className="font-medium text-gi-ink sm:hidden">Status: </span>
                  {configured ? "Configurada" : "Não configurada"}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

type StatusPanelProps = {
  title: string;
  configured: boolean;
  configuredText: string;
  missingText: string;
};

function StatusPanel({ title, configured, configuredText, missingText }: StatusPanelProps) {
  const Icon = configured ? CircleCheck : CircleAlert;

  return (
    <div className="rounded-lg border border-gi-line bg-white p-4">
      <div className="flex items-start gap-3">
        <Icon
          className={configured ? "mt-0.5 h-5 w-5 text-gi-gold" : "mt-0.5 h-5 w-5 text-gi-amber"}
          aria-hidden="true"
        />
        <div>
          <h3 className="text-sm font-semibold text-gi-ink">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-gi-muted">
            {configured ? configuredText : missingText}
          </p>
        </div>
      </div>
    </div>
  );
}
