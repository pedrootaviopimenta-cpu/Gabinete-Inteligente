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

## Auditoria Futura

O modelo futuro deverá registrar logs de acesso e ações sensíveis, incluindo login, logout, criação de solicitação, consulta de detalhe, alteração de status, edição de notas internas, edição de texto final, geração por IA quando habilitada e exportação de documento.

Os logs não devem registrar senhas, segredos, tokens, cookies, chaves privadas ou prompt completo em produção.
