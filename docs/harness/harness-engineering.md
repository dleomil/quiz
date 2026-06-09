# Harness Engineering no Projeto

## Objetivo

Definir a camada de controle ao redor dos agentes para garantir trabalho reproduzivel, rastreavel e seguro.

## O que o harness controla

- entrada dos agentes
- permissões de ferramenta
- limites de contexto
- formatos de saida
- validacao de resultado
- evidencias obrigatorias
- trilha de auditoria

## Principios

1. O agente nao decide sozinho o processo.
2. O agente opera dentro de limites claros.
3. Toda saida relevante precisa ser verificavel.
4. O harness deve reduzir variacao, nao aumentá-la.
5. Nenhum agente deve ter acesso maior do que o necessario.

## Componentes do harness

### 1. Context pack

Conjunto minimo de documentos que o agente pode ler para executar uma tarefa.

### 2. Tool policy

Lista de ferramentas permitidas por agente, com regras de quando usar cada uma.

### 3. Output contract

Formato esperado de saida, por exemplo:

- resumo executivo
- decisoes tomadas
- arquivos afetados
- validacao executada
- evidencias coletadas

### 4. Verification gates

- lint
- formatacao
- testes
- validacao de links ou docs
- checagem de board quando aplicavel

### 5. Audit trail

- issue de origem
- PR correspondente
- commit relacionado
- evidencias anexadas

### 6. Operational preflight

Checklist minimo antes de qualquer acao de escrita:

- confirmar a branch alvo e a politica de nome
- confirmar labels e taxonomia existentes
- confirmar o item do Project e seus campos
- confirmar o endpoint ou comando correto para a acao
- confirmar como a protecao original sera restaurada
- consultar o checklist dedicado em `agent-preflight-checklist.md`

## Niveis de permissao sugeridos

- leitura de docs e backlog
- proposta de alteracao
- edicao assistida de arquivos permitidos
- execucao de testes locais
- atualizacao de issue ou PR quando autorizada

## Regras de seguranca

- nao expor segredos em prompts, issues ou comentarios
- nao inventar evidencia
- nao alterar producao sem gate
- nao ultrapassar o escopo da spec aprovada
- nao usar ferramenta sem necessidade clara

## Como aplicar no projeto

1. Cada agente recebe um context pack pequeno.
2. Cada tarefa tem uma spec clara.
3. O harness executa validacoes antes de liberar merge.
4. O board recebe evidencias e status real.

## Relacao com o GitHub

- `GitHub Issue` e o gatilho do trabalho
- `Pull Request` e o artefato de revisao
- `GitHub Actions` executa os gates
- `GitHub Project` organiza o fluxo
- `docs/harness/agent-operational-guardrails.md` consolida os erros operacionais encontrados e os guardrails de prevencao
- `docs/harness/agent-preflight-checklist.md` padroniza o preflight obrigatorio antes de qualquer acao dos agentes
- `docs/harness/comment-formatting-policy.md` centraliza a regra de formatacao para comentarios, PRs e issues
