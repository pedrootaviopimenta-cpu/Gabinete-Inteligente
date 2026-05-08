# Deploy Seguro do Gabinete Inteligente

Este checklist prepara o Gabinete Inteligente para publicação em ambiente real, preferencialmente com Vercel, Supabase e Supabase Storage.

## Requisitos

Use Node.js compatível com Next.js 15, repositório Git limpo, acesso administrativo à Vercel, projeto Supabase configurado e domínio com HTTPS.

Antes de publicar:

```bash
npm install
npm run typecheck
npm run build
```

## Variáveis de Ambiente

Configure as variáveis abaixo na Vercel ou na hospedagem. Credenciais reais nunca devem ser gravadas no GitHub.

```env
GI_DELIVERY_MODE=assisted
GI_AI_ENABLED=false
GI_ADMIN_AI_ENABLED=false
GI_ADMIN_USERNAME=
GI_ADMIN_PASSWORD=
GI_ADMIN_RECOVERY_EMAIL=
GI_SESSION_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=
APP_BASE_URL=
```

Use senha forte para `GI_ADMIN_PASSWORD` e segredo longo para `GI_SESSION_SECRET`. Em produção, troque o segredo periodicamente e após qualquer suspeita de exposição.

## Vercel

Crie o projeto, aponte para a branch estável, configure todas as variáveis como secrets do ambiente e confirme que o domínio final utiliza HTTPS. Não envie `.env.local` para o GitHub.

## Supabase

Execute o conteúdo de `database/schema.sql` no banco Supabase. Revise as políticas de Row Level Security antes de liberar uso real. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` somente em ambiente seguro.

## Supabase Storage

Para anexos, use bucket privado. O fallback `.local-data/uploads/` é apenas para desenvolvimento local e não deve ser usado em produção.

## Checklist de Segurança

Confirme antes de publicar:

- senha administrativa forte;
- `GI_SESSION_SECRET` forte;
- `.env.local` não versionado;
- `.local-data` não versionado;
- Supabase RLS revisado;
- APIs protegidas por sessão;
- HTTPS ativo;
- domínio correto;
- headers de segurança presentes;
- login e logout testados;
- acesso sem sessão redireciona para `/login`;
- chamadas API sem sessão retornam `401`;
- anexos protegidos por rota autenticada;
- Modo IA desabilitado para cliente quando `GI_DELIVERY_MODE=assisted`.

## Primeiro Deploy

Após configurar variáveis e banco, publique o deploy. Teste:

1. `/login`;
2. envio de solicitação;
3. protocolo sequencial;
4. painel `/admin/solicitacoes`;
5. anexos;
6. mensagens e pendências;
7. dashboard;
8. cadastro de norma municipal;
9. exportação DOCX quando houver texto final.

## Rollback

Mantenha a branch `main` estável, use commits pequenos e descritivos e, em caso de falha, reverta para o deploy anterior pela Vercel. Quando necessário, reverta o commit problemático e publique novamente após `typecheck` e `build`.
