# Arquitetura

## 1. Síntese Técnica

O Gabinete Inteligente utiliza uma arquitetura web modular baseada em Next.js, TypeScript, Tailwind CSS, Supabase e integração server-side preparada para a OpenAI API. O desenho inicial separa interface administrativa, catálogo de módulos, formulários estruturados, solicitações assistidas, prompts versionados e persistência preparada para auditoria.

## 2. Camadas

### 2.1 Interface

A interface fica em `src/app` e utiliza o App Router do Next.js. O layout administrativo concentra navegação lateral, cabeçalho institucional e área de conteúdo. As páginas de módulo são derivadas de metadados centralizados em `src/lib/modules.ts`.

### 2.2 Componentes

Os componentes em `src/components` foram separados entre estrutura de aplicação, cartões de dashboard, avisos de revisão humana e área de trabalho documental. Essa separação permite reaproveitar o mesmo fluxo de minuta em módulos diferentes.

### 2.3 Inteligência Artificial

A rota `src/app/api/ai/draft/route.ts` permanece preservada para modos futuros. No Modo Assistido, `GI_AI_ENABLED=false` impede a geração automática para o cliente. Quando futuramente habilitada, a chamada à OpenAI API deverá permanecer exclusivamente server-side, sem exposição de `OPENAI_API_KEY`.

### 2.4 Dados

O Supabase/PostgreSQL é preparado pelo arquivo `database/schema.sql`. A modelagem inicial inclui organizações, perfis, documentos, solicitações assistidas em `document_requests`, logs de IA, normas municipais, templates de checklist, itens e execuções.

## 3. Fluxo do Modo Assistido

O usuário acessa um módulo, preenche os dados do solicitante e os campos estruturados do documento. A aplicação envia os dados à rota `src/app/api/document-requests/route.ts`. O servidor valida os campos, monta o contexto estruturado, registra a solicitação em `document_requests`, gera protocolo interno e retorna a confirmação ao cliente.

O painel `src/app/(admin)/solicitacoes/page.tsx` lista as solicitações, permite filtros por status, módulo e prioridade, abre o detalhe, exibe campos e contexto estruturados, permite copiar o contexto, registrar notas internas, alterar status, inserir texto final e marcar a solicitação como concluída.

## 3.1 Fluxos Futuros de IA

O fluxo de IA permanece isolado na rota `/api/ai/draft`. Em modo assistido, essa rota não é exposta na interface e retorna bloqueio para requisições de geração. Em modo híbrido ou IA futuro, deverá ser reativada apenas mediante variáveis de ambiente, auditoria e revisão humana obrigatória.

## 4. Segurança

### 4.1 Segredos

As chaves `OPENAI_API_KEY` e `SUPABASE_SERVICE_ROLE_KEY` devem existir apenas em ambiente server-side. O cliente usa apenas `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 4.2 Row Level Security

O schema inicial habilita RLS nas tabelas sensíveis e cria políticas por organização. A política pressupõe que `profiles.user_id` se vincula a `auth.uid()` e que cada usuário opera dentro de uma organização.

### 4.3 Auditoria

As gerações de IA devem ser registradas com módulo, prompt, modelo, usuário, organização, parâmetros e documento relacionado. Esse registro é essencial para controle interno, revisão humana e responsabilização administrativa.

## 5. Exportação DOCX

A exportação DOCX deve ser implementada como serviço separado, preferencialmente server-side, recebendo conteúdo estruturado e metadados do documento. A tabela `documents` já prevê conteúdo em Markdown e metadados em JSONB para facilitar conversão futura. O arquivo `src/lib/export/docx.ts` fixa o contrato inicial do payload de exportação e mantém a exigência de revisão humana como propriedade obrigatória.

## 6. Convenções

Os módulos devem ser adicionados em `src/lib/modules.ts`, com slug, nome, descrição, prompt e cor institucional. Prompts devem permanecer em arquivos Markdown versionados. Alterações que mudem o comportamento jurídico-administrativo esperado devem ser documentadas e revisadas.
