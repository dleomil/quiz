# Modelo Operacional do GitHub Project

## Objetivo

Usar o GitHub Project como board oficial de execucao, mantendo os documentos do repositorio como fonte de verdade para requisitos e definicoes tecnicas.

## Local recomendado

- Documentacao viva: `docs/`
- Operacao do repositorio: `.github/`
- Execucao do backlog: GitHub Issues + GitHub Project

## Estrutura recomendada do board

Criar um GitHub Project com as seguintes colunas:

- `Backlog`
- `Ready`
- `In Progress`
- `In Review`
- `Blocked`
- `Done`

## Tipos recomendados de item

- `Epic`
- `Story`
- `Tech Task`
- `Spike`
- `Bug`

## Campos recomendados no Project

- `Type`
- `Priority`
- `Status`
- `Area`
- `Phase`
- `Risk`
- `Owner`
- `Target Milestone`

## Labels recomendadas

### Tipo

- `type: epic`
- `type: story`
- `type: tech-task`
- `type: spike`
- `type: bug`

### Area

- `area: architecture`
- `area: frontend`
- `area: content`
- `area: platform`
- `area: analytics`
- `area: security`
- `area: accessibility`
- `area: product`

### Prioridade

- `priority: p0`
- `priority: p1`
- `priority: p2`
- `priority: p3`

### Estado auxiliar

- `blocked`
- `needs-refinement`
- `ready-for-dev`
- `ready-for-review`

## Regra de governanca

1. Todo item do board deve nascer de um documento em `docs/backlog/` ou referenciar claramente um requisito em `docs/product/` e `docs/architecture/`.
2. Nenhuma issue deve misturar descoberta, implementacao e rollout se isso impedir entrega pequena.
3. Epicos devem representar capacidades, nao tarefas tecnicas isoladas.
4. Historias devem caber em mudancas pequenas e sustentaveis.
5. Mudancas em `main` e `develop` devem ocorrer apenas por Pull Request aprovado.

## Estrutura recomendada para milestones

- `Fase 1 - Fundamentos`
- `Fase 2 - Modularizacao`
- `Fase 3 - Conteudo`
- `Fase 4 - Persistencia`
- `Fase 5 - Seguranca e Operacao`
- `Fase 6 - Prontidao Comercial`

## Relacao entre documentos e board

- `docs/product/` define o por que
- `docs/architecture/` define o como
- `docs/roadmap/` define a ordem
- `docs/backlog/` define o que entra no board
- GitHub Project organiza execucao e acompanhamento
