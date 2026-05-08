import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function TermosDeUsoPage() {
  return (
    <main className="min-h-screen bg-gi-background px-4 py-10 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl rounded-lg border border-gi-line bg-white p-6 shadow-panel sm:p-8">
        <Link href="/" className="gi-button-secondary mb-6 w-fit">
          <ArrowLeft className="h-4 w-4" aria-hidden={true} />
          Voltar
        </Link>
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-6 w-6 text-gi-gold" aria-hidden={true} />
          <div>
            <p className="gi-eyebrow">Gabinete Inteligente</p>
            <h1 className="mt-2 text-3xl font-semibold text-gi-ink">Termos de uso</h1>
          </div>
        </div>

        <div className="mt-8 space-y-6 text-sm leading-7 text-gi-ink">
          <section>
            <h2 className="text-lg font-semibold">1. Natureza do sistema</h2>
            <p className="mt-2">
              O Gabinete Inteligente é ferramenta de apoio administrativo e documental voltada à
              organização de solicitações, análise de informações, produção assistida e gestão de
              fluxos internos em ambiente público municipal.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Ausência de substituição profissional</h2>
            <p className="mt-2">
              O sistema não substitui advogado, procurador, controlador interno, servidor técnico,
              autoridade administrativa ou qualquer profissional competente. O sistema não emite
              decisão administrativa automática, parecer final automático ou orientação vinculante.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. Veracidade e autorização das informações</h2>
            <p className="mt-2">
              O usuário deve inserir apenas informações verdadeiras, pertinentes e que esteja
              autorizado a compartilhar. Documentos, fatos, prazos, normas e anexos devem ser
              conferidos antes de qualquer encaminhamento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. Revisão humana obrigatória</h2>
            <p className="mt-2">
              Toda minuta, rascunho, documento ou resposta elaborada com apoio do sistema depende
              de revisão humana, validação documental e assinatura pela autoridade ou profissional
              competente antes de uso oficial.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. Acesso pessoal e restrito</h2>
            <p className="mt-2">
              O acesso é pessoal, restrito a usuários autorizados e não deve ser compartilhado. O
              administrador poderá bloquear ou revisar acessos quando houver risco, uso indevido ou
              necessidade administrativa.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
