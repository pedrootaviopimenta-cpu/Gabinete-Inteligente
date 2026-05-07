# Gabinete Inteligente

O **Gabinete Inteligente** é uma aplicação SaaS concebida para apoiar municípios brasileiros na produção, organização, análise e padronização de documentos administrativos, peças de interlocução institucional e minutas jurídicas preliminares.

O sistema nasce com uma premissa inegociável: **não substitui procuradores, advogados, controladores internos, agentes políticos, servidores responsáveis, autoridades administrativas ou qualquer outro profissional legalmente competente**. A plataforma oferece apoio técnico-documental, mas toda minuta, sugestão, parecer preliminar, resposta, ofício ou checklist gerado deve passar por revisão humana obrigatória antes de qualquer uso oficial, assinatura, protocolo, publicação ou encaminhamento.

## Finalidade Institucional

O GI foi estruturado para reduzir retrabalho administrativo, elevar a consistência formal dos documentos municipais e preservar rastreabilidade sobre o uso de recursos de inteligência artificial no ambiente público. A aplicação deve ser compreendida como instrumento auxiliar de gabinete, secretaria, procuradoria, controle interno ou unidade administrativa, nunca como instância decisória autônoma.

## Módulos Iniciais

### Ofícios

Módulo destinado à criação assistida de ofícios, comunicações administrativas, encaminhamentos, solicitações e respostas formais entre órgãos públicos, entidades privadas e cidadãos.

### Ministério Público

Módulo voltado ao apoio na elaboração de respostas administrativas a requisições, recomendações, notificações e solicitações oriundas do Ministério Público, com ênfase na clareza factual, organização documental e preservação da atuação técnica da autoridade competente.

### Pareceres

Módulo para geração de pareceres preliminares, notas técnicas e análises iniciais, sempre com advertência expressa de que a manifestação não substitui parecer jurídico formal, ato decisório ou pronunciamento técnico especializado.

### Normas Municipais

Módulo para organização, catalogação e consulta de leis, decretos, portarias, resoluções, instruções normativas e demais atos municipais, preparando a base para futura busca semântica e recuperação documental.

### Checklists

Módulo para checklists administrativos e processuais, voltados a rotinas de contratação, resposta institucional, tramitação interna, instrução documental e conformidade mínima.

## Modo Inicial do Produto

O GI opera inicialmente em **Modo Assistido**. Nesse modo, o cliente preenche formulários estruturados, informa dados do solicitante e envia uma solicitação de produção documental assistida. O sistema registra os campos, preserva o contexto estruturado, gera protocolo interno e encaminha a demanda para análise humana.

A geração automática por IA permanece preparada no código para evolução futura, mas fica desabilitada para o cliente pelas variáveis:

```env
GI_DELIVERY_MODE=assisted
GI_AI_ENABLED=false
GI_ADMIN_AI_ENABLED=false
```

## Anexos e Documentos de Apoio

O fluxo assistido permite anexar documentos às solicitações depois da geração do protocolo interno. Essa etapa é destinada a ofícios do Ministério Público, processos administrativos, relatórios, contratos, memorandos, leis municipais, imagens, planilhas e demais arquivos de apoio à análise humana.

Os anexos são confidenciais e exigem autenticação para upload, listagem e download. O sistema não expõe o caminho interno de armazenamento ao usuário e não gera URLs públicas para os arquivos no MVP.

Tipos inicialmente permitidos: PDF, DOC, DOCX, PNG, JPEG, XLSX, CSV e TXT. O limite é de 15 MB por arquivo e até 10 documentos por solicitação.

Em desenvolvimento, quando o Supabase Storage não estiver configurado, os arquivos são gravados em `.local-data/uploads/` e os metadados em `.local-data/document_request_attachments.json`. Esse fallback é apenas local, é ignorado pelo Git e não deve ser usado como solução de produção. Para ambiente produtivo, recomenda-se Supabase Storage com bucket privado, variáveis secretas de hospedagem, controle de acesso server-side e política de backup compatível com dados sensíveis.

## Acesso Restrito

O Gabinete Inteligente não possui cadastro público neste MVP. O acesso à plataforma é restrito a usuários autorizados, com autenticação inicial por nome de usuário e senha definidos em variáveis de ambiente.

