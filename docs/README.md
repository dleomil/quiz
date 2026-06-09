# Documentacao do Produto

Esta pasta concentra a documentacao viva do projeto. A organizacao foi pensada para manter requisitos, definicoes tecnicas e operacao do board no GitHub dentro do proprio repositorio, com versionamento junto ao codigo.

## Estrutura recomendada

```text
docs/
├── README.md
├── agents/
│   ├── agent-operating-model.md
│   └── production-safe-adoption-plan.md
├── architecture/
│   └── target-architecture.md
├── product/
│   └── product-scope-and-principles.md
├── platform/
│   └── vercel-limits-assessment.md
├── harness/
│   ├── harness-engineering.md
│   └── pilot-execution-checklist.md
├── roadmap/
│   └── phased-evolution-roadmap.md
├── specs/
│   ├── pilot-low-risk-workflow.md
│   ├── spec-driven-development.md
│   └── vercel-limits-and-retention.md
├── github/
│   ├── github-project-guide.md
│   ├── github-project-pocket-guide.md
│   ├── github-project-operating-model.md
│   └── initial-execution-plan.md
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
