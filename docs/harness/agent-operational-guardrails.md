# Guardrails Operacionais dos Agentes

## Objetivo

Consolidar os erros operacionais encontrados nas execucoes dos agentes em regras praticas para reduzir retrabalho, falhas evitaveis e interrupcoes no fluxo.

## Problemas observados

- nome de branch fora da politica de governance
- label inexistente no repositorio
- parametros incompletos ao atualizar o Project
- uso de endpoint errado para ajustes temporarios de branch protection
- ausencia de preflight antes de criar ou mover itens

## Guardrails

### 1. Validar politica de branch antes de criar PR

- verificar se o nome da branch respeita o workflow existente
- usar apenas prefixos aceitos pelo repositório
- evitar criar branches sem referencia ao tipo de trabalho

### 2. Validar taxonomia antes de criar issue

- listar labels existentes antes de definir a classificacao
- nao assumir nomes novos sem confirmar padrao do projeto
- reutilizar labels ja aprovadas sempre que possivel

### 3. Validar board antes de mover item

- localizar o item no Project antes de editar
- confirmar os campos e opcoes existentes
- registrar o estado real do item sem inventar workflow ou status

### 4. Validar protecao de branch antes de ajuste temporario

- usar o endpoint correto do GitHub
- alterar o minimo necessario
- restaurar a protecao imediatamente apos o merge

### 5. Exigir preflight do agente

Antes de qualquer acao de escrita, o agente deve confirmar:

- qual e a branch alvo
- quais labels existem
- qual issue ou PR e a fonte da verdade
- qual item do Project sera atualizado
- qual validacao precisa ser executada

## Regra de operacao

Se qualquer uma dessas verificacoes falhar, o agente deve parar e pedir esclarecimento ou buscar a informacao correta antes de seguir.

## Resultado esperado

- menos falhas de setup
- menos PRs bloqueados por detalhes operacionais
- board mais consistente
- menos intervencoes manuais para corrigir erro repetido
