# Politica de Formatação de Comentarios

## Objetivo

Definir a regra oficial do projeto para gerar comentarios, descricoes de PR e textos de issue em Markdown valido e legivel.

## Alcance

Esta politica vale para:

- comentarios de PR
- comentarios de issue
- descricoes de PR
- descricoes de issue
- comentarios gerados por agentes

## Regra oficial

O texto deve ser produzido em Markdown real.

Nao usar `\\n` literal dentro de strings de comando para simular quebra de linha.

## Regras obrigatorias

- usar Markdown com quebras reais de linha
- usar `--body-file` ou arquivo temporario para textos maiores que uma linha
- proibir corpo inline quando o Markdown contiver crases, blocos de codigo,
  expansoes de shell ou outros caracteres interpretaveis pelo terminal
- manter seções curtas e consistentes
- preservar titulos simples como `## Objetivo`, `## Mudancas`, `## Validacao`, `## Observacao`
- evitar mistura de escape de shell com conteudo de comentario

## Modelo recomendado

```markdown
## Objetivo

Descrever em uma frase o motivo da mudanca.

## Mudancas

- item 1
- item 2

## Validacao

- comando ou verificacao 1
- comando ou verificacao 2

## Observacao

Contexto adicional, risco ou limite operacional.
```

## Relacao com os templates

- `docs/github/comment-formatting-guide.md` descreve a forma pratica de uso no GitHub
- `docs/github/pr-issue-body-template.md` fornece o corpo-base para PR e issue

## Regra operacional para agentes

Antes de postar comentarios ou descricoes, o agente deve:

- confirmar se o texto precisa ser multi-linha
- escolher `--body-file` quando apropriado
- validar localmente o Markdown final
- garantir que a mensagem no GitHub nao contenha escapes literais
- reler o corpo publicado antes de criar cards derivados ou mover o board

## Resultado esperado

- comentarios renderizados corretamente
- descricao mais profissional e previsivel
- menos erro de formato em PRs e issues
- regra centralizada no harness, com templates operacionais em `docs/github`
