# Contrato de Auditoria de Qualidade de Conteudo v1

## Objetivo

Registrar uma auditoria completa e rastreavel de um acervo antes de alteracoes
editoriais. O relatorio evidencia a versao exata avaliada, a cobertura por
questao, as passagens sequenciais e a decisao humana sobre os achados.

## Interface

O contrato fechado esta em `config/content-quality-audit.schema.json`. O comando
`npm run validate:content-audit -- --input <relatorio> [--content-set-id <id>]`
compara cobertura e hash com as questoes versionadas no repositorio.

O relatorio usa `content-quality-audit-v1`, inclui `contentSetId`, SHA-256
deterministico do conteudo, modo de revisao e status de rascunho/final:

- `curriculum-factual`, pelo papel `content_curator`;
- `pedagogical-linguistic`, pelo papel `pedagogical_quality`.

Na fase atual, o mesmo agente executa as duas passagens sequencialmente. O
relatorio registra `reviewMode: single-agent-sequential` e o mesmo `actorId`;
essas passagens nao sao independentes. Um rascunho pode conter cobertura parcial
e achados pendentes para permitir checkpoints. O relatorio final exige os dois
papéis em todas as questoes, resolucao de cada achado, hashes de V1 e V2 e
aprovacao humana do responsavel atual. A exigencia de revisao por outra pessoa
deve ser reavaliada quando a equipe crescer.

Achados corrigidos apontam para a questao correspondente em V2 (`2026t2v2_`
mais o ID original) e para evidencia verificavel. Para o T2 de 2026, V2 e
materializada de forma deterministica a partir de V1: correcoes editoriais sao
aplicadas sem alterar V1, e as alternativas sao reordenadas para distribuir a
resposta correta em 5/5/5/5 por tema. Achados descartados exigem
referencia que justifique a decisao. Decisoes automatizadas nao substituem a
aprovacao humana.

A aprovacao final e registrada apenas pelo responsavel, depois de inspecionar o
relatorio e a V2, com `npm run approve:content-audit -- --actor-id <id>
--approved-at <AAAA-MM-DD> --evidence-ref <registro>`. O comando exige cobertura
completa, hashes atuais, nenhum achado pendente e um ator diferente do agente
que executou as passagens. Sem essa aprovacao, o relatorio permanece `draft` e
o gate de PR bloqueia a integracao.

## Categorias e severidade

Categorias: correcao factual, alinhamento curricular, resposta unica defensavel,
linguagem, adequacao etaria, qualidade de distratores, qualidade de explicacoes,
inclusao/seguranca e distribuicao de respostas.

Severidades: `blocking`, `major` e `minor`. Uma ausencia de achado em ferramenta
deterministica nao prova qualidade; questoes continuam sujeitas a julgamento
editorial e humano.

## Protecao e versionamento

Referencias podem apontar para o programa curricular local ou fontes
institucionais/primarias em HTTPS. O relatorio nao pode conter transcricao da
fonte escolar, texto integral de questoes ou dados pessoais.

O hash vincula as revisoes ao snapshot do acervo. Alterar questoes publicadas
exige novo `contentSetId`; sessoes existentes mantem o identificador original.
