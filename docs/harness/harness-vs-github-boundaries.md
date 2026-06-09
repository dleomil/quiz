# Fronteiras entre Harness e Docs GitHub

## Objetivo

Definir de forma objetiva onde cada tipo de conteudo deve viver para evitar duplicidade de autoridade e mistura entre politica e template operacional.

## Regra principal

- `docs/harness/` guarda politicas, guardrails, checklists obrigatorios e contratos operacionais dos agentes.
- `docs/github/` guarda guias praticos, templates e instrucoes operacionais especificas do GitHub.

## O que pertence ao Harness

- preflight dos agentes
- guardrails operacionais
- politica de formatacao de comentarios
- ordem de execucao dos agentes
- aplicacao por papel
- contratos de saida
- regras obrigatorias de validacao

## O que pertence ao GitHub

- guia do board
- guia de bolso do board
- estrategia de branching e entrega
- templates de comentario e corpo de PR/issue
- instrucoes praticas de uso do GitHub Project

## Regra de decisao

Se o documento define uma regra obrigatoria de comportamento, ele pertence ao `harness`.

Se o documento mostra como aplicar essa regra no GitHub ou fornece um template operacional, ele pertence a `docs/github`.

## Exemplos

- `comment-formatting-policy.md` fica no harness.
- `comment-formatting-guide.md` fica no GitHub como guia pratico.
- `pr-issue-body-template.md` fica no GitHub como template operacional.
- `agent-preflight-checklist.md` fica no harness.
- `github-project-guide.md` fica no GitHub.

## Resultado esperado

- menos discussao sobre onde a regra vive
- menos duplicacao entre politica e template
- estrutura de documentos mais clara
- onboarding mais facil para quem for operar o fluxo
