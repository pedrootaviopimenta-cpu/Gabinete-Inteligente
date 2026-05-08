# Plano Futuro de Busca Semântica Normativa

Este documento descreve a evolução prevista para transformar a Base Normativa Municipal em mecanismo de apoio documental com busca semântica, preservando cautela institucional e conferência humana.

## Objetivo

Permitir que leis, decretos, portarias, resoluções e demais atos municipais cadastrados sejam consultados por assunto, trecho, vigência, relação com solicitações e pertinência temática, sem inventar norma e sem afirmar vigência sem validação em fonte oficial.

## Arquitetura Prevista

### 1. Chunking

O texto integral das normas deverá ser dividido em trechos menores, com preservação de referência mínima: espécie normativa, número, ano, artigo, parágrafo, inciso, ementa, assunto e fonte oficial.

### 2. Embeddings

Cada trecho poderá receber embedding gerado server-side. Chaves de IA não deverão ser expostas ao cliente. O conteúdo enviado para geração de embedding deve ser limitado ao necessário.

### 3. pgvector

Em ambiente Supabase/PostgreSQL, a extensão `pgvector` poderá armazenar vetores vinculados aos trechos normativos, permitindo busca por similaridade semântica.

### 4. Citação de Trechos

Toda resposta baseada na base normativa deverá citar trechos ou referências internas cadastradas, distinguindo texto da norma, resumo administrativo e observação do usuário.

### 5. Controle de Vigência

O sistema deverá indicar quando a norma possui `revoked_at`, vigência futura ou ausência de confirmação. Nenhum fluxo deve afirmar vigência normativa sem conferência em diário oficial, portal legislativo ou fonte oficial competente.

## Cuidados Obrigatórios

O sistema não deve inventar leis, artigos ou jurisprudência. Quando a base não contiver norma pertinente, a resposta deve informar a ausência de registro suficiente. O uso oficial depende de revisão humana por profissional, servidor ou autoridade competente.
