# Plano de Adocao Segura

## Objetivo

Adotar spec-driven development e harness engineering sem criar risco para um sistema que ja esta em producao.

## Principio geral

O projeto nao deve sair do modo atual de entrega pequena, aprovada e testada. A mudanca e no processo de trabalho antes de ser uma mudanca na forma de programar.

## Fases de adocao

### Fase 1: Planejamento e padronizacao

**Objetivo**

Criar os artefatos de governanca e os contratos de trabalho.

**Entregas**

- template oficial de spec
- documento de harness
- modelo de agentes
- mapa de permissao e limites
- vinculo com backlog e board

**Resultado esperado**

Qualquer item relevante pode ser entendido antes de ser implementado.

### Fase 2: Uso assistido em itens de baixo risco

**Objetivo**

Usar os agentes apenas em tarefas seguras, como documentacao, refinamento, validacao e organizacao do board.

**Entregas**

- specs curtas para itens pequenos
- validacao por testes existentes
- evidencias registradas no card

**Resultado esperado**

O fluxo fica previsivel sem tocar em comportamento de producao.

### Fase 3: Implementacao restrita e supervisionada

**Objetivo**

Permitir que um agente auxilie pequenas alteracoes de codigo com escopo fechado.

**Entregas**

- PRs pequenos
- validacao automatica obrigatoria
- revisao humana obrigatoria

**Resultado esperado**

O agente acelera a entrega sem ganhar autonomia ampla.

## Regras para ambiente em producao

- nenhuma alteracao sem spec minima
- nenhuma alteracao sem plano de validacao
- nenhuma alteracao sem evidencia
- nenhuma alteracao ampla sem rollback claro
- nenhum agente com permissao maior do que o necessario

## Pilotagem recomendada

O primeiro piloto deve ser um item de baixo risco, preferencialmente de documentacao ou governanca, para testar:

- clareza da spec
- tempo de validacao
- qualidade das evidencias
- alinhamento com o board

## Sinal de maturidade

A adocao e considerada saudavel quando:

- as specs reduzem retrabalho
- os PRs ficam menores
- a validacao fica previsivel
- o board reflete o estado real sem ambiguidade
