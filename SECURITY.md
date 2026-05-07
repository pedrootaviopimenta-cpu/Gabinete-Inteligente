# Política de Segurança

O Gabinete Inteligente trata solicitações administrativas, minutas, documentos, respostas institucionais, notas internas e contextos estruturados como conteúdo confidencial.

## Credenciais e Segredos

Nunca commite `.env.local`, senhas reais, `GI_SESSION_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` ou qualquer credencial operacional. O arquivo `.env.example` deve conter apenas placeholders vazios.

Em produção, use variáveis secretas da hospedagem. Caso senha, chave de sessão, chave Supabase ou chave OpenAI tenha sido exposta, faça rotação imediata do segredo, revise logs de acesso e invalide sessões ativas quando aplicável.

Use senha administrativa forte e troque `GI_SESSION_SECRET` periodicamente em produção. A troca do segredo invalida sessões assinadas anteriormente.

## Acesso Restrito

Não há cadastro público no MVP. O acesso é restrito a usuários autorizados. O administrador sênior inicial é configurado por variáveis privadas de ambiente.

Rotas internas, APIs de solicitações e a rota de IA exigem sessão válida. A resposta externa para acesso não autenticado é genérica: `Acesso restrito a usuários autorizados.`

## Desenvolvimento Local

O fallback `.local-data` é exclusivo para desenvolvimento e deve permanecer fora do Git. Em produção, utilize Supabase ou banco de dados apropriado, com políticas de acesso, auditoria e backup compatíveis com dados sensíveis.
