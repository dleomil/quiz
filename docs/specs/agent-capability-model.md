# Spec: Modelo Central de Capacidades dos Agentes

## Objetivo

Definir uma fonte central e validavel para os papeis, capacidades, adapters e
separacoes de responsabilidade usados no fluxo assistido por agentes.

`config/agent-capabilities.json` e a fonte estrutural. Os documentos em
`docs/agents/` continuam sendo os contratos de comportamento, e os TOMLs em
`.codex/agents/` continuam sendo apenas adapters executaveis.

## Contrato `agent-capabilities-v1`

O modelo possui tres colecoes:

- `capabilities`: operacao permitida sobre um tipo de artefato e seu efeito no
  repositorio;
- `roles`: capacidades e documentos contratuais de cada papel;
- `separationRules`: pares de producao e verificacao que exigem atores
  distintos sobre o mesmo artefato.

As operacoes permitidas sao `author`, `review`, `verify`, `operate` e
`research`. Os efeitos permitidos sao `read-only`, `workspace-write` e
`external-write`.

Um papel `documented` existe no modelo operacional, mas nao possui TOML. Um
papel `executable` exige adapter com caminho, nome, modelo, esforco e sandbox.
Nesta versao, todo adapter executavel deve permanecer `read-only` e declarar
explicitamente `mcpPolicy: none`; omissao ou permissao adicional falha fechada.

O piloto descrito em `docs/specs/read-only-governance-mcp-pilot.md` e uma
ferramenta opt-in da sessao principal e nao pertence a um adapter. Ele nao muda
capabilities, papeis, separacoes ou a politica MCP dos agentes executaveis.

## Papeis iniciais

O baseline possui nove papeis:

1. Spec;
2. Architect;
3. Implementer;
4. Verifier;
5. Release and Board;
6. Reviewer;
7. Content Curator;
8. Pedagogical Quality;
9. Product Discovery.

Somente Verifier, Reviewer, Content Curator, Pedagogical Quality e Product
Discovery possuem adapters executaveis nesta fase. Incluir outro adapter ou
ampliar sandbox exige entrega propria, revisao de risco e atualizacao do modelo.

## Separacao obrigatoria

Para o mesmo artefato, a identidade produtora nao pode ser a identidade
verificadora:

- Spec e revisao arquitetural usam atores distintos;
- implementacao e verificacao usam atores distintos;
- implementacao e revisao de PR usam atores distintos;
- proposta curricular e revisao pedagogica usam atores distintos.

O CI impede que um unico papel acumule as duas capabilities de qualquer regra.
Cada avaliacao ou verificacao deve usar um conjunto conforme
`docs/specs/agent-execution-records.md`. O conjunto registra as execucoes dos
dois lados, e o validador confere capability, artefato, versao e identidade
distinta.

A excecao de mantenedor unico registrada em #310 trata somente a aprovacao
humana do GitHub. Ela nao permite que a mesma execucao de agente produza e
revise o mesmo artefato. Parecer de agente continua sem equivaler a aprovacao
humana.

## Validacao

`npm run validate:agents` verifica:

- schema estrito, enums e unicidade;
- referencias de capability e regras de separacao;
- documentos contratuais existentes, versionados e sem symlink;
- correspondencia exata entre adapters e TOMLs;
- nome, modelo, esforco, sandbox, referencias e politica MCP;
- ausencia de papel com capabilities incompativeis.

## Registros por execucao

O modelo declara as incompatibilidades estaticas. O contrato
`agent-execution-record-set-v1` aplica essas regras a cada artefato avaliado ou
pesquisado. A identidade informada continua declaratoria ate existir uma camada
de identidade confiavel; parecer de agente permanece diferente de aprovacao
humana.

## Rollback

Reverter o catalogo, a derivacao dos contratos e as atualizacoes documentais.
Nenhum arquivo participa do runtime do quiz e nao existe migracao de dados.
