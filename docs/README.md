# Documentacao do Produto

Esta pasta concentra a documentacao viva do projeto. A organizacao foi pensada para manter requisitos, definicoes tecnicas e operacao do board no GitHub dentro do proprio repositorio, com versionamento junto ao codigo.

## Estrutura recomendada

```text
docs/
├── README.md
├── architecture/
│   └── target-architecture.md
├── product/
│   └── product-scope-and-principles.md
├── roadmap/
│   └── phased-evolution-roadmap.md
└── backlog/
    └── prioritized-epics-and-stories.md
```

## Regras de uso

- `docs/product/`: visao de produto, principios, escopo e diretrizes que mudam pouco.
- `docs/architecture/`: definicoes tecnicas, fronteiras arquiteturais e decisoes de engenharia.
- `docs/roadmap/`: plano evolutivo por fases, com criterio de prioridade e dependencias.
- `docs/backlog/`: epicos e historias prontas para virar issues no GitHub.
- `.github/`: configuracoes operacionais do repositorio, incluindo templates e orientacoes de board.

## Como manter

- Requisitos funcionais e nao funcionais devem nascer em `docs/backlog/` e apontar para os documentos de `product/` e `architecture/`.
- Mudancas arquiteturais relevantes devem atualizar primeiro `docs/architecture/`.
- O board do GitHub deve refletir o backlog, e nao substitui-lo. O board organiza execucao; os documentos preservam o contexto, as decisoes e os criterios.
