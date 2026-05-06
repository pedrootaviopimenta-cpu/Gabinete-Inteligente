# Gabinete Inteligente — GI

## 1. Visão do Produto

O Gabinete Inteligente — GI é uma plataforma SaaS de apoio administrativo, documental e jurídico voltada a municípios brasileiros. Seu objetivo é auxiliar equipes públicas na elaboração organizada de minutas, respostas institucionais, ofícios, pareceres preliminares, checklists e estruturas documentais, observados os limites próprios da atuação administrativa e profissional.

O produto não exerce advocacia, não profere decisão administrativa, não substitui análise jurídica individualizada, não substitui controle interno, não substitui parecer técnico e não dispensa a conferência por autoridade competente. Toda saída documental deve preservar aviso claro de revisão humana obrigatória.

## 2. Público-Alvo

### 2.1 Usuários Primários

Secretarias municipais, gabinetes de prefeito, procuradorias municipais, controladorias internas, assessorias administrativas, departamentos de licitação, setores de convênios e servidores encarregados de produção documental.

### 2.2 Usuários Secundários

Consultorias jurídicas e administrativas que apoiam municípios, consórcios públicos, câmaras municipais e entidades públicas locais.

## 3. Problema a Resolver

Municípios frequentemente produzem grande volume de documentos formais sob pressão de prazo, com equipes reduzidas, assimetria de informação, histórico documental disperso e ausência de padronização. Esse cenário gera risco de inconsistência, perda de rastreabilidade, respostas incompletas e baixa reutilização de conhecimento institucional.

O GI pretende organizar fluxos de elaboração e revisão, reduzindo a fragmentação documental sem suprimir a responsabilidade técnica, política ou jurídica dos agentes competentes.

## 4. Proposta de Valor

O sistema oferece ambiente único para solicitação e produção assistida de minutas administrativas, respostas institucionais e análises preliminares, com campos estruturados, rastreabilidade, linguagem institucional, módulos especializados e base preparada para consulta normativa municipal.

## 4.1 Modo Assistido

O modo inicial do produto é o **Modo Assistido**. O cliente preenche formulários estruturados, informa dados de contato institucional, prioridade e título administrativo da demanda. O sistema registra a solicitação em `document_requests`, preserva os dados estruturados, gera protocolo interno e permite acompanhamento por status.

Nesse modo, o cliente não aciona geração automática por IA. A produção documental ocorre por análise humana, com possibilidade de notas internas, alteração de status, registro de texto final e marcação de conclusão pela equipe responsável.

Os status operacionais do fluxo assistido são: recebido, em análise, aguardando documentos, em produção, em revisão, concluído e cancelado.

## 4.2 Modos Futuros

O **Modo Híbrido** poderá permitir apoio de IA em ambiente interno, sem exposição direta ao cliente, com logs, validação humana e controle de acesso.

O **Modo IA** poderá permitir geração automática controlada, apenas se expressamente habilitado por configuração, governança e revisão humana obrigatória.

## 5. Princípios Funcionais

### 5.1 Revisão Humana Obrigatória

Toda minuta gerada deve conter aviso explícito de revisão humana. O sistema deve impedir que conteúdos gerados sejam apresentados como atos oficiais finais.

### 5.2 Rastreabilidade

Cada solicitação deve registrar solicitante, unidade, módulo, prioridade, campos estruturados, contexto, protocolo, status e eventual documento final. Em modos futuros com IA, cada geração também deve registrar prompt, modelo, parâmetros relevantes e documento resultante.

### 5.3 Modularidade

Os módulos devem ser isoláveis, permitindo evolução independente de prompts, telas, permissões, integrações, exportação DOCX e regras de validação.

### 5.4 Segurança Institucional

O sistema deve proteger dados públicos sensíveis, informações pessoais, documentos internos e credenciais de API. As chaves privadas nunca devem ser expostas ao cliente.

## 6. Módulos

### 6.1 GI Ofícios

Permite criar ofícios, comunicações e encaminhamentos administrativos. Deve orientar a redação por órgão remetente, destinatário, assunto, fundamento administrativo, providência solicitada e prazo.

### 6.2 GI Ministério Público

Auxilia respostas a requisições, recomendações e notificações do Ministério Público. Deve privilegiar cronologia, fatos comprováveis, providências adotadas, documentos anexos e ressalva de revisão pela autoridade competente.

### 6.3 GI Pareceres

Gera pareceres preliminares, notas técnicas e análises iniciais. Deve exigir indicação de fatos, dúvida submetida, documentos disponíveis, legislação conhecida e limites da análise.

### 6.4 GI Normas Municipais

Organiza normas municipais, com metadados de espécie normativa, número, ano, ementa, tema, órgão emissor, vigência e fonte. Em fase futura, poderá oferecer busca semântica, vínculos entre normas e alertas de revogação.

### 6.5 GI Checklists

Permite criação e execução de checklists administrativos por assunto, com registro de itens cumpridos, pendências, responsáveis e evidências documentais.

## 7. Requisitos Não Funcionais

O produto deve adotar TypeScript estrito, organização modular, autenticação e autorização via Supabase, Row Level Security, logs de auditoria, segregação por organização, variáveis de ambiente para segredos, componentes reutilizáveis e design administrativo sóbrio.

## 8. Evoluções Planejadas

Exportação DOCX, upload e indexação de documentos, busca semântica em normas municipais, fluxo de aprovação, controle de versões de documentos, trilha de revisão humana, integração com armazenamento Supabase e modelos específicos por módulo.
