# Perfis de Usuário e Permissões

O Gabinete Inteligente adota acesso restrito, sem cadastro público. Nesta fase, o usuário autenticado por variáveis privadas de ambiente continua recebendo o perfil `senior_admin`, mas a arquitetura já está preparada para múltiplos usuários autorizados.

## Perfis previstos

### `senior_admin`

Perfil de administração superior. Possui acesso total à plataforma, incluindo configurações institucionais, painel administrativo, solicitações, exportação DOCX, alteração de status, notas internas, pendências, anexos e futura gestão de usuários.

### `admin_operacional`

Perfil destinado à operação administrativa da fila de trabalho. Pode acompanhar solicitações, alterar status, registrar mensagens ao solicitante, controlar pendências e administrar anexos. Não deve gerir usuários nem alterar configurações sensíveis do ambiente.

### `revisor_juridico`

Perfil voltado à revisão técnica ou jurídica. Pode consultar solicitações, visualizar e registrar notas internas, editar texto final, exportar documentos e marcar etapas de revisão. Não substitui procurador, advogado, controlador interno ou autoridade competente.

### `servidor_solicitante`

Perfil destinado ao usuário autorizado que encaminha demandas ao GI Assistido. Pode criar solicitações, visualizar suas próprias solicitações, anexar documentos e responder pendências documentais.

### `usuario_consulta`

Perfil de consulta restrita. Pode visualizar apenas solicitações próprias e respectivos documentos finais disponibilizados, sem acesso a notas internas ou funções administrativas.

## Centralização no código

As regras de autorização ficam concentradas em `src/lib/permissions.ts`, com funções como:

`canAccessAdmin()`, `canManageRequests()`, `canEditFinalDocument()`, `canViewInternalNotes()`, `canManageUsers()`, `canViewOwnRequests()` e `canUploadAttachments()`.

Essa concentração evita espalhar decisões de permissão pela interface e pelas rotas. À medida que o sistema evoluir para usuários em banco de dados, as APIs e componentes devem consultar essas funções antes de expor ações, campos internos ou recursos administrativos.

## Evolução futura

A evolução natural é criar uma tabela `app_users`, com `username`, `password_hash`, `recovery_email`, `role`, `is_active`, datas de criação e atualização, bloqueio de acesso, redefinição de senha pelo administrador e trilha de auditoria de autenticação.

Não haverá cadastro público no MVP. Todo acesso deverá ser criado ou autorizado por administrador competente.
