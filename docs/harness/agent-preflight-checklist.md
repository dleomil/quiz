# Checklist de Preflight dos Agentes

## Objetivo

Garantir que qualquer agente confirme os dados minimos de contexto antes de executar uma acao de escrita, revisao ou publicacao.

## Quando usar

Use este checklist antes de:

- criar branch
- abrir PR
- criar issue
- mover item no Project
- ajustar protecao de branch
- registrar parecer ou evidencia

## Checklist minimo

### 1. Fonte da verdade

- qual issue, spec ou PR esta guiando a acao
- qual item do board sera afetado
- qual documento eh o contexto oficial

### 2. Taxonomia e permissao

- qual tipo de item esta sendo criado ou alterado
- quais labels existem e quais serao usadas
- qual nivel de permissao o agente tem para a acao

### 3. Branch e destino

- qual e a branch alvo
- qual politica de nome se aplica
- qual base branch deve receber a mudanca

### 4. Validacao

- qual validacao precisa ser executada
- quais evidencias precisam ser registradas
- qual criterio define sucesso ou bloqueio

### 5. Reversao e seguranca

- como a mudanca sera revertida se necessario
- como a protecao original sera restaurada
- se ha impacto em producao ou board

## Regra operacional

Se qualquer item do checklist estiver ausente, o agente deve parar e buscar a informacao faltante antes de seguir.

## Resultado esperado

- menos bloqueios por detalhe operacional
- menos correcao manual de taxonomia
- menos divergencia entre docs, board e PR
- mais previsibilidade no fluxo dos agentes
