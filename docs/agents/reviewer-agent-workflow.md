# Fluxo Operacional do Reviewer Agent

## Objetivo

Definir quando o Reviewer Agent roda, o que ele examina e como o parecer entra no fluxo de Pull Request sem quebrar a governanca atual.

## Quando usar

Use o Reviewer Agent quando um PR estiver pronto para revisao tecnica e documental, com:

- spec associada
- validacao executada
- evidencias anexadas
- escopo pequeno e bem definido

## Quando nao usar

Nao use o Reviewer Agent para:

- PR sem spec ou sem criterio de aceite
- PR sem validacao minima
- PR com escopo aberto ou ainda em descoberta
- merge final quando a politica do repositorio exigir revisao humana

## Entradas obrigatorias

- link do PR
- link da issue ou spec
- plano de validacao
- evidencias coletadas
- contexto do board

## Sequencia de revisao

1. Confirmar que o PR referencia a spec correta.
2. Conferir se os criterios de aceite estao cobertos.
3. Verificar se testes e validacoes foram executados.
4. Conferir se as evidencias estao presentes no PR ou no card.
5. Avaliar risco de merge e eventuais dependencias.
6. Emitir parecer objetivo.

## Saida padrao

O parecer deve seguir este formato:

```text
Conclusao:
Risco:
Pendencias:
Evidencias verificadas:
Proxima acao:
```

## Matriz de decisao

A classificacao final do parecer usa a matriz definida em `reviewer-agent-decision-matrix.md`. O workflow define o passo a passo; a matriz define a conclusao.

## Decisoes possiveis

- `Aprovado para merge`: o PR esta consistente, mas ainda segue a politica normal do repositorio.
- `Ajustes necessarios`: falta evidencias, testes ou alinhamento com a spec.
- `Bloqueado`: ha risco ou divergencia que impede avancar.

## Registro no PR

O parecer do Reviewer Agent deve virar comentario no PR com:

- resumo da conclusao
- lista objetiva de pendencias
- referencia da spec
- referencia das evidencias

## Registro no board

Quando o PR for aprovado ou ajustado, o card correspondente deve refletir o estado real:

- `In Review` se ainda houver ajuste
- `Ready` se o trabalho estiver apenas aguardando revisao humana final
- `Done` quando o merge estiver concluido e as evidencias registradas

## Limite operacional

O Reviewer Agent nao substitui a revisao humana exigida pela governanca do repositorio. Ele reduz ambiguidade e acelera a triagem, mas nao toma a decisao final sozinho.
