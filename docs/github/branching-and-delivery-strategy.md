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

- `release/*`
  - branch opcional para consolidacao e validacao final antes do merge em `main`

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
4. Promover `develop` para `main` via Pull Request com aprovacao manual.
5. Quando houver necessidade de estabilizacao antes da publicacao, permitir `release/*` com destino a `main`.

## Modos de operacao por calendario escolar

O Product Owner deve declarar no epic ou PR de promocao qual modo esta ativo.
Na ausencia dessa declaracao, aplica-se o modo protegido.

### Modo continuo - fora de epoca de provas

- promover lotes pequenos de `develop` para `main` com maior frequencia;
- manter PR exclusivo de promocao, aprovacao manual, checks obrigatorios,
  preview, rollback e smoke test em producao;
- preferir mudancas reversiveis e independentes, sem acumular um grande release;
- interromper novas promocoes se houver regressao ou evidencia insuficiente.

### Modo protegido - preparacao e realizacao de provas

- congelar evolucoes nao essenciais em producao;
- permitir apenas correcoes bloqueantes, seguranca ou conteudo indispensavel para
  a prova, sempre com escopo minimo;
- exigir regressao completa das jornadas afetadas e evidencia no card ou PR;
- evitar promocoes durante o horario de estudo definido pelo Product Owner;
- monitorar o deploy e manter rollback imediato disponivel.

A mudanca de modo altera a frequencia permitida, nao reduz os gates de
qualidade. Conteudo educacional continua sujeito aos gates pedagogicos,
linguisticos e humanos em ambos os modos.

## Regras de governanca inicial

- nao fazer push direto em `main`
- nao fazer push direto em `develop`
- toda evolucao deve passar por Pull Request
- neste inicio, exigir ao menos uma aprovacao manual
- usar GitHub Actions como gate minimo de governanca nos PRs
- registrar o modo operacional vigente em toda promocao para `main`

## Motivacao arquitetural

Este modelo e propositalmente simples. Criar muitas branches permanentes neste momento aumentaria custo de coordenacao sem gerar ganho proporcional. Para a maturidade atual do projeto, `main` e `develop` sao suficientes.

## Evolucao futura

Quando o produto tiver ambientes e releases mais frequentes, a estrategia pode evoluir para:

- ambientes com aprovacao por environment
- release branches sob demanda
- validacoes obrigatorias mais fortes no CI
- deploy automatizado com gates manuais por ambiente
