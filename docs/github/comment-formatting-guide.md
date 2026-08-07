# Guia de Uso da Formatação de Comentarios

## Objetivo

Explicar como aplicar, no GitHub, a politica de formatacao definida no harness.

## O que este guia faz

- aponta para a politica oficial em `docs/harness/comment-formatting-policy.md`
- mostra quando usar o template de corpo em `pr-issue-body-template.md`
- explica que comentarios curtos podem ser escritos diretamente em Markdown
- reforca o uso de arquivo temporario ou `--body-file` para textos maiores

## Como usar

1. Se o texto for curto, escreva em Markdown real.
2. Se houver mais de uma secao, use um arquivo temporario ou `--body-file`.
3. Para PRs e issues, use `pr-issue-body-template.md` como base.
4. Para parecer de revisão, use `reviewer-agent-comment-template.md`.

## Anti-padroes

- não escrever `\\n` literal em `--body`
- não misturar shell com o conteúdo final do comentario
- não repetir a politica oficial aqui; ela vive no harness

## Resultado esperado

- comentarios renderizados corretamente
- aplicacao consistente da politica do harness
- menos ruído de formatacao
- reutilizacao dos templates corretos
