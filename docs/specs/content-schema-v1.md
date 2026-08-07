# Schema de Conteudo e Historico v1

## Objetivo

Definir um contrato versionado para questoes, catalogos curriculares e sessoes de quiz. O contrato permite publicar novos conteudos por trimestre sem alterar nem classificar por suposicao o acervo e o historico existentes.

## Principios

- IDs, e nao labels de interface, sao a fonte de verdade para filtros e historico.
- Uma sessao registra o acervo e as questoes efetivamente usados no momento da tentativa.
- Uma correcao de conteudo cria uma nova versao do acervo; nao reescreve a evidencia de uma sessao anterior.
- Material-fonte escolar permanece fora do repositorio, conforme `docs/harness/content-update-quality-gates.md`.
- Dados legados continuam legiveis, mas nao recebem trimestre por inferencia.

## Convencoes

| Elemento        | Formato                                                 | Exemplo      |
| --------------- | ------------------------------------------------------- | ------------ |
| `schemaVersion` | string versionada                                       | `content-v1` |
| `contentSetId`  | slug estavel                                            | `2026-t2-v1` |
| `academicYear`  | inteiro de quatro digitos                               | `2026`       |
| `term`          | `t1`, `t2`, `t3` ou `legacy`                            | `t2`         |
| `version`       | versao incremental do acervo                            | `1`          |
| `status`        | `draft`, `pedagogical-approved`, `published`, `retired` | `published`  |

`contentSetId` e imutavel. Se uma questao ou explicacao publicada precisar ser corrigida, deve ser criado um novo acervo, por exemplo, `2026-t2-v2`.

Todo novo acervo deve ter uma spec de cobertura curricular conforme
`docs/specs/curriculum-content-update-governance.md`. A spec declara os temas
e exige 20 questoes aprovadas por tema antes de `status: published`.

## Catalogo curricular

O catalogo declara quais acervos podem ser apresentados ao aluno. O seletor de periodo usa somente catalogos com `status: published`.

```json
{
  "schemaVersion": "content-v1",
  "contentSetId": "2026-t2-v1",
  "academicYear": 2026,
  "term": "t2",
  "version": 1,
  "status": "published",
  "grade": "3-ano",
  "displayName": "2o trimestre de 2026",
  "sourceRef": {
    "referenceId": "escola-2026-t2",
    "section": "Matematica",
    "page": "12"
  }
}
```

`sourceRef` registra uma referencia minima para auditoria. Ele nao deve copiar trechos protegidos nem anexar o arquivo recebido da escola.

## Contrato de questao nova

Toda questao criada ou alterada apos a adocao do contrato deve possuir os campos abaixo.

| Campo               | Regra                                                                   |
| ------------------- | ----------------------------------------------------------------------- |
| `schemaVersion`     | deve ser `content-v1`                                                   |
| `id`                | string unica e imutavel entre todas as fontes carregadas                |
| `contentSetId`      | deve referenciar um catalogo publicado ou em revisao                    |
| `subject` e `topic` | IDs estaveis existentes no catalogo de materia e topico                 |
| `question`          | texto nao vazio, adequado a serie e com resposta unica defensavel       |
| `options`           | quatro alternativas nao vazias e distintas apos normalizacao            |
| `correctIndex`      | inteiro que aponta para uma alternativa valida                          |
| `explanation`       | explica por que a correta atende ao enunciado                           |
| `wrongExplanations` | explicacao para cada indice incorreto quando houver feedback individual |
| `skill`             | habilidade ou objetivo de aprendizagem rastreavel                       |
| `sourceRef`         | referencia minima da fonte e de sua secao ou pagina                     |
| `reviewStatus`      | `draft`, `pedagogical-approved`, `published` ou `retired`               |
| `version`           | inteiro positivo da questao dentro do acervo                            |

`text` e opcional e representa material de apoio, como um texto de interpretacao. `topicName`, `subjectMeta` e labels similares sao apenas apresentacao; filtros e historico nao podem depender deles.

```json
{
  "schemaVersion": "content-v1",
  "id": "mat-t2-medidas-001",
  "contentSetId": "2026-t2-v1",
  "subject": "matematica",
  "topic": "medidas_capacidade_massa",
  "question": "Qual medida usamos para saber quanto liquido cabe em uma garrafa?",
  "options": ["Litro", "Metro", "Hora", "Grama"],
  "correctIndex": 0,
  "explanation": "Litro e uma medida usada para quantidade de liquido.",
  "wrongExplanations": {
    "1": "Metro mede comprimento, nao quantidade de liquido.",
    "2": "Hora mede tempo, nao quantidade de liquido.",
    "3": "Grama mede massa, nao quantidade de liquido."
  },
  "skill": "medidas-de-capacidade",
  "sourceRef": {
    "referenceId": "escola-2026-t2",
    "section": "Matematica",
    "page": "12"
  },
  "reviewStatus": "pedagogical-approved",
  "version": 1
}
```

