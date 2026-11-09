# Contrato de entrega editorial: T3 e proximos acervos

O contrato protege lotes novos, alterados ou publicados pela primeira vez a
partir de 2026 T3. Nao exige reauditoria de lotes intocados. T1/T2 ficam fora
deste novo fluxo. O contrato esta habilitado nas seis materias. O cadastro fica em `config/content-delivery-policy.json`.

## Etapas e requisitos

| Etapa      | Evidencia obrigatoria                                                                                                   | Bloqueio                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Rascunho   | Contrato content-v1, cobertura do tema, IDs unicos, habilidade, explicacao e tres feedbacks; apoio especifico em Ingles | Estrutura invalida, lacuna perdida, apoio generico ou resposta inglesa reproduzida no apoio |
| Revisado   | Duas passagens separadas por questao, pedagogica e linguistica, com proposta e hash atuais, requisitos e evidencias     | Parecer ausente, repetido, ficticio, de outro pacote ou com pendencias                      |
| Publicavel | Rascunho e runtime correspondentes, revisoes validas, evidencia visual e aceite editorial humano do hash exato          | Qualquer divergencia ou autorizacao generica de implementacao                               |

As regras de idioma e de vazamento sao verificacoes limitadas de padroes
conhecidos. Elas complementam a revisao semantica; nao certificam qualquer
traducao. Instrucao equivalente pode se repetir em questoes diferentes.

`npm run validate:delivery` compara o workspace completo (incluindo alteracoes
nao commitadas) com `origin/develop` (ou `origin/main` em branches de release/hotfix). Sem referencia remota, usa o commit de ativacao como fallback. Para uma entrega, usar:

```sh
npm run validate:delivery -- --base-ref origin/develop --head-ref WORKTREE
node scripts/content-delivery.cjs --base-ref origin/main --head-ref HEAD
```

No CI a comparacao usa os snapshots da base e do head real do PR. A etapa e
inferida do conteudo, nunca de uma label. Um rascunho novo corresponde a curadoria e pode permanecer com
revisao pendente; isso nao autoriza implementacao no runtime; altera-lo nao publica a mudanca. Publicar pela primeira vez
conteudo anteriormente preparado tambem exige o novo contrato.

## Pacote e revisoes

O lote e identificado por `contentSetId/subject/topic`. Seu SHA-256 ordena as
questoes por ID e as chaves dos objetos. Apenas `reviewStatus` e normalizado
para `draft`; `topicName` ausente no rascunho e preenchido com o nome cadastrado
no runtime. Outros textos, respostas, versoes e metadados entram no hash.

O registro fica em `docs/editorial/<acervo>--<materia>--<tema>.json`:

```json
{
  "schemaVersion": "content-delivery-v1",
  "batch": "2026-t3-v1/ingles/present-continuous",
  "sourceSha256": "<sha256-do-pacote>",
  "testOnly": false,
  "requirements": [
    {
      "id": "structure",
      "verification": "automatic",
      "evidence": "<resultado-do-validador>"
    },
    {
      "id": "curriculum",
      "verification": "pedagogical",
      "evidence": "<mapa-curricular>"
    },
    { "id": "language", "verification": "linguistic", "evidence": "<parecer>" },
    {
      "id": "english-support",
      "verification": "linguistic",
      "evidence": "<correspondencias-en-pt>"
    },
    { "id": "feedback", "verification": "pedagogical", "evidence": "<parecer>" }
  ],
  "reviews": [
    {
      "questionId": "<id>",
      "pass": "pedagogical",
      "evidencePath": "docs/editorial/<execucao>.json"
    }
  ],
  "visual": {
    "sourceSha256": "<sha256-do-pacote>",
    "test": "content-delivery-ui",
    "evidenceRef": "<execucao-ou-evidencia-visual>"
  },
  "approval": {
    "kind": "editorial",
    "sourceSha256": "<sha256-do-pacote>",
    "approvedBy": "dleomil",
    "evidenceRef": "https://github.com/dleomil/quiz/issues/<numero>#issuecomment-<id>"
  }
}
```

O exemplo e incompleto: cada ID exige exatamente uma passagem de cada tipo.
O cadastro define quais requisitos se aplicam a materia. Alterar o pacote
invalida o vinculo das revisoes anteriores; nao se deve editar hashes para
reaproveitar pareceres. Arquivos antigos de auditoria permanecem historicos.

Para cada passagem usar o runner isolado existente:

```sh
node scripts/run-editorial-agent.cjs --agent pedagogical_quality --input <entrada.json> --work <ficha.json> --auth-home <perfil-dedicado> --output docs/editorial/<execucao.json> --delivery-package <pacote.json>
```

O pacote contem `questions` completas, com metadados normalizados como acima.
A ficha fixada ao commit, o contexto completo e o perfil ChatGPT dedicado
seguem `agent-context-and-auth.md`. O recibo sidecar preserva as evidencias de
execucao sem alterar registros ou ledgers existentes.
A proposta da entrada segue o contrato editorial existente: sem `topicName`,
com `sourceRef` restrito a `referenceId`, `section` e `topic`. A funcao
`reviewProjection` prepara essa projecao sem transcrever a fonte escolar. O
runner confere a proposta contra o pacote e registra identificador unico,
passagem, horario e hashes da execucao. O modelo recebe somente o contexto
editorial autorizado. O material da escola continua local e protegido.

O runner exige credencial propria, sandbox read-only e preflight sem MCP.
Nao ha fallback para fabricar pareceres quando a execucao falha. O uso de
`--codex-bin` produz recibo `testOnly: true`, rejeitado pelo gate real. Os
recibos fornecem rastreabilidade operacional, nao uma assinatura criptografica
nem prova automatica de qualidade semantica. A revisao humana continua exigida.

