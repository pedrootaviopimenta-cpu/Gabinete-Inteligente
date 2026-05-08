# Modelo de Segurança

## Modelo Atual

O MVP opera com acesso restrito por usuário e senha, sem cadastro público. O administrador sênior inicial é configurado por variáveis privadas:

```env
GI_ADMIN_USERNAME=
GI_ADMIN_PASSWORD=
GI_ADMIN_RECOVERY_EMAIL=
GI_SESSION_SECRET=
```

A sessão é assinada com `GI_SESSION_SECRET` e armazenada em cookie `gi_session` com `httpOnly`, `sameSite=lax`, `path=/`, `maxAge` definido e `secure=true` em produção.

As páginas internas, o painel administrativo, as APIs de solicitações documentais e a rota de IA exigem autenticação. Solicitações, notas internas, contexto estruturado, campos estruturados e texto final são conteúdo confidencial.

O painel do solicitante em `/minhas-solicitacoes` usa visão saneada da solicitação. Ele pode exibir protocolo, título, módulo, status, prioridade, dados enviados, documentos anexos, mensagens públicas, pendências documentais públicas e documento final quando disponível. Não deve exibir notas internas, comentários estratégicos, contexto administrativo reservado ou campos exclusivos de gestão.

Nesta fase MVP, como há apenas a credencial única do administrador sênior configurada por ambiente, o painel do solicitante lista todas as solicitações para teste. A estrutura deve evoluir para filtro obrigatório por `requester_username`, `requester_email` e, preferencialmente, `requester_user_id`, de forma que cada usuário autenticado veja apenas suas próprias solicitações em produção multiusuário.

Mensagens ao solicitante e notas internas devem ser tratadas como categorias diferentes. Registros com `visibility=public` podem ser exibidos ao solicitante. Registros com `visibility=internal` são reservados à equipe responsável e não devem aparecer em APIs ou componentes voltados ao solicitante.

Pendências documentais podem ser exibidas ao solicitante porque representam documentos ou informações necessárias à instrução do pedido. A equipe deve evitar registrar cautelas estratégicas ou notas jurídicas reservadas no campo de pendência; esse conteúdo pertence às mensagens internas ou notas administrativas.

Configurações institucionais em `organization_settings` são protegidas por autenticação. Em produção, a edição deve ser restrita a administradores autorizados e auditável.

## Evolução Planejada

A próxima etapa de usuários autorizados deverá substituir a credencial única por uma tabela `app_users`:

```sql
app_users (
  id uuid primary key,
  username text unique not null,
  password_hash text not null,
  recovery_email text,
  role text not null,
  is_active boolean not null default true,
  created_at timestamptz not null,
  updated_at timestamptz not null
)
```

O hash de senha deve usar `bcrypt` ou `argon2`, nunca texto puro. O painel administrativo poderá permitir que o administrador sênior crie usuários autorizados, bloqueie usuários, redefina senhas, altere papéis de acesso e consulte logs.

## Auditoria e Histórico de Eventos

O modelo inicial já registra eventos relevantes em `document_request_events`, incluindo login, logout, criação de solicitação, alteração de status, mensagens públicas, notas internas, anexos, pendências, edição de texto final e exportação de documento.

Em evolução futura, essa trilha deverá ser ampliada para logs globais de acesso, consulta de detalhe, gestão de usuários, bloqueio de usuário, redefinição de senha, alterações de permissões e geração por IA quando habilitada.

Os logs não devem registrar senhas, segredos, tokens, cookies, chaves privadas ou prompt completo em produção.
