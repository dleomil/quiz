# Mapa de Cobertura: 2o Trimestre de 2026

## Objetivo

Registrar o escopo curricular autorizado para preparar lotes do acervo
`2026-t2-v1`. Este documento e um mapa de planejamento; nao e uma fonte de
questoes, nao contem transcricoes e nao substitui a apostila escolar.

## Regra para referencias de apostila

Quando o roteiro indicar `Apostila`, a indicacao representa material que o
aluno deve estudar na apostila fornecida pela escola. No produto, essa
informacao pode ser usada somente como referencia minima de rastreabilidade:

- registrar apostila, disciplina e pagina em `sourceRef`;
- usar o objetivo curricular para orientar uma proposta original de questao;
- nao anexar, copiar ou publicar paginas, enunciados ou imagens da apostila;
- bloquear a questao se a referencia nao permitir confirmar uma unica resposta
  correta.

O arquivo-fonte local continua em `SchoolContent/` e permanece fora do Git.

## Cobertura identificada

| Disciplina | Referencia de estudo                  | Escopo para curadoria                                                                                            |
| ---------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Historia   | Apostilas 4 (67-77) e 5 (77-79)       | origens africanas, grupos linguisticos, escravizacao, afrodescendentes e formacao do povo brasileiro             |
| Ciencias   | Apostilas 4 (35-47) e 5 (41-43)       | artropodes, seus grupos, equinodermos e visao relacionada a luz                                                  |
| Matematica | Apostilas 4 (81-98) e 5 (93-95)       | sistema monetario, multiplicacao, leitura de tabelas e graficos, geometria, medidas, paralelismo e probabilidade |
| Geografia  | Apostilas 4 (53-62) e 5 (63-64)       | cartografia, representacoes do espaco e agua como recurso                                                        |
| Ingles     | Material indicado pela escola (49-62) | preposicoes, vocabulario de esportes, verbos de acao e contexto de Dia dos Pais                                  |
| Portugues  | Apostilas 4 (8-32) e 5 (8-10)         | usos de letras, pronomes, verbos, palavras semelhantes, onomatopeias, interjeicoes e cedilha                     |

O livro paradidatico indicado no roteiro nao entra automaticamente no quiz.
Qualquer lote baseado nele exige uma historia propria, objetivo de aprendizagem
definido e avaliacao de direitos de uso.

## Sequencia segura de entrega

1. Selecionar uma disciplina e um objetivo do mapa para um lote de ate dez
   questoes.
2. O Content Curator Agent prepara questoes originais com referencias minimas
   de apostila e pagina.
3. O Pedagogical Quality Agent valida linguagem, ortografia, ausencia de
   ambiguidade, resposta unica e explicacoes.
4. A aprovacao humana pedagogica fica registrada antes de alterar arquivos de
   questoes.
5. O PR do lote executa `npm run validate:content` e `npm test`; o catalogo
   `2026-t2-v1` so pode ser publicado junto de um lote aprovado e testado.

## Criterios de aceite do primeiro lote

- no maximo uma disciplina e um objetivo por lote;
- cada questao usa `content-v1`, `contentSetId: 2026-t2-v1` e `sourceRef`
  limitado a identificador, disciplina e pagina;
- nenhuma questao depende de trecho transcrito da apostila;
- cada enunciado possui uma unica resposta correta defensavel;
- explicacao da resposta correta e explicacoes das alternativas incorretas sao
  adequadas ao 3o ano;
- historico e acervo do 1o trimestre continuam acessiveis apos a publicacao.
