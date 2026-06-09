# Guia de Formatação de Comentarios

## Objetivo

Padronizar a escrita de comentarios em PRs, issues e cards para que o Markdown seja renderizado corretamente e a leitura fique consistente.

## Fonte de verdade

A politica oficial vive em `docs/harness/comment-formatting-policy.md`.

Este documento existe como guia pratico de uso no GitHub.

## Regra principal

Nao enviar comentarios como string inline com `\\n` literal.

Use um arquivo Markdown ou um texto multi-linha real como fonte do comentario.

## Forma correta

- escrever o comentario em Markdown normal
- manter quebras de linha reais
- usar listas, titulos curtos e blocos de codigo quando necessario
- preferir `--body-file` em vez de `--body` quando o comentario for maior que uma linha simples

## Forma incorreta

- concatenar texto com `\\n` dentro da string do comando
- tentar simular Markdown em uma linha unica
- misturar formatacao de shell com conteudo do comentario

## Padrao recomendado para PR e issue

```markdown
## Objetivo

Explicar o motivo da mudanca em uma frase curta.

## Mudancas

- item 1
- item 2

## Validacao

- comando 1
- comando 2

## Observacao

Limite, risco ou contexto adicional.
```

## Padrao recomendado para parecer de revisao

```markdown
Conclusao: Aprovado para merge.
Risco: Baixo, mudanca documental e sem impacto em producao.
Pendencias: Nenhuma.
Evidencias verificadas: git diff --check, npm run format:check, pr-governance.
Proxima acao: Aguardar o merge controlado.
```

## Regra operacional para o agente

- gerar o comentario como Markdown real
- se o texto for extenso, salvar em arquivo temporario ou em um template versionado
- nunca entregar texto com `\\n` literal no comentario final

## Resultado esperado

- comentarios renderizados corretamente
- leitura mais profissional em PRs e issues
- menos ruído de formatacao
- reutilizacao dos mesmos blocos de comentario ao longo do fluxo