Configure o administrador inicial no arquivo `.env.local`:

```env
GI_ADMIN_USERNAME=<usuario-administrador>
GI_ADMIN_PASSWORD=<senha-privada-forte>
GI_ADMIN_RECOVERY_EMAIL=<email-auxiliar-de-recuperacao>
GI_SESSION_SECRET=<segredo-longo-aleatorio>
```

Esses valores são exemplos meramente ilustrativos. Credenciais reais, senha administrativa e segredo de sessão devem ficar apenas no `.env.local` ou nas variáveis privadas da hospedagem. Nunca grave senha real, segredo de sessão ou credenciais operacionais no GitHub.

Após iniciar a aplicação, acesse `http://localhost:3000/login` e informe as credenciais autorizadas. Usuários não autenticados são redirecionados para a página de login ao tentar acessar módulos, solicitações administrativas ou APIs protegidas. A sessão é mantida em cookie `httpOnly`, com `sameSite=lax` e `secure=true` em produção.

O e-mail administrativo é campo auxiliar para futura recuperação de senha, não identificador principal de login. Não há cadastro público. O administrador sênior é responsável por controlar quem pode usar o sistema e por fornecer credenciais apenas a usuários autorizados.

Como evolução planejada, a plataforma poderá incluir uma tabela `app_users` com `username`, `password_hash`, `recovery_email`, `role` e `is_active`, usando `bcrypt` para hash de senha. Também está prevista a criação de usuários autorizados pelo administrador sênior, redefinição de senha, níveis de permissão e logs de acesso.

### Modos Planejados

**Modo Assistido:** fluxo atual. Solicitações são registradas, acompanhadas por status e tratadas por equipe humana responsável.

**Modo Híbrido futuro:** poderá permitir apoio de IA em etapas internas, sempre com revisão humana, trilha de auditoria e validação por profissional ou autoridade competente.

**Modo IA futuro:** poderá expor geração controlada mediante configuração expressa, governança, logs e avisos obrigatórios. Esse modo não é o modo inicial do produto.

## Stack Técnica

O projeto utiliza **Next.js**, **TypeScript**, **Tailwind CSS**, **Supabase** e estrutura inicial preparada para integração com a **OpenAI API**. A arquitetura foi organizada para permitir evolução futura em direção a autenticação multi-tenant, auditoria de gerações, exportação DOCX, versionamento de prompts e recuperação documental.

## Execução Local

Crie um arquivo `.env.local` a partir de `.env.example` e informe as credenciais aplicáveis.

```bash
npm install
npm run dev
```

Em seguida, acesse `http://localhost:3000`.

Caso o acesso restrito esteja configurado, a entrada operacional será `http://localhost:3000/login`.

## Banco de Dados

O arquivo [database/schema.sql](database/schema.sql) contém a estrutura inicial para Supabase/PostgreSQL, incluindo organizações, perfis, documentos, solicitações assistidas em `document_requests`, anexos em `document_request_attachments`, logs de geração por IA, normas municipais e checklists.

## Segurança e Governança

A aplicação deve operar com separação entre chaves públicas e privadas, Row Level Security no Supabase, logs de uso de IA quando o modo futuro for habilitado, versionamento de prompts e registro do usuário responsável por cada solicitação ou produção. Nenhuma funcionalidade deve presumir validade jurídica automática do conteúdo produzido.

Leia também [docs/SECURITY.md](docs/SECURITY.md), [docs/SECURITY_MODEL.md](docs/SECURITY_MODEL.md) e [docs/SECURITY_CHECKLIST.md](docs/SECURITY_CHECKLIST.md).

O arquivo `.env.local` e o diretório `.local-data` são ignorados pelo Git. Os fallbacks `.local-data/document_requests.json`, `.local-data/document_request_attachments.json` e `.local-data/uploads/` são apenas para desenvolvimento local; em produção, utilize Supabase, Supabase Storage ou banco e armazenamento apropriados com controles de acesso e auditoria.

## Exportação DOCX

A exportação DOCX é prevista como evolução arquitetural. A estrutura documental inicial já separa metadados, conteúdo e módulos de origem para permitir geração futura de documentos oficiais em formato editável.