## Contrato de sessao e historico

Sessoes novas devem usar `session-v2`. Campos de exibicao podem ser derivados, mas a sessao armazena IDs e snapshot suficiente para auditoria.

| Campo                      | Regra                                          |
| -------------------------- | ---------------------------------------------- |
| `schemaVersion`            | deve ser `session-v2`                          |
| `sessionId`                | UUID ou identificador unico por tentativa      |
| `startedAt` e `finishedAt` | data ISO 8601                                  |
| `contentSetId`             | acervo selecionado na abertura da sessao       |
| `contentVersion`           | versao do acervo usado                         |
| `subject` e `topicId`      | IDs estaveis selecionados                      |
| `questionIds`              | lista ordenada das questoes exibidas           |
| `answers`                  | resposta dada, resultado e timeout por questao |
| `score`                    | objeto com `correct`, `total` e `pct`          |
| `durationSec`              | inteiro nao negativo                           |

```json
{
  "schemaVersion": "session-v2",
  "sessionId": "018f9c2b-0000-4000-8000-000000000001",
  "startedAt": "2026-08-07T14:00:00.000Z",
  "finishedAt": "2026-08-07T14:12:00.000Z",
  "contentSetId": "2026-t2-v1",
  "contentVersion": 1,
  "subject": "matematica",
  "topicId": "medidas_capacidade_massa",
  "questionIds": ["mat-t2-medidas-001"],
  "answers": [
    {
      "questionId": "mat-t2-medidas-001",
      "selectedIndex": 0,
      "isCorrect": true,
      "isTimeout": false
    }
  ],
  "score": { "correct": 1, "total": 1, "pct": 100 },
  "durationSec": 720
}
```

## Compatibilidade com acervo e historico legados

Os arquivos de questoes atuais e as sessoes ja persistidas nao serao alterados nesta etapa.

| Origem                                       | Tratamento no contrato | Regra de exibicao                        |
| -------------------------------------------- | ---------------------- | ---------------------------------------- |
| questao sem `schemaVersion` e `contentSetId` | `legacy-content-v0`    | pertence ao acervo `legacy-unclassified` |
| sessao no formato atual do `localStorage`    | `legacy-session-v1`    | exibir como `Acervo anterior`            |
| dado legado sem trimestre comprovavel        | `term: legacy`         | nao mostrar como 1o, 2o ou 3o trimestre  |

A migracao deve ser aditiva e idempotente: ler o formato antigo, apresentar o rotulo seguro e gravar novos campos somente em sessoes criadas depois da migracao. O formato atual do `localStorage` nao pode ser apagado, reclassificado ou convertido destrutivamente.

## Fixtures de referencia para o validador futuro

O item `#107` deve transformar estes casos em fixtures automatizadas.

| Fixture                                                    | Resultado esperado                     |
| ---------------------------------------------------------- | -------------------------------------- |
| questao nova com todos os campos e quatro opcoes distintas | valida                                 |
| `correctIndex` fora do intervalo                           | invalida                               |
| duas opcoes iguais apos normalizacao                       | invalida                               |
| questao publicada sem `sourceRef` ou `reviewStatus`        | invalida                               |
| duas questoes com o mesmo `id`                             | invalida                               |
| sessao `session-v2` sem `contentSetId` ou `questionIds`    | invalida                               |
| sessao antiga sem trimestre                                | legada, exibida como `Acervo anterior` |

## Ordem de implementacao

1. Publicar este contrato sem alterar perguntas existentes.
2. Implementar o validador estrutural em `#107`, com fixtures desta especificacao.
3. Introduzir catalogos e compatibilidade no carregador de conteudo.
4. Implementar a selecao, o filtro de historico e a migracao aditiva em `#110`.
5. Importar um lote curricular somente depois dos gates editoriais e da aprovacao humana.

## Criterio de mudanca

Qualquer alteracao incompatível exige uma nova versao deste documento, uma estrategia de migracao e testes de regressao. Uma nova versao de conteudo nao pode apagar a possibilidade de abrir ou consultar um acervo anterior.
