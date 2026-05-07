# Segurança, Sigilo e Privacidade

O Gabinete Inteligente trata solicitações administrativas, documentos, respostas ao Ministério Público, pareceres preliminares, notas internas, contexto estruturado e texto final como conteúdo confidencial.

## Credenciais e Variáveis de Ambiente

Nunca commite `.env.local`, `.local-data`, `document_requests.json`, senha real, `GI_SESSION_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, cookies, tokens ou qualquer segredo operacional.

O arquivo `.env.example` deve conter somente placeholders vazios. Credenciais reais devem ficar apenas em `.env.local` no desenvolvimento ou em variáveis secretas da hospedagem em produção.

Se uma senha, chave Supabase, chave OpenAI, cookie ou `GI_SESSION_SECRET` for exposto, faça rotação imediata do segredo, troque a senha, invalide sessões quando aplicável e revise logs de acesso.

Use senha forte para o administrador sênior e troque `GI_SESSION_SECRET` periodicamente em produção. A troca de `GI_SESSION_SECRET` invalida sessões assinadas anteriormente.

## Acesso Restrito

Não há cadastro público no MVP. O acesso é restrito a usuários autorizados, com credenciais fornecidas pelo administrador responsável.

A rota `/login` é a única entrada pública interativa. Usuários autenticados em `/login` devem ser redirecionados para `/dashboard`. Páginas internas, painel administrativo, solicitações documentais e APIs sensíveis exigem sessão válida.

## Dados Confidenciais

Solicitações, campos estruturados, contexto estruturado, notas internas, texto final, URL de documento final e informações de setores municipais não devem ser expostos sem autenticação.

As APIs devem retornar mensagens genéricas, sem stack trace, segredos, cabeçalhos, cookies, prompts completos ou erros brutos de provedores externos.

## Persistência Local

O diretório `.local-data` é fallback exclusivo de desenvolvimento. Nunca commite `.local-data` ou `document_requests.json`. Em produção, use Supabase ou banco apropriado, com controle de acesso, auditoria e backup compatíveis com dados sensíveis.
