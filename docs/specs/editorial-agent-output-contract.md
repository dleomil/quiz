# Contrato de Saida dos Agentes Editoriais

## Objetivo

Padronizar resultados do Content Curator e do Pedagogical Quality Agent para
que cada parecer seja rastreavel, validavel e incapaz de autorizar publicacao
sem decisao humana.

## Campos obrigatorios

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
- `adjustments_required` deve conter pelo menos um achado acionavel;
- `blocked` deve registrar pelo menos uma duvida ou achado bloqueante;
- nenhuma decisao substitui revisao ou aprovacao pedagogica humana.

## Seguranca

O resultado nao reproduz fonte escolar protegida, dado identificavel de
crianca, segredo ou credencial. Os agentes operam em `read-only` e nao alteram
conteudo executavel, Git, GitHub, catalogo ou producao.
