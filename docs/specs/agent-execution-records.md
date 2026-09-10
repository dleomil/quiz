# Spec: Registros Estruturados de Execucao dos Agentes

## Objetivo

Definir um contrato validavel para registrar autoria, avaliacao, verificacao e
pesquisa com identidade declarada de ator e execucao, artefato versionado,
evidencias, achados e resultado.

`config/agent-execution-record-set.schema.json` descreve a interface estrutural.
`config/agent-capabilities.json` continua sendo a fonte de verdade para papeis,
capabilities e regras de separacao.

## Contrato `agent-execution-record-set-v1`

Um conjunto possui `schemaVersion` e uma lista nao vazia de `records`. Cada
registro declara:

- `recordId`, `executionId`, `workItemId` e `recordedAt`;
- ator, papel e capability;
- tipo, identidade, versao e referencia do artefato;
- resultado resumido, evidencias e findings;
- `humanDecisionRequired: true`.

IDs de registro e execucao sao unicos no conjunto. Datas de execucao e de
evidencia usam RFC 3339 com fuso horario. O contrato e fechado: campos nao
declarados sao rejeitados.

Identificadores usam somente caracteres ASCII seguros e nao aceitam espaco no
inicio, no fim ou entre componentes. A comparacao de atores tambem ignora
diferenca entre maiusculas e minusculas. Datas impossiveis e URLs que nao sejam
HTTPS validas sao rejeitadas.

## Producao e verificacao

Registros com operacao `author` representam a execucao produtora. Registros com
operacao `review` ou `verify` declaram `subjectExecutionId`, que deve apontar
para uma execucao produtora no mesmo conjunto.

O validador exige:

- regra de separacao correspondente no modelo central;
- capability produtora prevista pela regra;
- mesmo work item, artefato, versao e referencia;
- identificadores de ator distintos.

Assim, as quatro separacoes existentes deixam de depender apenas de texto livre
no preflight. O identificador continua sendo uma declaracao auditavel, nao uma
prova criptografica da identidade. Essa limitacao deve permanecer explicita ate
existir uma camada de identidade confiavel.

## Evidencias e findings

Cada registro possui pelo menos uma evidencia por referencia. O registro pode
incluir hash SHA-256, mas nao incorpora o documento ou a saida referenciada.
Findings apontam para IDs de evidencia do mesmo registro e informam criterio,
severidade, recomendacao e estado.

Um resultado `approved` nao pode manter finding aberto. Parecer de agente,
resultado automatizado ou ausencia de finding nao substitui decisao humana.

## Pesquisa

A capability `product-research` exige ainda:

- pergunta, publico e responsavel pela decisao;
- fontes HTTPS com origem e data de consulta;
- afirmacoes classificadas como fato, inferencia, hipotese ou recomendacao;
- fontes validas para toda afirmacao classificada como fato;
- recomendacao `discard`, `observe`, `research` ou `propose-backlog`;
- nivel de confianca.

O registro informa uma recomendacao ao Product Owner, mas nao cria ou prioriza
backlog.

## Interface operacional

Use:

```sh
npm run validate:agent-records -- --input <arquivo>
```

O utilitario aceita caminho explicito interno ou externo, le somente o arquivo,
nao grava dados e nao reproduz seu conteudo nem detalhes do parser na saida de
sucesso ou erro. Registros com a capability externa `repository-operation` sao
rejeitados.

## Persistencia e seguranca

Nesta versao, somente contrato, utilitario e fixtures ficticias sao
versionados. Registros reais devem ser validados antes de serem registrados no
card ou PR e nao formam ainda um ledger permanente.

Evidencias carregam referencias, nunca texto-fonte escolar, feedback bruto,
dado identificavel de crianca, segredo ou credencial. O schema fechado bloqueia
campos adicionais, mas a revisao humana continua responsavel por impedir dados
sensiveis dentro dos campos textuais permitidos.

Persistencia, exportacao, auditoria e sincronizacao local-first pertencem a uma
entrega posterior. MCP, REST, RBAC, runners e runtime do quiz ficam fora desta
versao.

## Rollback

Reverter o contrato, utilitario, testes e atualizacoes documentais. Nao existe
migracao, persistencia ou impacto em producao.