## Aceite humano e interface

O gate consulta pela API do GitHub o comentario referenciado, confere autor
humano autorizado e exige esta linha exata, com os valores do pacote:

```text
Aprovo editorialmente o lote <contentSetId/subject/topic> hash <sha256>
```

Uma autorizacao como “pode implementar” nao atende ao aceite editorial. O
responsavel examina o pacote completo e os achados antes de emitir esse aceite.
A autorizacao de release continua separada.

O CI executa os testes visuais por IDs de todos os lotes publicados novos ou
alterados. Para repetir localmente ou no destino publicado:

```sh
node scripts/content-delivery.cjs --base-ref origin/main --head-ref HEAD > /tmp/content-delivery.json
CONTENT_DELIVERY_RESULT=/tmp/content-delivery.json npm run test:ui:content-delivery
BASE_URL=https://quiz-lilac-theta.vercel.app CONTENT_DELIVERY_RESULT=/tmp/content-delivery.json npm run test:ui:content-delivery
```

Antes do aceite, e possivel conferir o candidato em modo preview, mesmo que
o resultado do gate ainda indique revisoes ou aceite pendentes:

```sh
CONTENT_DELIVERY_RESULT=/tmp/content-delivery.json npm run test:ui:content-delivery -- --preview
```

Esse modo exige estrutura valida e correspondencia entre IDs, hash e conteudo
carregado. Ele produz evidencia visual identificada como preview e nao dispensa
nenhum bloqueio editorial de publicacao. O JSON de selecao continua sendo gerado
pelo gate; o codigo de saida nao zero informa as pendencias, sem apagar esse JSON.

As capturas e `result.json` ficam no diretorio temporario
`quiz-content-delivery-ui-<identificador>`; `CONTENT_DELIVERY_ARTIFACTS` permite escolher outro
diretorio. A evidencia relaciona hashes, IDs e variantes. No CI, o artefato content-delivery-evidence preserva as capturas e resultados, separando piloto e publicacao. Preview autenticado
inacessivel nao deve ser descrito como conferido.

## Piloto tecnico

`npm run test:delivery` introduz erros em copias temporarias das 20 questoes de
Present continuous. Os pareceres e comentarios usados sao ficticios e ficam
somente nos testes. O CLI de producao nao possui opcao que os habilite.
`npm run test:ui:content-delivery-pilot` verifica as questoes atuais no navegador,
sem altera-las ou republica-las; seu resultado e identificado como teste.

Nao foi realizada nova revisao pedagogica ou linguistica real nesta entrega.
O piloto comprova os bloqueios tecnicos. Merge, publicacao e deploy continuam
sujeitos a autorizacao explicita do mantenedor.

## Adaptadores das seis materias

Os 24 geradores cadastrados aplicam o contrato antes de escrever. Eles nao
produzem pareceres. Os dois publicadores existentes de Matematica e expansao
de Portugues conferem mudancas contra HEAD antes de gravar; uma nova publicacao
ou alteracao exige o pacote editorial. Gerar novamente o mesmo conteudo e uma
operacao idempotente, sem nova exigencia editorial. A comparacao do PR com a
base de destino continua obrigatoria, inclusive para publicacao pela primeira
vez de um lote preparado anteriormente em develop.

O comando `write-t3-matematica-editorial-reports.cjs` agora emite somente um
`technical-diagnostic-v1` na saida padrao. Ele nao grava revisoes nem declara
aprovacao editorial. Os registros antigos nao sao evidencia do contrato novo.

O teste `content-delivery-adapters` executa os geradores em diretorio temporario,
confere seus resultados contra os rascunhos atuais e injeta defeitos em todos
os caminhos para comprovar o bloqueio antes da escrita. Tambem exercita o
contrato em seis materias e em um ciclo futuro ficticio. Novos geradores e
publicadores devem ser cadastrados, instrumentados e incluidos nessa verificacao.

## Recuperação editorial controlada — provas finais de 2026

Para `2026-t3-v2`, uma resposta completa pode originar evidência suplementar
`isolated-editorial-recovered`. O parser geral e o recibo original continuam
registrando a falha; recuperação não transforma a execução em sucesso.

O recuperador offline exige recibo e captura íntegros, processo com código zero,
turno único concluído, resposta final válida, nenhum uso de ferramenta e como
único evento bloqueante a mensagem exata de host de Code Mode desativado antes
do turno. Exige também entrada, ficha, commits, modelo, configuração, schema e
baseline correspondentes. Não chama modelo, não faz login e não usa rede.

A evidência suplementar preserva o runId original e os hashes. Uma chamada não
pode contar como duas passagens. Logs brutos permanecem privados; o relatório
publicável contém o cenário validado, recibo original e vínculos de integridade.
O CI confere os vínculos publicáveis; a verificação dos arquivos privados ocorre
localmente. O relatório não é uma assinatura criptográfica de execução remota.

Curadoria recuperada produz apenas candidata em draft. Questões seguem exigindo
passagens pedagógica e linguística reais e separadas, correção dos achados e
aceite humano do pacote exato. A publicação de revisões recuperadas exige ainda
a linha `Reconheco recuperacao editorial hash <hash-do-conjunto>` no comentário
de aceite, vinculada a `approval.recoveryBundleSha256` e à lista ordenada
`recoveryReports` com caminhos e hashes dos relatórios. A linha de aceite do
pacote continua obrigatória. Acervos anteriores permanecem no contrato original.

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
