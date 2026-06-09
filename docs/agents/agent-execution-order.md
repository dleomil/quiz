# Ordem de Execucao dos Agentes

## Objetivo

Definir a ordem recomendada de uso dos agentes para reduzir ambiguidade, retrabalho e acao fora de sequencia.

## Ordem recomendada

### 1. Spec Agent

Use primeiro quando houver uma demanda nova ou pouco clara.

- cria ou refina a spec
- define contexto, escopo e criterios de aceite
- confirma quais evidencias serao exigidas

### 2. Architect Agent

Use em seguida quando a spec puder gerar impacto arquitetural ou exigir avaliacao de risco.

- valida fronteiras e dependencias
- aponta riscos e restricoes
- sugere o menor passo seguro

### 3. Implementer Agent

Use depois que a spec e o desenho minimo estiverem prontos.

- executa mudanca pequena e rastreavel
- não amplia escopo
- vincula a validacao ao trabalho realizado

### 4. Verifier Agent

Use imediatamente apos a implementacao.

- executa testes e validacoes
- coleta evidencias
- confirma aderencia a spec

### 5. Release and Board Agent

Use quando a entrega ja estiver validada.

- atualiza issue, PR e Project
- move o card para o estado correto
- registra evidencias e conclusao

### 6. Reviewer Agent

Use antes do merge final do PR.

- confere aderencia a spec
- confere validacao e risco
- registra parecer objetivo

## Regras de uso

- nao pular diretamente para implementacao quando a spec estiver incompleta
- nao usar Reviewer Agent como substituto de validacao
- nao usar Release and Board Agent antes de existir evidencia
- nao executar varios agentes fora de ordem sem necessidade real

## Resultado esperado

- menos interpretacao improvisada
- menos PRs com contexto insuficiente
- menos movimentacao de board sem base real
- mais previsibilidade no fluxo de entrega
