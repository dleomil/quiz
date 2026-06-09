# Spec-Driven Development no Projeto

## Objetivo

Definir a especificacao como artefato principal antes de qualquer implementacao, para que mudancas pequenas sejam previsiveis, testaveis e alinhadas ao produto.

## Principio

A especificacao vem antes do codigo. O codigo implementa a spec. Os testes validam a spec. O board acompanha a execucao.

## Quando usar

Use este fluxo para qualquer trabalho que altere comportamento, arquitetura, seguranca, operacao ou experiencia do usuario.

## Estrutura minima de uma spec

### 1. Contexto

- problema que a mudanca resolve
- quem e impactado
- por que isso existe agora

### 2. Escopo

- o que entra
- o que nao entra
- dependencias e restricoes

### 3. Requisitos

- requisitos funcionais
- requisitos nao funcionais
- requisitos de seguranca e operacao, quando existirem

### 4. Critérios de aceite

- o que precisa acontecer para considerar a entrega pronta
- o que deve ser observavel em teste ou validacao

### 5. Plano de validacao

- como validar sem depender de interpretacao subjetiva
- quais testes ou verificacoes devem rodar

### 6. Evidencias esperadas

- logs
- screenshots
- resultados de testes
- links de PR ou issue, quando aplicavel

### 7. Riscos e rollback

- risco principal
- como reduzir risco
- como voltar atras se precisar

## Regra de uso com issues

1. Toda issue relevante deve apontar para uma spec ou criar a propria spec.
2. Nenhuma implementacao deve começar sem criterio de aceite claro.
3. Mudancas de maior risco devem ter plano de validacao e evidencia definida.
4. Quando a spec mudar, a issue e o PR devem refletir a nova verdade.

## Template recomendado

```text
Titulo:
Contexto:
Escopo:
Nao objetivos:
Requisitos:
Criterios de aceite:
Plano de validacao:
Evidencias esperadas:
Riscos:
Rollback:
```

## Relacao com o board

- `Spec` alimenta `Epic`, `Story`, `Tech Task`, `Spike` e `Bug`
- `docs/backlog/` converte a spec em trabalho rastreavel
- `GitHub Project` acompanha status, nao substitui a spec
