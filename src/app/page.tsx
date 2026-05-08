import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  Landmark,
  LockKeyhole,
  Scale,
  ShieldCheck
} from "lucide-react";

const modules = [
  "Ofícios administrativos",
  "Respostas ao Ministério Público",
  "Pareceres preliminares",
  "Normas municipais",
  "Checklists administrativos"
];

const audiences = [
  "Prefeituras",
  "Secretarias municipais",
  "Procuradorias",
  "Controladorias",
  "Gabinetes",
  "Assessorias administrativas"
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gi-background text-gi-ink">
      <section className="bg-gi-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-gi-gold/40 bg-white/10 text-gi-gold">
                <Building2 className="h-5 w-5" aria-hidden={true} />
              </div>
              <div>
                <p className="text-sm font-semibold">Gabinete Inteligente</p>
                <p className="text-xs font-medium text-gi-gold">Gestão pública municipal</p>
              </div>
            </div>
            <Link href="/login" className="gi-button-assisted">
              Acessar plataforma
            </Link>
          </nav>

          <div className="grid gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gi-gold">
                Produção documental assistida
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
                Gabinete Inteligente
              </h1>
              <p className="mt-5 max-w-3xl text-xl leading-8 text-white/82">
                Produção documental assistida para gestão pública municipal.
              </p>
              <p className="mt-5 max-w-4xl text-base leading-7 text-white/72">
                Organize solicitações, ofícios, respostas ao Ministério Público, pareceres
                preliminares, checklists e documentos administrativos com fluxo assistido, revisão
                humana e governança institucional.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className="gi-button-assisted">
                  Acessar plataforma
                  <ArrowRight className="h-4 w-4" aria-hidden={true} />
                </Link>
                <Link
                  href="/termos-de-uso"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:border-gi-gold hover:bg-white/15"
                >
                  Solicitar demonstração
                </Link>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-premium">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 text-gi-gold" aria-hidden={true} />
                <p className="text-sm leading-6 text-white/78">
                  O GI não emite decisão automática, não substitui advogado, procurador,
                  controlador interno, servidor técnico ou autoridade competente. Toda entrega
                  depende de revisão humana.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <InfoPanel icon={Landmark} title="O que é">
          Plataforma de apoio administrativo e documental para organizar demandas, preservar dados
          estruturados e apoiar a produção assistida por equipe humana responsável.
        </InfoPanel>
        <InfoPanel icon={LockKeyhole} title="Segurança">
          Ambiente interno protegido por login, sem cadastro público, com sigilo operacional e
          controle de acesso para usuários autorizados.
        </InfoPanel>
        <InfoPanel icon={Scale} title="Revisão obrigatória">
          Todo documento, minuta ou análise depende de conferência documental, validação técnica e
          assinatura por autoridade ou profissional competente.
        </InfoPanel>
      </section>

      <section className="border-y border-gi-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="gi-eyebrow">Módulos disponíveis</p>
            <h2 className="mt-2 text-2xl font-semibold text-gi-ink">Fluxo assistido por área</h2>
            <p className="mt-3 text-sm leading-6 text-gi-muted">
              Os módulos estruturam informações essenciais para análise da equipe responsável, sem
              prometer emissão automática de documento oficial.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {modules.map((module) => (
              <div key={module} className="rounded-md border border-gi-line bg-gi-background p-4">
                <FileText className="h-4 w-4 text-gi-gold" aria-hidden={true} />
                <p className="mt-3 text-sm font-semibold text-gi-ink">{module}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="gi-eyebrow">Como funciona</p>
            <h2 className="mt-2 text-2xl font-semibold text-gi-ink">GI Assistido</h2>
            <p className="mt-3 text-sm leading-6 text-gi-muted">
              O usuário autorizado preenche formulário estruturado, anexa documentos, recebe
              protocolo interno e acompanha status. A equipe analisa, solicita complementações e
              disponibiliza documento final após revisão.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {["Solicitação", "Triagem", "Entrega revisada"].map((step) => (
              <div key={step} className="rounded-md border border-gi-line bg-white p-4 shadow-panel">
                <CheckCircle2 className="h-4 w-4 text-gi-gold" aria-hidden={true} />
                <p className="mt-3 text-sm font-semibold text-gi-ink">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gi-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="gi-eyebrow">Público-alvo</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {audiences.map((audience) => (
              <div key={audience} className="rounded-md border border-gi-line bg-gi-background p-4">
                <ClipboardList className="h-4 w-4 text-gi-gold" aria-hidden={true} />
                <p className="mt-3 text-sm font-semibold text-gi-ink">{audience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoPanel({
  icon: Icon,
  title,
  children
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-md border border-gi-line bg-white p-5 shadow-panel">
      <Icon className="h-5 w-5 text-gi-gold" aria-hidden={true} />
      <h2 className="mt-4 text-base font-semibold text-gi-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-gi-muted">{children}</p>
    </article>
  );
}
