# Documentacao do Produto

Esta pasta concentra a documentacao viva do projeto. A organizacao foi pensada para manter requisitos, definicoes tecnicas e operacao do board no GitHub dentro do proprio repositorio, com versionamento junto ao codigo.

## Mapa da Documentacao

| Pasta                | Papel                                               | Conteudo tipico                                                           |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------------------------- |
| `docs/harness/`      | Politicas, guardrails e contratos operacionais      | preflight, fronteiras, politica de formato, controle de fluxo dos agentes |
| `docs/agents/`       | Modelo operacional dos agentes e seu manual de uso  | papeis, ordem, aplicacao por papel, fluxo do revisor, manual consolidado  |
| `docs/github/`       | Guias praticos e templates de operacao no GitHub    | board, branching, corpo de PR/issue, guias de uso, formatos operacionais  |
| `docs/specs/`        | Especificacoes de trabalho e pilotos                | specs de produto, pilotos de baixo risco, criterios de aceite e validacao |
| `docs/backlog/`      | Fonte do backlog priorizado                         | epicos, historias, requisitos, plano de validacao, evidencias esperadas   |
| `docs/roadmap/`      | Ordem evolutiva por fases                           | fases, priorizacao, dependencias e sequencia recomendada                  |
| `docs/product/`      | Visao de produto e principios                       | escopo, principios e diretrizes de produto                                |
| `docs/architecture/` | Definicoes tecnicas e fronteiras                    | arquitetura alvo, contratos tecnicos e decisoes de engenharia             |
| `docs/platform/`     | Avaliacoes de infraestrutura e limites operacionais | Vercel, migracao, retention e sinais de reavaliacao                       |

## Estrutura recomendada

```text
docs/
├── README.md
├── agents/
│   ├── agent-operating-model.md
│   ├── agent-operating-manual.md
│   ├── agent-execution-order.md
│   ├── agent-preflight-application.md
│   ├── content-curator-agent.md
│   ├── pedagogical-quality-agent.md
│   ├── product-discovery-agent.md
│   ├── reviewer-agent-comment-template.md
│   ├── reviewer-agent-decision-matrix.md
│   ├── production-safe-adoption-plan.md
│   ├── reviewer-agent.md
│   └── reviewer-agent-workflow.md
├── architecture/
│   └── target-architecture.md
├── product/
│   └── product-scope-and-principles.md
├── platform/
│   └── vercel-limits-assessment.md
├── harness/
│   ├── harness-engineering.md
│   ├── harness-vs-github-boundaries.md
│   ├── agent-operational-guardrails.md
│   ├── agent-preflight-checklist.md
│   ├── execution-lessons-learned.md
│   ├── content-update-quality-gates.md
│   └── pilot-execution-checklist.md
├── roadmap/
│   ├── panel-control-phased-plan.md
│   └── phased-evolution-roadmap.md
├── specs/
│   ├── panel-control-functional-architecture.md
│   ├── content-schema-v1.md
│   ├── curriculum-content-update-governance.md
│   ├── product-discovery-agent.md
│   ├── pilot-low-risk-workflow.md
│   ├── spec-driven-development.md
│   └── vercel-limits-and-retention.md
├── github/
│   ├── comment-formatting-guide.md
│   ├── github-project-guide.md
│   ├── github-project-pocket-guide.md
│   ├── github-project-operating-model.md
│   ├── initial-execution-plan.md
│   └── pr-issue-body-template.md
└── backlog/
    └── prioritized-epics-and-stories.md
```

## Regras de uso

- `docs/product/`: visao de produto, principios, escopo e diretrizes que mudam pouco.
- `docs/platform/`: avaliacoes de infraestrutura, limites de plataforma e decisoes operacionais.
- `docs/architecture/`: definicoes tecnicas, fronteiras arquiteturais e decisoes de engenharia.
- `docs/specs/`: especificacoes de trabalho, criterios de aceite e formatos de entrega antes da implementacao.
- `docs/harness/`: regras, guardrails, validacoes e observabilidade dos agentes e do fluxo assistido por IA.
- `docs/agents/`: papeis, limites e contratos operacionais dos agentes do projeto.
- `docs/roadmap/`: plano evolutivo por fases, com criterio de prioridade e dependencias.
- `docs/backlog/`: epicos e historias prontas para virar issues no GitHub.
- `docs/github/`: guia operacional do board, guia de bolso, estrategia de uso e ordem inicial de execucao.
- `.github/`: configuracoes operacionais do repositorio, incluindo templates e orientacoes de board.

## Como manter

- Requisitos funcionais e nao funcionais devem nascer em `docs/backlog/` e apontar para os documentos de `product/` e `architecture/`.
- Mudancas arquiteturais relevantes devem atualizar primeiro `docs/architecture/`.
- O board do GitHub deve refletir o backlog, e nao substitui-lo. O board organiza execucao; os documentos preservam o contexto, as decisoes e os criterios.
