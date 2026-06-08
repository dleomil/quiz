# Guia do GitHub Project

## Objetivo

Explicar como o board funciona, qual e o significado de cada tipo de item e como criar novas tarefas sem perder contexto.

## Quando usar este guia

Use este documento sempre que precisar criar, classificar ou publicar uma nova issue no GitHub Project.

## Contexto do board

O GitHub Project e o quadro oficial de execucao do produto. Ele organiza o trabalho em andamento, mas nao substitui os documentos de backlog, produto e arquitetura.

Os documentos do repositorio continuam sendo a fonte de verdade para:

- escopo de produto
- definicoes tecnicas
- roadmap
- criterio de aceite

## Tipos de item

### Epic

Use `Epic` para capacidades grandes que agrupam varias historias relacionadas.

Exemplos:

- fundacao de engenharia
- governanca de conteudo
- painel de controle

### Story

Use `Story` para entregas pequenas e incrementais, com valor claro para o produto.

Exemplos:

- definir modo escuro legivel
- criar baseline de testes
- mapear limites da Vercel

### Tech Task

Use `Tech Task` para trabalho tecnico derivado de uma story, de um epic ou de uma necessidade operacional.

Exemplos:

- ajustar workflow de CI
- atualizar `.gitignore`
- documentar o uso do board

### Spike

Use `Spike` quando o objetivo principal for investigar e produzir uma decisao tecnica, nao implementar.

### Bug

Use `Bug` para defeitos observados em comportamento existente.

## Labels padrao

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

## Colunas do board

- `Backlog`: item registrado mas ainda nao pronto para execucao
- `Ready`: item refinado e pronto para iniciar
- `In Progress`: item em desenvolvimento ou em analise ativa
- `In Review`: item aguardando revisao ou validacao final
- `Blocked`: item impedido por dependencia ou decisao externa
- `Done`: item concluido e fechado

## Como criar um item novo

1. Defina se o item e `Epic`, `Story`, `Tech Task`, `Spike` ou `Bug`.
2. Escreva objetivo, contexto e criterios de aceite.
3. Aplique os labels corretos de tipo, area e prioridade.
4. Vincule o item ao milestone de fase, quando fizer sentido.
5. Adicione o item ao GitHub Project.
6. Mova o item para a coluna apropriada conforme o estado real.

## Checklist rapido

Antes de publicar uma tarefa no board, confirme:

- o item tem tipo correto
- o item tem area correta
- a prioridade foi definida
- o texto nao expõe segredo, dado sensivel ou detalhe operacional desnecessario
- o criterio de aceite permite saber quando o trabalho terminou
- o item foi colocado na coluna certa do board

Se faltar mais de uma dessas respostas, o item ainda esta em refinamento.

## Regras de qualidade

- Nao misturar descoberta, implementacao e rollout no mesmo item quando isso prejudicar entregas pequenas.
- Nao expor credenciais, segredos ou detalhes sensiveis nas descricoes.
- Toda tarefa deve referenciar o backlog, o produto ou a arquitetura.
- Evidencias de teste devem ficar no proprio card quando houver validacao.

## Exemplo rapido

Para uma melhoria de seguranca:

- crie um `Tech Task`
- use `area: security`
- defina prioridade baixa ou media conforme o risco
- descreva a validacao esperada
- mova para `In Progress` apenas quando houver trabalho ativo

## Relacao com a documentacao

- `docs/product/` explica o por que
- `docs/architecture/` explica o como
- `docs/roadmap/` explica a ordem
- `docs/backlog/` explica o que deve entrar no board
- este guia explica como publicar e operar tarefas no board
