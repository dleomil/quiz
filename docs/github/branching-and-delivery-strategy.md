# Estrategia de Branching e Evolucao Controlada

## Objetivo

Definir uma estrategia simples de branching para o inicio da evolucao do produto, reduzindo risco operacional e impondo governanca leve com aprovacoes manuais.

## Estrategia recomendada

### Branches permanentes

- `main`
  - branch de producao
  - deve refletir apenas codigo aprovado para release

- `develop`
  - branch de integracao
  - recebe features e ajustes aprovados antes de promover para `main`

### Branches temporarias

- `feature/*`
  - novas capacidades

- `fix/*`
  - correcao comum

- `hotfix/*`
  - correcao urgente com destino preferencial para `main`

- `chore/*`
  - manutencao tecnica

- `docs/*`
  - alteracoes de documentacao

- `refactor/*`
  - reorganizacao estrutural sem mudanca funcional planejada

## Fluxo recomendado

1. Criar branch a partir de `develop` para trabalho normal.
2. Abrir Pull Request da branch temporaria para `develop`.
3. Exigir aprovacao manual antes do merge.
4. Promover `develop` para `main` tambem via Pull Request com aprovacao manual.

## Regras de governanca inicial

- nao fazer push direto em `main`
- nao fazer push direto em `develop`
- toda evolucao deve passar por Pull Request
- neste inicio, exigir ao menos uma aprovacao manual
- usar GitHub Actions como gate minimo de governanca nos PRs

## Motivacao arquitetural

Este modelo e propositalmente simples. Criar muitas branches permanentes neste momento aumentaria custo de coordenacao sem gerar ganho proporcional. Para a maturidade atual do projeto, `main` e `develop` sao suficientes.

## Evolucao futura

Quando o produto tiver ambientes e releases mais frequentes, a estrategia pode evoluir para:

- ambientes com aprovacao por environment
- release branches sob demanda
- validacoes obrigatorias mais fortes no CI
- deploy automatizado com gates manuais por ambiente
