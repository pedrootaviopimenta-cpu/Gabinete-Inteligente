import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";

export default function PoliticaDeConfidencialidadePage() {
  return (
    <main className="min-h-screen bg-gi-background px-4 py-10 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl rounded-lg border border-gi-line bg-white p-6 shadow-panel sm:p-8">
        <Link href="/" className="gi-button-secondary mb-6 w-fit">
          <ArrowLeft className="h-4 w-4" aria-hidden={true} />
          Voltar
        </Link>
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-1 h-6 w-6 text-gi-gold" aria-hidden={true} />
          <div>
            <p className="gi-eyebrow">Gabinete Inteligente</p>
            <h1 className="mt-2 text-3xl font-semibold text-gi-ink">
              Política de confidencialidade
            </h1>
          </div>
        </div>

        <div className="mt-8 space-y-6 text-sm leading-7 text-gi-ink">
          <section>
            <h2 className="text-lg font-semibold">1. Conteúdo confidencial</h2>
            <p className="mt-2">
              Solicitações, anexos, respostas ao Ministério Público, pareceres preliminares,
              documentos internos, notas administrativas, prazos e dados de órgãos municipais são
              tratados como conteúdo confidencial e de uso restrito.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Uso autorizado</h2>
            <p className="mt-2">
              O usuário somente deve acessar, anexar, consultar ou compartilhar informações quando
              possuir autorização funcional, administrativa ou jurídica para tanto.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. Vedação de compartilhamento indevido</h2>
            <p className="mt-2">
              Credenciais, documentos, anexos, rascunhos internos, notas reservadas e links de
              documentos não devem ser compartilhados com terceiros não autorizados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. Revisão e responsabilidade</h2>
            <p className="mt-2">
              A confidencialidade não dispensa conferência técnica, jurídica e administrativa. Todo
              uso oficial de conteúdo produzido ou organizado no sistema depende de revisão humana
              por autoridade ou profissional competente.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
