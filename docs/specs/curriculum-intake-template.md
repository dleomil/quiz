# Template de Intake Curricular

## Objetivo

Definir a fonte da verdade de um novo acervo antes da criacao de questoes. Uma
copia deste template deve ser preenchida para cada ano, trimestre e serie.

## Identificacao do acervo

| Campo                   | Valor                                                |
| ----------------------- | ---------------------------------------------------- |
| Ano letivo              | `<AAAA>`                                             |
| Trimestre               | `<t1, t2 ou t3>`                                     |
| Serie                   | `<serie>`                                            |
| `contentSetId`          | `<AAAA-tN-vN>`                                       |
| Versao do manifesto     | `<numero inteiro positivo>`                          |
| Estado do manifesto     | `<awaiting-source, under-review, frozen ou amended>` |
| Estado inicial acervo   | `draft`                                              |
| Responsavel pelo aceite | `<Product Owner>`                                    |
| Data do aceite          | `<AAAA-MM-DD ou pendente>`                           |

O `contentSetId` e imutavel depois do congelamento. Uma alteracao em conteudo
ja publicado exige nova versao do acervo, conforme
`docs/specs/content-schema-v1.md`.

## Registro da fonte

| Campo                 | Valor                            |
| --------------------- | -------------------------------- |
| Identificador interno | `<referencia sem dado sensivel>` |
| Data de recebimento   | `<AAAA-MM-DD>`                   |
| Formato recebido      | `<docx, pdf ou outro>`           |
| Escopo declarado      | `<ano, trimestre e serie>`       |
| Custodia              | `SchoolContent/; nao versionado` |
| Lacunas ou conflitos  | `<lista objetiva ou nenhum>`     |
| Restricoes de uso     | `<lista objetiva>`               |

Nao registrar transcricoes extensas, paginas de apostila, credenciais, dados de
alunos ou informacoes pessoais. O manifesto registra apenas o programa
curricular necessario para produzir conteudo original.

## Matriz curricular

Cada linha representa exatamente um Objeto de Conhecimento autorizado. Nao
agrupar dois objetos independentes para reduzir a meta.

| Materia ID | Materia  | Tema ID | Objeto de Conhecimento | Objetivo verificavel | Meta | Suporte especifico  | Estado                                |
| ---------- | -------- | ------- | ---------------------- | -------------------- | ---: | ------------------- | ------------------------------------- |
| `<id>`     | `<nome>` | `<id>`  | `<tema>`               | `<objetivo>`         |   20 | `<regra ou nenhum>` | `<proposto, confirmado ou bloqueado>` |

Regras:

- a meta e de exatamente 20 questoes originais por linha;
- o total da materia e calculado, nunca fixado em 150;
- tema e objetivo devem ser compreensiveis sem referencia de pagina;
- Ingles deve declarar suporte instrucional em portugues;
- um objeto ambiguo permanece `bloqueado` ate decisao registrada;
- atividades adicionais nao viram tema sem objetivo curricular proprio;
- o livro paradidatico nao entra automaticamente no escopo.

## Resumo de cobertura

| Materia   | Quantidade de temas | Meta calculada |
| --------- | ------------------: | -------------: |
| `<nome>`  |      `<quantidade>` | `<temas x 20>` |
| **Total** |      `<quantidade>` |       `<soma>` |

## Registro de lacunas e decisoes

| ID     | Tipo                                           | Descricao     | Impacto            | Decisao                 | Responsavel | Estado                  |
| ------ | ---------------------------------------------- | ------------- | ------------------ | ----------------------- | ----------- | ----------------------- |
| `<id>` | `<lacuna, ambiguidade, conflito ou restricao>` | `<descricao>` | `<temas afetados>` | `<decisao ou pendente>` | `<papel>`   | `<aberto ou resolvido>` |

Nenhum manifesto pode ser congelado com decisao curricular bloqueante em
aberto.

## Checklist de consistencia

- [ ] ano, trimestre, serie e fonte sao coerentes;
- [ ] cada materia e tema aparece uma unica vez;
- [ ] IDs sao estaveis, unicos e seguem o padrao do produto;
- [ ] cada tema possui objetivo observavel e meta 20;
- [ ] totais por materia e geral foram recalculados;
- [ ] nao ha referencias de pagina ou transcricoes protegidas;
- [ ] restricoes de idioma e adequacao infantil estao registradas;
- [ ] lacunas e ambiguidades bloqueantes foram resolvidas;
- [ ] o `contentSetId` ainda nao existe em outro trimestre ou versao;
- [ ] o acervo permanece `draft` e invisivel;
- [ ] Product Owner aprovou explicitamente o congelamento.

## Estados e transicoes

| Estado            | Significado                                       | Proxima transicao permitida |
| ----------------- | ------------------------------------------------- | --------------------------- |
| `awaiting-source` | fonte curricular ainda nao recebida ou confirmada | `under-review`              |
| `under-review`    | matriz em extracao e validacao                    | `frozen`                    |
| `frozen`          | contrato aprovado para curadoria                  | `amended`                   |
| `amended`         | mudanca controlada apos congelamento              | `frozen`                    |

Somente `frozen` autoriza curadoria. Implementacao e publicacao continuam
dependendo dos demais gates do pipeline.

## Controle de mudanca

Toda alteracao depois do congelamento deve registrar:

1. solicitante, data, motivo e fonte da mudanca;
2. linhas adicionadas, removidas ou alteradas;
3. impacto em temas ja curados, revisados ou implementados;
4. decisao de continuar, refazer, retirar ou versionar o lote;
5. nova versao do manifesto e aprovacao do Product Owner.

Mudanca de texto sem efeito curricular incrementa a versao do manifesto.
Mudanca que invalide questoes aprovadas reabre os gates dos temas afetados.
Mudanca em acervo publicado cria novo `contentSetId`.

## Aprovacao

| Papel                   | Nome     | Decisao         | Data     | Evidencia |
| ----------------------- | -------- | --------------- | -------- | --------- |
| Responsavel pelo intake | `<nome>` | `<parecer>`     | `<data>` | `<link>`  |
| Revisor curricular      | `<nome>` | `<parecer>`     | `<data>` | `<link>`  |
| Product Owner           | `<nome>` | `<go ou no-go>` | `<data>` | `<link>`  |

Uma aprovacao automatizada ou de agente nao substitui o `go` humano do Product
Owner.
