# Templates DOCX Institucionais

## Finalidade

A exportação DOCX do Gabinete Inteligente permite gerar documento Word editável a partir do texto final validado no Modo Assistido. Nesta fase, os documentos são gerados programaticamente, sem arquivos `.docx` de template externos.

## Modelos Lógicos Iniciais

O sistema prepara estruturas para:

- Ofício;
- Resposta ao Ministério Público;
- Parecer preliminar;
- Checklist administrativo;
- Ficha de norma municipal.

Cada exportação deve conter identificação do sistema, módulo, protocolo, título, dados institucionais disponíveis, texto final, aviso de revisão humana e campo de assinatura.

## Identidade Institucional

Os dados cadastrados em `/configuracoes` alimentam cabeçalho, rodapé e assinatura básica. Em produção, a tabela `organization_settings` deverá representar o município, secretaria ou órgão responsável.

## Evolução Planejada

As próximas fases poderão incluir:

- brasão municipal;
- cabeçalho personalizado por município ou secretaria;
- rodapé institucional;
- numeração automática;
- assinatura digital;
- modelos por município;
- margens e estilos próprios por tipo documental;
- modelos DOCX externos versionados;
- campos automáticos para autoridade, procuradoria, controle interno e secretaria competente.

## Cautela Institucional

Todo DOCX exportado é documento de apoio. A utilização oficial depende de revisão, validação e assinatura por autoridade ou profissional competente.
