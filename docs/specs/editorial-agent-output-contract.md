# Contrato de Saida dos Agentes Editoriais

## Objetivo

Padronizar resultados do Content Curator e do Pedagogical Quality Agent para
que cada parecer seja rastreavel, validavel e incapaz de autorizar publicacao
sem decisao humana.

## Campos obrigatorios

Antes da saida, a entrada deve declarar `workItemId`, `contentSetId`,
`subjectId`, `topicId`, `grade`, `authorizedObjective`, `manifestState`,
`humanFreezeApproval`, `requestedPass` e `sourceStatus`. O manifesto deve estar
`frozen`, o congelamento deve possuir aprovacao humana e a passagem solicitada
deve corresponder ao agente. A revisao pedagogica ou linguistica tambem exige a
proposta completa da questao, com quatro alternativas, resposta, explicacao e
tres feedbacks incorretos.

| Campo                   | Regra                                                  |
| ----------------------- | ------------------------------------------------------ |
| `agent`                 | `content_curator` ou `pedagogical_quality`             |
| `workItemId`            | card ou identificador ficticio que originou o trabalho |
| `contentSetId`          | acervo avaliado, sem autorizar sua publicacao          |
| `subjectId`             | materia declarada no escopo                            |
| `topicId`               | tema declarado no escopo                               |
| `reviewPass`            | `curation`, `pedagogical` ou `linguistic`              |
| `decision`              | `approved`, `adjustments_required` ou `blocked`        |
| `facts`                 | fatos confirmados, sem inferencias misturadas          |
| `doubts`                | lacunas e ambiguidades ainda abertas                   |
| `findings`              | achados rastreaveis por questao e criterio             |
| `recommendations`       | proximas acoes propostas, sem executa-las              |
| `humanApprovalRequired` | sempre `true`                                          |

Cada achado informa `questionId`, `criterion`, `severity`, `evidence` e
`recommendation`. Severidades permitidas: `blocking`, `major` e `minor`.

## Regras de decisao

- `content_curator` usa somente a passagem `curation`;
- `pedagogical_quality` usa uma passagem `pedagogical` ou `linguistic` por
  invocacao;
- contexto incompleto ou ambiguo nunca pode resultar em `approved`;
- `approved` nao pode conter duvida ou achado aberto;
- `adjustments_required` exige contexto completo e achado nao bloqueante;
- `blocked` exige contexto invalido com duvida ou achado `blocking`;
- nenhuma decisao substitui revisao ou aprovacao pedagogica humana.

## Seguranca

O resultado nao reproduz fonte escolar protegida, dado identificavel de
crianca, segredo ou credencial. Os agentes operam em `read-only` e nao alteram
conteudo executavel, Git, GitHub, catalogo ou producao.

O contrato e fechado: entrada, proposta, saida e achados rejeitam campos nao
declarados. Texto da fonte nao pode ser transportado em campos adicionais como
`sourceExcerpt`, `sourceText` ou equivalentes.
