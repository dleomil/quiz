# Plano de Prontidao para Conteudo T3

## Objetivo

Preparar um fluxo rapido, seguro e mensuravel para o terceiro trimestre antes
do inicio da producao de questoes. O plano implementa as decisoes da
retrospectiva T2 sem alterar o comportamento atual do produto.

## Premissa de entrada

A producao do T3 permanece bloqueada ate a conclusao da Fase 0. Receber o
material escolar nao autoriza automaticamente curadoria, implementacao ou
publicacao.

## Fase 0 - Readiness do pipeline

**Entregas**

- template unico de intake curricular;
- Content Curator e Pedagogical Quality Agent executaveis em modo restrito;
- corpus de regressao pedagogica e linguistica;
- validador preparado para um `contentSetId` T3 em `draft`;
- checklist unico de evidencias e decisao de `go/no-go` do piloto.

**Gate de saida**

- ferramentas e documentos podem processar um lote ficticio sem alterar
  catalogo publicado ou producao;
- responsabilidades, entradas e saidas estao claras;
- validacoes estruturais, linguisticas e de interface estao identificadas.

## Fase 1 - Intake e contrato curricular

**Entregas**

- ano, trimestre, serie e identificador do acervo;
- lista completa de materias e `Objetos de Conhecimento`;
- objetivo verificavel e meta de 20 questoes para cada tema;
- registro de lacunas e ambiguidades da fonte;
- manifesto curricular revisado e congelado.

**Gate de saida**

- Product Owner confirma o escopo;
- nenhum tema depende de numero de pagina;
- alteracao posterior do manifesto exige decisao registrada e analise de
  impacto nos lotes ja iniciados.

## Fase 2 - Piloto de um tema

**Entregas**

- pacote completo de 20 questoes de um tema;
- primeira passagem de corretude pedagogica;
- segunda passagem independente de linguagem e adequacao infantil;
- aprovacao humana registrada;
- implementacao no acervo `draft` e testes no navegador;
- evidencia de que seletor, sessao e historico continuam isolados.

**Gate de saida**

- zero erro bloqueante;
- 100% de cobertura estrutural;
- resposta unica defensavel em todas as questoes;
- decisao explicita de `go` antes de abrir producao paralela.

## Fase 3 - Producao paralela por tema

**Politica de fluxo**

- no maximo dez temas no pipeline editorial;
- um card por tema, com checklist interno para curadoria e duas revisoes;
- no maximo um tema em implementacao;
- no maximo um PR em verificacao/release;
- tema bloqueado volta ao backlog ou permanece marcado como `blocked` com causa
  objetiva.

**Gate por tema**

- Definition of Ready atendida antes da curadoria;
- Definition of Done atendida antes da implementacao;
- nenhum defeito conhecido e transferido para o proximo gate.

## Fase 4 - Integracao do acervo

**Entregas**

- manifesto completo e contagem exata por tema;
- distribuicao de `correctIndex` validada;
- regressao de todas as materias;
- testes de navegacao, quantidade de questoes, sessao e historico;
- revisao de diferencas entre contrato curricular e acervo final.

**Gate de saida**

- o acervo permanece `draft` e invisivel;
- todos os checks automatizados passam;
- evidencias consolidadas estao no epic de release;
- riscos residuais e rollback estao registrados.

## Fase 5 - Publicacao controlada

**Sequencia**

1. Abrir PR exclusivo de release.
2. Validar preview sem expor segredo ou dado de aluno.
3. Obter aprovacao manual do Product Owner.
4. Promover de `develop` para `main`.
5. Executar smoke test de producao.
6. Monitorar feedback sem misturar correcoes pontuais ao release original.

**Rollback**

Retirar o T3 do catalogo publicado ou restaurar o estado anterior sem alterar
T1 e T2. O rollback deve ser exercitado no piloto em nivel de configuracao.

## Definition of Ready por tema

- materia, tema, objetivo e `contentSetId` pertencem ao manifesto congelado;
- publico e nivel de linguagem estao definidos;
- formato da questao e suporte bilingue, quando aplicavel, estao definidos;
- fonte permitida e restricoes autorais estao registradas;
- nao existe ambiguidade curricular aberta;
- card do tema possui aceite, validacao e evidencias esperadas.

## Definition of Done editorial por tema

- existem exatamente 20 questoes originais;
- cada questao possui uma resposta unica defensavel;
- alternativas incorretas sao naturais, plausiveis e inequivocamente erradas;
- explicacao correta e tres feedbacks incorretos orientam o aprendizado;
- ortografia, concordancia, pontuacao e adequacao infantil foram revisadas;
- as duas passagens independentes e a aprovacao humana estao registradas;
- o pacote passa pelo validador estrutural antes da implementacao.

## Metricas do ciclo

| Metrica                        | Definicao                                       | Meta inicial T3          |
| ------------------------------ | ----------------------------------------------- | ------------------------ |
| Aprovacao na primeira passagem | temas sem devolucao na revisao pedagogica       | pelo menos 80%           |
| Retrabalho editorial           | questoes alteradas depois da aprovacao humana   | no maximo 5%             |
| Defeitos escapados             | erros encontrados depois da publicacao          | zero bloqueante          |
| Tempo de ciclo                 | entrada pronta ate pacote editorial aprovado    | medir baseline no piloto |
| Cobertura automatica           | checks estruturais executados no PR             | 100%                     |
| Rastreabilidade                | questoes ligadas a tema e objetivo do manifesto | 100%                     |

Metas devem ser recalibradas com dados do piloto. Velocidade nao pode ser
melhorada omitindo revisao ou deslocando defeitos para producao.

## Backlog estrutural recomendado

1. Congelar o contrato de intake curricular do T3.
2. Tornar os agentes editoriais executaveis e validar seus guardrails.
3. Criar corpus e checks de regressao pedagogica/linguistica.
4. Executar o piloto completo de um tema e decidir `go/no-go`.
5. Somente depois, criar os cards de producao dos temas reais.

## Dependencias

- `docs/harness/t2-content-cycle-retrospective.md`;
- `docs/harness/content-update-quality-gates.md`;
- `docs/specs/curriculum-content-update-governance.md`;
- `docs/agents/content-curator-agent.md`;
- `docs/agents/pedagogical-quality-agent.md`.
