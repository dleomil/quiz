# Indice da documentacao

Esta pasta reune as fontes versionadas de produto, especificacao e operacao do Quiz Etapa. O indice ajuda a encontrar os documentos principais; os arquivos de cada pasta continuam sendo a fonte de verdade de seus respectivos assuntos.

## Mapa

| Pasta           | Conteudo                                                  |
| --------------- | --------------------------------------------------------- |
| `product/`      | Escopo, publico, principios e diretrizes do produto       |
| `architecture/` | Arquitetura, fronteiras e decisoes tecnicas               |
| `specs/`        | Requisitos, contratos, formatos e criterios de aceite     |
| `agents/`       | Papeis, limites, sequencia e operacao dos agentes         |
| `harness/`      | Guardrails, preflight, testes e licoes operacionais       |
| `backlog/`      | Epicos, historias e prioridades documentadas              |
| `roadmap/`      | Fases, dependencias e ordem de evolucao                   |
| `github/`       | Branching, PRs, issues e operacao do Project              |
| `platform/`     | Hospedagem, limites de infraestrutura e migracao          |
| `security/`     | Superficies de risco, controles e avaliacoes de seguranca |

## Leituras principais

| Assunto                           | Documento                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------------ |
| Escopo e principios do produto    | [product-scope-and-principles.md](product/product-scope-and-principles.md)                       |
| MVP dos apps moveis               | [mobile-app-mvp.md](specs/mobile-app-mvp.md)                                                     |
| Decisao de monorepo mobile        | [mobile-app-monorepo-adr.md](architecture/mobile-app-monorepo-adr.md)                            |
| Roadmap dos apps moveis           | [mobile-app-roadmap.md](roadmap/mobile-app-roadmap.md)                                           |
| Contrato editorial de acervos     | [content-delivery-contract.md](specs/content-delivery-contract.md)                               |
| Manifesto curricular de 2026 T3   | [third-trimester-curriculum-manifest-2026.md](specs/third-trimester-curriculum-manifest-2026.md) |
| Apoio bilingue para Ingles        | [english-t2-bilingual-question-support.md](specs/english-t2-bilingual-question-support.md)       |
| Selecao da quantidade de questoes | [question-count-selection.md](specs/question-count-selection.md)                                 |
| Evolucao do fluxo de agentes      | [agent-workflow-evolution.md](specs/agent-workflow-evolution.md)                                 |
| Manual operacional dos agentes    | [agent-operating-manual.md](agents/agent-operating-manual.md)                                    |
| Ordem de execucao dos agentes     | [agent-execution-order.md](agents/agent-execution-order.md)                                      |
| Licoes operacionais               | [execution-lessons-learned.md](harness/execution-lessons-learned.md)                             |
| Branching, checks e promocao      | [branching-and-delivery-strategy.md](github/branching-and-delivery-strategy.md)                  |
| Limites e estrategia da Vercel    | [vercel-limits-assessment.md](platform/vercel-limits-assessment.md)                              |
| Seguranca da interface            | [frontend-security-assessment.md](security/frontend-security-assessment.md)                      |
| Versionamento documental          | [document-versioning.md](specs/document-versioning.md)                                           |

## Estrutura do codigo e comandos

O app e uma aplicacao web estatica: a entrada fica em `index.html`, os estilos em `css/`, a coordenacao da interface em `js/app.js`, os dados em `js/data/` e as telas em `js/views/`. Os validadores e runners ficam em `scripts/`; as suites automatizadas estao em `tests/`; os controles de CI estao em `.github/workflows/`.

Use Node.js 24 e npm. `npm ci` instala as dependencias; `npm run dev` inicia o servidor local; `npm run verify:local` executa testes, lint, formato e verificacao do diff. Os testes de interface usam Playwright. No CI, `ubuntu-24.04` fornece Google Chrome preinstalado, selecionado pelo canal Playwright `chrome`; o workflow nao baixa um navegador.

## Governanca dos documentos

O inventario e os hashes ficam em `config/document-catalog.json`. Depois de alterar um documento Markdown catalogado, sincronize e valide o registro:

```bash
npm run documents:sync
npm run validate:documents
```

O catalogo registra identidade, versao e hash; ele nao representa aceite humano. Especificacoes e aprovacao continuam seguindo os gates descritos nos proprios documentos e nas issues ou PRs correspondentes.

## Manutencao

- Requisitos de produto devem permanecer ligados ao escopo e as especificacoes pertinentes.
- Decisoes arquiteturais relevantes devem atualizar `architecture/` e os contratos afetados.
- O backlog documentado e o Project organizam a execucao; preservar o vinculo entre issue, PR, validacao e evidencia.
- `develop` e integracao. `main` e producao e so recebe promocao em PR separado, com checks e autorizacao de release.
