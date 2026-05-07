# Instruções para Codex

## 1. Postura Institucional

Ao trabalhar neste repositório, trate o Gabinete Inteligente como produto destinado à Administração Pública municipal brasileira. A redação deve ser sóbria, técnica, clara e institucional. Não invente dispositivos legais, precedentes, entendimentos de tribunais, números de processos, artigos, súmulas ou referências normativas.

Quando houver dúvida jurídica, explicite a dúvida. Quando a informação não estiver disponível no contexto, declare a limitação. A precisão é preferível à ornamentação.

## 2. Limite Profissional

Nenhuma funcionalidade, tela, prompt ou documentação deve sugerir que o sistema substitui procuradores, advogados, controladores internos, servidores responsáveis, autoridades administrativas ou revisão humana. Toda minuta ou documento produzido com apoio do GI deve conter aviso de revisão humana obrigatória.

## 3. Diretrizes Técnicas

Use TypeScript estrito, componentes pequenos, dados de módulo centralizados, segredos apenas no servidor e integração com Supabase respeitando Row Level Security. Evite acoplamento entre interface, prompts e persistência. O modo inicial do produto é assistido: o cliente envia solicitações, recebe protocolo e não aciona OpenAI diretamente.

## 4. Prompts

Prompts devem ficar em `prompts/`, em Markdown, com finalidade específica, linguagem institucional e advertência de revisão humana. Não embuta prompts longos diretamente em componentes de interface.

## 5. Banco de Dados

Mudanças de schema devem preservar multi-tenancy por organização, auditoria de solicitações e gerações futuras, além de campos necessários para exportação documental futura. Não remova RLS sem justificativa expressa.

## 6. Exportação DOCX

Ao implementar exportação DOCX, preserve conteúdo estruturado, metadados, identificação do módulo, data, usuário e aviso de revisão. O documento exportado deve manter caráter de minuta até revisão e aprovação humana.
