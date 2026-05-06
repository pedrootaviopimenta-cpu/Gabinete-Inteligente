# Arquitetura

## 1. Síntese Técnica

O Gabinete Inteligente — GI utiliza uma arquitetura web modular baseada em Next.js, TypeScript, Tailwind CSS, Supabase e integração server-side com a OpenAI API. O desenho inicial separa interface administrativa, catálogo de módulos, prompts versionados, rota de geração assistida e persistência preparada para auditoria.

## 2. Camadas

### 2.1 Interface

A interface fica em `src/app` e utiliza o App Router do Next.js. O layout administrativo concentra navegação lateral, cabeçalho institucional e área de conteúdo. As páginas de módulo são derivadas de metadados centralizados em `src/lib/modules.ts`.

### 2.2 Componentes

Os componentes em `src/components` foram separados entre estrutura de aplicação, cartões de dashboard, avisos de revisão humana e área de trabalho documental. Essa separação permite reaproveitar o mesmo fluxo de minuta em módulos diferentes.

### 2.3 Inteligência Artificial

A rota `src/app/api/ai/draft/route.ts` recebe dados do módulo, carrega o prompt correspondente em `prompts/`, envia a solicitação à OpenAI API no servidor e devolve o texto gerado com aviso obrigatório de revisão humana. O cliente nunca acessa `OPENAI_API_KEY`.

### 2.4 Dados

O Supabase/PostgreSQL é preparado pelo arquivo `database/schema.sql`. A modelagem inicial inclui organizações, perfis, documentos, logs de IA, normas municipais, templates de checklist, itens e execuções.

## 3. Fluxo de Geração

O usuário acessa um módulo, descreve o contexto administrativo e solicita uma minuta. A aplicação envia os dados à rota interna. O servidor identifica o prompt do módulo, compõe a instrução, chama a OpenAI API, adiciona aviso de revisão humana e, em evolução posterior, registrará a geração em `ai_generation_logs`.

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
