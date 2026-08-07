# Manual Operacional dos Agentes

## Objetivo

Consolidar, em uma unica porta de entrada, como operar os agentes do projeto sem substituir os documentos detalhados ja existentes.

## O que este manual faz

- explica a ordem de uso dos agentes
- aponta para o checklist de preflight
- aponta para os templates de comentario e de corpo de PR/issue
- aponta para o fluxo operacional do Reviewer Agent
- aponta para os guardrails do harness

## O que este manual nao faz

- nao substitui os documentos detalhados
- nao redefine o papel de cada agente
- nao muda a governanca do repositorio

## Fluxo resumido

1. Comece pela especificacao.
2. Revise riscos e fronteiras.
3. Implemente o menor passo possivel.
4. Valide contra a spec.
5. Atualize issue, PR e board.
6. Revise o PR com o Reviewer Agent antes do merge.

## Documentos de referencia

- [agent-operating-model.md](agent-operating-model.md)
- [agent-execution-order.md](agent-execution-order.md)
- [agent-preflight-application.md](agent-preflight-application.md)
- [../harness/agent-preflight-checklist.md](../harness/agent-preflight-checklist.md)
- [../harness/agent-operational-guardrails.md](../harness/agent-operational-guardrails.md)
- [../harness/comment-formatting-policy.md](../harness/comment-formatting-policy.md)
- [../harness/harness-vs-github-boundaries.md](../harness/harness-vs-github-boundaries.md)
- [reviewer-agent.md](reviewer-agent.md)
- [reviewer-agent-workflow.md](reviewer-agent-workflow.md)
- [reviewer-agent-comment-template.md](reviewer-agent-comment-template.md)
- [content-curator-agent.md](content-curator-agent.md)
- [pedagogical-quality-agent.md](pedagogical-quality-agent.md)
- [../github/comment-formatting-guide.md](../github/comment-formatting-guide.md)
- [../github/pr-issue-body-template.md](../github/pr-issue-body-template.md)
- [../harness/content-update-quality-gates.md](../harness/content-update-quality-gates.md)

## Como usar no dia a dia

### Para iniciar uma entrega

- localizar a issue ou spec
- confirmar o preflight
- escolher o agente correto
- seguir a ordem de execucao

### Para registrar comentario em PR ou issue

- escrever o conteudo em Markdown real
- usar `--body-file` quando houver mais de uma secao
- seguir o template de comentario ou de corpo

### Para concluir uma entrega

- registrar evidencias
- atualizar o board
- aplicar o parecer do Reviewer Agent
- preservar a trilha no PR e na issue

### Para atualizar conteudo curricular

- confirmar se a fonte pode ser usada e versionada
- criar ou revisar a spec do lote
- usar Content Curator Agent e Pedagogical Quality Agent antes de editar questoes
- exigir aprovacao humana pedagogica antes de publicar

## Resultado esperado

- menos ambiguidade
- onboarding mais simples
- uso consistente dos agentes
- menor risco de desvio operacional
