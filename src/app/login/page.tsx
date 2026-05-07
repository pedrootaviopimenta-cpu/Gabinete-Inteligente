import { redirect } from "next/navigation";
import { Building2, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LoginPage() {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gi-background">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden bg-gi-navy p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gi-gold/40 bg-white/10 text-gi-gold">
                <Building2 className="h-6 w-6" aria-hidden={true} />
              </div>
              <div>
                <p className="text-lg font-semibold">Gabinete Inteligente</p>
                <p className="text-sm font-medium text-gi-gold">Acesso institucional</p>
              </div>
            </div>

            <div className="mt-20 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-gi-gold">
                Plataforma restrita
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight">
                Governança documental para a Administração Pública municipal.
              </h1>
              <p className="mt-5 text-base leading-7 text-white/75">
                Ambiente reservado a usuários autorizados para gestão de solicitações,
                produção documental assistida e revisão humana obrigatória.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/72">
            Não há cadastro público. O administrador responsável fornece credenciais aos usuários
            autorizados e controla o acesso ao sistema.
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="gi-panel overflow-hidden">
              <div className="border-t-4 border-gi-gold p-6 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gi-gold/35 bg-gi-gold/10 text-gi-navy">
                  <ShieldCheck className="h-6 w-6" aria-hidden={true} />
                </div>
                <h2 className="mt-5 text-3xl font-semibold text-gi-ink">
                  Gabinete Inteligente
                </h2>
                <p className="mt-3 text-base leading-7 text-gi-muted">
                  Acesso restrito à plataforma institucional.
                </p>
                <p className="mt-3 text-sm leading-6 text-gi-muted">
                  Informe suas credenciais autorizadas para acessar o ambiente de solicitações e
                  gestão documental.
                </p>

                <LoginForm />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
