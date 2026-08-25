# Manifesto Curricular: 3o Trimestre de 2026

## Estado atual

| Campo                 | Valor             |
| --------------------- | ----------------- |
| Ano letivo            | 2026              |
| Trimestre             | `t3`              |
| Serie                 | `3-ano`           |
| `contentSetId`        | `2026-t3-v1`      |
| Versao do manifesto   | 1                 |
| Estado do manifesto   | `awaiting-source` |
| Estado inicial acervo | `draft`           |
| Aprovacao             | pendente          |

Este documento reserva o contrato e nao declara temas curriculares. O material
presente em `SchoolContent/` identifica explicitamente o segundo trimestre e
nao pode ser reutilizado por inferencia como fonte do T3.

Enquanto o estado for `awaiting-source`:

- nenhuma materia ou tema T3 e considerado autorizado;
- nenhuma questao T3 pode ser criada, revisada ou implementada;
- `2026-t3-v1` nao deve ser adicionado ao catalogo executavel;
- o seletor e a producao permanecem inalterados;
- T1 permanece congelado e T2 permanece publicado sem modificacao.

## Fonte curricular

| Campo                 | Valor                            |
| --------------------- | -------------------------------- |
| Identificador interno | pendente                         |
| Data de recebimento   | pendente                         |
| Formato               | pendente                         |
| Custodia              | `SchoolContent/`, nao versionado |
| Escopo confirmado     | pendente                         |
| Lacunas               | fonte T3 ainda nao recebida      |

## Matriz curricular

A matriz sera preenchida somente a partir da fonte T3 confirmada, usando uma
linha por Objeto de Conhecimento e exatamente 20 questoes como meta por linha.

| Materia ID | Materia  | Tema ID  | Objeto de Conhecimento | Objetivo verificavel | Meta | Suporte especifico | Estado    |
| ---------- | -------- | -------- | ---------------------- | -------------------- | ---: | ------------------ | --------- |
| pendente   | pendente | pendente | pendente               | pendente             |   20 | pendente           | bloqueado |

A linha `pendente` e apenas um marcador de ausencia de fonte. Ela nao conta
como tema nem como meta de cobertura e deve ser removida quando a matriz real
for extraida.

## Gate para iniciar a extracao

- [ ] a fonte declara 2026, terceiro trimestre e 3o ano;
- [ ] o arquivo foi mantido fora do Git;
- [ ] o Product Owner confirmou que a fonte esta completa;
- [ ] materias e colunas relevantes foram identificadas;
- [ ] divergencias entre formatos da fonte foram registradas.

## Gate para congelar o manifesto

- [ ] todas as materias e todos os Objetos de Conhecimento foram extraidos;
- [ ] cada tema possui ID unico, objetivo verificavel e meta 20;
- [ ] duplicidades, omissoes e nomes inconsistentes foram verificados;
- [ ] requisitos especificos, inclusive apoio bilingue, foram registrados;
- [ ] totais por materia e total geral foram calculados;
- [ ] nao existe decisao bloqueante em aberto;
- [ ] o manifesto foi comparado novamente com a fonte;
- [ ] o Product Owner registrou o `go` humano no card #301;

Quando todos os itens forem atendidos, a versao deve mudar de
`awaiting-source` para `frozen`. Somente entao o #301 pode ser concluido e a
curadoria do piloto #300 pode ser considerada, respeitando tambem #302 e #303.

## Controle de alteracoes

| Versao | Data       | Estado          | Descricao                                       | Aprovacao |
| -----: | ---------- | --------------- | ----------------------------------------------- | --------- |
|      1 | 2026-08-24 | awaiting-source | contrato reservado; fonte T3 ainda nao recebida | pendente  |

Alteracoes posteriores seguem
`docs/specs/curriculum-intake-template.md`. Nenhuma mudanca neste manifesto
autoriza publicacao direta ou substitui revisao pedagogica humana.
