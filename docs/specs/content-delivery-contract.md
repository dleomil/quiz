# Contrato de entrega editorial: T3 e proximos acervos

O contrato protege lotes novos, alterados ou publicados pela primeira vez a
partir de 2026 T3. Nao exige reauditoria de lotes intocados. T1/T2 ficam fora
deste novo fluxo. A primeira entrega habilita Ingles; a expansao habilita as
seis materias. O cadastro fica em `config/content-delivery-policy.json`.

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
nao commitadas) com o commit de ativacao. Para uma entrega, usar:

```sh
npm run validate:delivery -- --base-ref origin/develop --head-ref WORKTREE
node scripts/content-delivery.cjs --base-ref origin/main --head-ref HEAD
```

No CI a comparacao usa os snapshots da base e do head real do PR. A etapa e
inferida do conteudo, nunca de uma label. Um rascunho novo pode permanecer com
revisao pendente; altera-lo nao publica a mudanca. Publicar pela primeira vez
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
node scripts/run-editorial-agent.cjs --agent pedagogical_quality --input <entrada.json> --output docs/editorial/<execucao.json> --delivery-package <pacote.json>
```

O pacote contem `questions` completas, com metadados normalizados como acima.
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

As capturas e `result.json` ficam no diretorio temporario
`quiz-content-delivery-ui`; `CONTENT_DELIVERY_ARTIFACTS` permite escolher outro
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
