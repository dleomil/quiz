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

### 4. Verifier Agent

**Responsabilidade**

Executar testes, validar evidencias e confirmar que a entrega bate com a spec.

**Entradas**

- implementacao proposta
- plano de validacao
- criterios de aceite

**Saidas**

- resultado de testes
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

## Fluxo recomendado

1. `Spec Agent` escreve a spec.
2. `Architect Agent` revisa riscos e limites.
3. `Implementer Agent` executa o menor passo possivel.
4. `Verifier Agent` valida contra a spec.
5. `Release and Board Agent` publica o resultado no board.

## Regra de governanca

- uma tarefa relevante nao deve passar por todos os agentes ao mesmo tempo
- cada agente existe para reduzir ambiguidade de um trecho especifico do fluxo
- o harness define quais agentes podem agir em cada fase

## Resultado esperado

- menos interpretacao improvisada
- specs mais claras
- PRs menores
- validacao repetivel
- board alinhado com o que realmente aconteceu
