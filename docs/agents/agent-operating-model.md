# Modelo Operacional de Agentes

## Objetivo

Definir papeis simples e complementares para trabalhar com spec-driven development e harness engineering sem criar autonomia excessiva.

## Agentes propostos

### 1. Spec Agent

**Responsabilidade**

Transformar uma issue ou demanda em uma spec clara e testavel.

**Entradas**

- issue ou epic
- documentos de produto
- documentos de arquitetura

**Saidas**

- spec estruturada
- criterios de aceite
- plano de validacao
- evidencias esperadas

**Limites**

- nao implementa codigo
- nao altera board sem orientacao

### 2. Architect Agent

**Responsabilidade**

Validar impacto arquitetural, riscos, fronteiras e aderencia ao roadmap.

**Entradas**

- spec
- estado atual do repositorio
- restricoes operacionais

**Saidas**

- recomendacao tecnica
- riscos
- dependencias
- sugestao de pequeno passo

**Limites**

- nao faz alteracao funcional sem spec
- nao decide prioridade de negocio sozinho

### 3. Implementer Agent

**Responsabilidade**

Executar mudancas pequenas e rastreaveis a partir de uma spec aprovada.

**Entradas**

- spec aprovada
- escopo da tarefa
- contexto tecnico minimo

**Saidas**

- alteracao de codigo ou documento
- commit pequeno
- referencia de validacao

**Limites**

- nao expande escopo por conta propria
- nao altera producao sem gate
- nao adiciona arquivos de teste sem respeitar o contrato de lint do repositorio

### 4. Verifier Agent

**Responsabilidade**

Executar testes, validar evidencias e confirmar que a entrega bate com a spec.

**Entradas**

- implementacao proposta
- plano de validacao
- criterios de aceite

**Saidas**

- resultado de testes
- resultado de lint e formatacao quando houver arquivos novos ou alterados
- evidencias
- recomendacao de pronto ou ajuste

**Limites**

- nao muda implementacao para esconder falha
- nao aprova entrega sem evidencia

### 5. Release and Board Agent

**Responsabilidade**

Atualizar issue, PR, labels, status e evidencias no board.

**Entradas**

- estado real da entrega
- links de PR e testes
- resultado de validacao

**Saidas**

- issue atualizada
- card movido
- comentario de evidencia

**Limites**

- nao altera criterio tecnico
- nao fecha item sem validacao
- nao move item sem confirmar a consistencia entre `Status` e `Workflow` quando ambos existirem

### 6. Reviewer Agent

**Responsabilidade**

Revisar Pull Requests com foco em aderencia a spec, qualidade minima, evidencias e risco de merge.

**Entradas**

- PR aberto
- spec da entrega
- plano de validacao
- evidencias anexadas

**Saidas**

- parecer de aprovacao ou ajuste
- lista objetiva de pendencias
- confirmacao de alinhamento com a spec

**Limites**

- nao aprova por conta propria se a regra do repo exigir humano
- nao muda codigo
- nao inventa evidencia
- nao decide escopo novo para o PR
- nao ignora falha de lint em arquivo novo

## Fluxo de revisao

O comportamento operacional do Reviewer Agent esta descrito em `reviewer-agent-workflow.md`. O modelo operacional define o papel; o workflow define quando rodar, o que conferir e como registrar o parecer.

## Fluxo recomendado

1. `Spec Agent` escreve a spec.
2. `Architect Agent` revisa riscos e limites.
3. `Implementer Agent` executa o menor passo possivel.
4. `Verifier Agent` valida contra a spec.
5. `Release and Board Agent` publica o resultado no board.
6. `Reviewer Agent` emite parecer de conformidade para PRs antes do merge.

## Ordem de execucao

A ordem detalhada de quando cada agente deve ser usado esta descrita em `docs/agents/agent-execution-order.md`.

## Regra de governanca

- uma tarefa relevante nao deve passar por todos os agentes ao mesmo tempo
- cada agente existe para reduzir ambiguidade de um trecho especifico do fluxo
- o harness define quais agentes podem agir em cada fase
- cada agente deve executar o preflight definido em `docs/harness/agent-preflight-checklist.md` antes de agir
- a aplicacao por papel esta detalhada em `docs/agents/agent-preflight-application.md`
- a entrada consolidada fica em `docs/agents/agent-operating-manual.md`

## Resultado esperado

- menos interpretacao improvisada
- specs mais claras
- PRs menores
- validacao repetivel
- board alinhado com o que realmente aconteceu
