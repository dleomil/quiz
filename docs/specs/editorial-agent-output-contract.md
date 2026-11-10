# Contrato de Saida dos Agentes Editoriais

## Objetivo

Padronizar resultados do Content Curator e do Pedagogical Quality Agent para
que cada parecer seja rastreavel, validavel e incapaz de autorizar publicacao
sem decisao humana.

## Campos obrigatorios

Antes da saida, a entrada deve declarar `workItemId`, `contentSetId`,
`subjectId`, `topicId`, `grade`, `academicYear`, `term`, `authorizedSkill`,
`sourceRef`, `questionVersion`, `authorizedObjective`, `manifestState`,
`humanFreezeApproval`, `requestedPass` e `sourceStatus`. O manifesto deve estar
`frozen`, o congelamento deve possuir aprovacao humana e a passagem solicitada
deve corresponder ao agente. A revisao pedagogica ou linguistica tambem exige a
proposta completa da questao, com quatro alternativas, resposta, explicacao e
tres feedbacks incorretos indexados pelos indices das alternativas.

`humanFreezeApproval` registra `approvedBy`, `approvedAt` no formato
`AAAA-MM-DD` e `evidenceRef`. Um booleano sem responsavel e evidencia nao atende
ao preflight.

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

Quando `content_curator` retorna `approved` ou `adjustments_required`, a saida
tambem inclui `proposal` completa. Essa mesma estrutura entra na passagem
pedagogica ou linguistica seguinte. Achados devem usar exatamente o `id` da
proposta avaliada.

A proposta deve ser diretamente compativel com `content-v1`, sem envelope
alternativo. O `sourceRef` possui somente `referenceId`, `section` e `topic`; a
proposta nao pode transportar pagina, trecho ou texto da fonte escolar. Os
metadados de ano e trimestre pertencem ao contexto autorizado de entrada e nao
sao duplicados dentro da questao.

O campo `wrongExplanations` e um objeto com exatamente uma mensagem para cada
indice incorreto. A chave deve ser o indice da alternativa, nunca a posicao de
uma lista de feedbacks.

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

Os agentes editoriais declaram uma tabela `mcp_servers` vazia no proprio
adaptador. A execucao protegida ocorre por `scripts/run-editorial-agent.cjs`,
que inicia processo Codex separado com `CODEX_HOME` dedicado ao login ChatGPT
no chaveiro e workspace temporario, sem heranca de ferramentas ou connectors da
sessao pai. Antes da execucao, o runner exige contratos completos aprovados,
flags efetivas sem ferramentas e `codex mcp list --json` vazio. Qualquer
preflight invalido bloqueia; nao ha fallback para API ou copia de credenciais.

O runner recebe `--agent`, `--input`, `--output`, `--work` e `--auth-home`.
A ficha e a preparacao do perfil seguem `agent-context-and-auth.md`. A entrada segue
`config/editorial-agent-input.schema.json` e e um documento com `scenarioId`,
`inputState` e `input`; a saida gravada inclui o mesmo
contexto e o parecer validado em `output`. O runner somente grava a saida apos
validar o contrato completo. O sidecar `<saida>.receipt.json` registra tambem
falhas de preflight e hashes do contexto, sem alterar este schema editorial.

## Delegacao direta para novos lotes de 2026-t3-v2

Para Geografia, Historia, Ingles, Matematica e Ciencias, o coordenador pode
invocar diretamente instancias novas de `pedagogical_quality`, somente leitura,
com uma passagem por instancia. As duas passagens de cada ID exigem instancias
distintas. Nao se exige login dedicado, versao da CLI nem novo aceite de baseline
para este caminho; o congelamento curricular e o aceite editorial humano seguem
obrigatorios. O caminho isolado anterior preserva seu contrato e seus gates.

A evidencia `direct-editorial` registra entrada completa com ate 20 propostas,
objetivo da matriz congelada, serie, referencia autorizada e `checklist` contendo
`question`, `options`, `answer`, `explanation` e `wrongExplanations`.
A resposta original deve ser preservada integralmente em `originalResponse`
no relatorio `direct-editorial-report-v1`, sem reescrita ou aprovacao sintetizada.
Ela e JSON com `output` no contrato editorial e `results`, uma entrada por ID,
com `questionId`, `decision`, `findings`, `doubts` e `checks` contendo uma
justificativa textual para cada item do checklist, inclusive na passagem linguistica.

O relatorio inclui `input`, `agent`, `agentInstanceId`, `runId`, `pass`,
`completedAt`, `testOnly: false` e `sha256` calculado sobre todos os outros campos
com JSON canonico. A execucao aponta `originalReportPath` e
`originalReportSha256`, repete os metadados e registra `questionSha256s` de todas
as propostas. A evidencia compara entrada, resposta e hashes com as questoes
atuais. Arquivo ausente, cobertura parcial, instancia repetida entre passagens,
achado aberto ou proposta divergente bloqueiam a entrega. Revisoes inalteradas
permanecem validas por hash individual; alteracoes exigem nova revisao dos IDs
afetados. Estes registros comprovam rastreabilidade documental e nao constituem
recibos de CLI nem prova de isolamento. Nunca inventar identidade ou resposta.

## Procedimento delegado para materias pendentes

A partir da aprovacao do procedimento de 2026-11-10, Historia, Ingles,
Matematica e Ciencias de 2026-t3-v2 podem usar curadoria direta em lotes de ate
20 propostas. A primeira curadoria cobre 20 questoes; a unica rodada de
correcao retorna somente IDs alterados. O contrato individual permanece
obrigatorio. A saida usa output.proposals e e verificada por direct-curation.
A captura original de content_curator produz direct-curation-report-v1;
nao constitui revisao pedagogica ou linguistica.

A autoridade humana e exercida pela delegacao aprovada do procedimento e pelo
comando que inicia cada materia. O campo humanApprovalRequired continua true:
pareceres de agentes nao concedem autoridade de publicacao. O gate satisfaz a
exigencia por record.approval.kind delegated, delegationId cadastrado,
sourceSha256 exato, executionId e referencia real do comando. Nao registrar
approvedBy nesse objeto nem simular comentario humano. Lotes recuperados ficam
fora desse procedimento. O caminho editorial anterior conserva seu contrato.

O pacote completo e descrito em .github/subject-delivery.json e validado por
scripts/subject-verification.cjs. O mesmo comando verify:local e usado localmente
e no CI. A selecao por materia bloqueia alteracoes de infraestrutura ou de
outras disciplinas. Os dados da materia candidata alimentam a verificacao
visual por IDs, sem carregar o acervo local das outras materias para comparar
conteudo. Duas passagens independentes continuam obrigatorias; hashes de IDs
inalterados preservam revisoes. A autoria tambem deve ser distinta da revisao.
