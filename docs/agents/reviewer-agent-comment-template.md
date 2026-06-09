# Template de Comentario do Reviewer Agent

## Objetivo

Padronizar o comentario de revisao para que o parecer seja curto, consistente e facil de registrar no PR e no board.

## Quando usar

Use este template quando o Reviewer Agent concluir a leitura do PR e precisar registrar um parecer operacional.

## Formato padrao

```text
Conclusao: <Aprovado para merge | Ajustes necessarios | Bloqueado>
Risco: <baixo | medio | alto> e justificativa curta.
Pendencias: <nenhuma ou lista objetiva>.
Evidencias verificadas: <testes, validacoes, links ou referencias>.
Proxima acao: <proximo passo concreto>.
```

## Regras

- manter a mensagem objetiva
- nao repetir conteudo da spec
- nao expor detalhes desnecessarios
- citar apenas evidencias relevantes
- registrar a proxima acao de forma executavel

## Exemplo

```text
Conclusao: Aprovado para merge.
Risco: Baixo, mudanca documental e sem impacto em producao.
Pendencias: Nenhuma.
Evidencias verificadas: git diff --check, npm run format:check, pr-governance, dependency-review, codeql-actions, codeql-javascript.
Proxima acao: Aguardar aprovacao humana final e merge.
```
