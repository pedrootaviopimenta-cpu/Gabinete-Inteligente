# Checklist Manual de Segurança

Antes de publicar ou demonstrar o Gabinete Inteligente, execute as verificações abaixo.

1. Acessar `/admin/solicitacoes` sem login deve redirecionar para `/login?next=/admin/solicitacoes`.
2. Acessar `/oficios`, `/ministerio-publico`, `/pareceres`, `/normas-municipais`, `/checklists`, `/dashboard`, `/configuracoes` e `/minhas-solicitacoes` sem login deve redirecionar para `/login`.
3. Chamar `GET /api/document-requests` sem cookie deve retornar `401` e `{ "error": "Acesso restrito a usuários autorizados." }`.
4. Chamar `PATCH /api/document-requests/[id]` sem cookie deve retornar `401` e não deve retornar dados parciais.
5. Login incorreto deve retornar mensagem genérica: `Usuário ou senha inválidos.`
6. Logout deve apagar o cookie `gi_session` e impedir novo acesso sem login.
7. `.env.local` não deve aparecer como arquivo versionável no `git status`.
8. `.local-data` e `document_requests.json` não devem aparecer como arquivos versionáveis no `git status`.
9. `npm run typecheck` deve passar.
10. `npm run build` deve passar.
11. Verifique se nenhum arquivo versionado contém senha real, `GI_SESSION_SECRET`, `OPENAI_API_KEY` ou `SUPABASE_SERVICE_ROLE_KEY`.
12. Confirme que páginas administrativas exibem aviso de conteúdo confidencial.
