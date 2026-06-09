# Template de Corpo para PR e Issue

## Objetivo

Padronizar o texto base usado em PRs e issues para manter a estrutura em Markdown e evitar formatacao quebrada.

## Estrutura recomendada

```markdown
## Objetivo

Descrever em uma frase o que a mudanca quer resolver.

## Mudancas

- item 1
- item 2

## Validacao

- comando ou verificacao 1
- comando ou verificacao 2

## Escopo

- o que entra
- o que nao entra

## Observacao

Contexto adicional, risco ou limite operacional.
```

## Regras de uso

- usar Markdown real, nao string com escapes
- preferir `--body-file` ou arquivo temporario com conteudo pronto
- manter cada secao curta e objetiva
- adaptar o texto ao tipo de item, sem remover a estrutura basica

## Resultado esperado

- comentarios e descricoes renderizados corretamente
- menor chance de texto quebrado no GitHub
- consistencia entre PRs, issues e cards
