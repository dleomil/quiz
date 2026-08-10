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

## Regra de capacidade

A unidade de planejamento e completude do segundo trimestre e cada tema da
coluna `Objetos de Conhecimento` do roteiro. Cada tema deve possuir exatamente
20 questoes originais e aprovadas no acervo `2026-t2-v1`.

O total por disciplina nao e uma meta fixa: ele resulta da quantidade de temas
do roteiro. Um acervo so pode ser publicado quando todos os temas previstos
para o trimestre atingirem 20 questoes e passarem pelos gates de qualidade.

## Matriz de cobertura auditada

Auditoria realizada em 9 de agosto de 2026 a partir do roteiro escolar local e
das questoes executaveis de `develop`. A coluna `Atual` conta somente questoes
com `contentSetId: 2026-t2-v1`.

| Disciplina | Objeto de conhecimento                             | Referencia       | Atual | Meta | Card           |
| ---------- | -------------------------------------------------- | ---------------- | ----: | ---: | -------------- |
| Historia   | Nossas origens: a Africa                           | pagina 67        |     0 |   20 | #230           |
| Historia   | Os principais grupos linguisticos africanos        | pagina 69        |     0 |   20 | #230           |
| Historia   | Os africanos e a escravidao                        | pagina 72        |     0 |   20 | #230           |
| Historia   | Os afrodescendentes na atualidade                  | pagina 76        |     0 |   20 | #230           |
| Ciencias   | Caracteristicas e desenvolvimento dos artropodes   | pagina 35        |    20 |   20 | #206 (Done)    |
| Ciencias   | Introducao ao estudo dos insetos                   | pagina 36        |    20 |   20 | #206 (Done)    |
| Ciencias   | Introducao ao estudo dos aracnideos                | pagina 39        |    20 |   20 | #206 (Done)    |
| Ciencias   | Introducao ao estudo dos crustaceos                | pagina 40        |    20 |   20 | #206 (Done)    |
| Ciencias   | Introducao ao estudo dos miriapodes                | pagina 43        |    20 |   20 | #206 (Done)    |
| Ciencias   | Caracteristicas e desenvolvimento dos equinodermos | pagina 45        |    20 |   20 | #206 (Done)    |
| Matematica | Lidando com moedas e notas                         | pagina 81        |    20 |   20 | concluido      |
| Matematica | Multiplicacao por 20, 30, 40, 50, 60, 70, 80 e 90  | pagina 84        |    20 |   20 | concluido      |
| Matematica | Explorando graficos de barras e de colunas         | pagina 86        |    20 |   20 | concluido      |
| Matematica | Explorando tabelas e graficos de dupla entrada     | pagina 88        |    20 |   20 | concluido      |
| Matematica | Prisma                                             | pagina 91        |    20 |   20 | concluido      |
| Matematica | Figuras geometricas planas                         | pagina 92        |    20 |   20 | concluido      |
| Matematica | Vamos medir?                                       | pagina 94        |    20 |   20 | concluido      |
| Matematica | Retas paralelas                                    | pagina 95        |    20 |   20 | concluido      |
| Geografia  | O que e Cartografia?                               | pagina 53        |     0 |   20 | #228           |
| Geografia  | Diferentes representacoes cartograficas            | pagina 54        |     0 |   20 | #228           |
| Geografia  | Os mapas e a representacao do espaco               | pagina 58        |     0 |   20 | #228           |
| Ingles     | Prepositions                                       | material escolar |     0 |   20 | #231           |
| Ingles     | Father's Day                                       | material escolar |     0 |   20 | #231           |
| Ingles     | Sports                                             | material escolar |     0 |   20 | #231           |
| Ingles     | Action verbs                                       | material escolar |     0 |   20 | #231           |
| Portugues  | Usos de L e U                                      | pagina 8         |    20 |   20 | #137           |
| Portugues  | Pronomes pessoais e pronomes de tratamento         | pagina 9         |    20 |   20 | #137           |
| Portugues  | Palavras com ce e ci                               | pagina 16        |    20 |   20 | #137           |
| Portugues  | Verbos I                                           | pagina 18        |    20 |   20 | #137           |
| Portugues  | Palavras semelhantes                               | pagina 25        |     0 |   20 | #174 bloqueado |
| Portugues  | Verbos II                                          | pagina 27        |    20 |   20 | #137           |

### Resumo da auditoria

| Disciplina | Temas completos | Temas previstos | Questoes atuais |    Meta |
| ---------- | --------------: | --------------: | --------------: | ------: |
| Historia   |               0 |               4 |               0 |      80 |
| Ciencias   |               6 |               6 |             120 |     120 |
| Matematica |               8 |               8 |             160 |     160 |
| Geografia  |               0 |               3 |               0 |      60 |
| Ingles     |               0 |               4 |               0 |      80 |
| Portugues  |               5 |               6 |             100 |     120 |
| **Total**  |          **19** |          **31** |         **380** | **620** |

As 240 questoes restantes pertencem a 12 temas. `Palavras semelhantes`
permanece bloqueado no card #174 ate que as paginas da apostila ou uma lista de
pares autorizados permita validar respostas unicas. Historia, Geografia e
Ingles devem seguir, respectivamente, pelas historias #230, #228 e #231.

`Atividades adicionais` e uma secao de exercicios, nao um objeto avaliavel
autonomo no roteiro. Ela nao cria uma meta adicional. Se uma atividade revelar
um novo objeto curricular, o mapa deve ser alterado por uma decisao pedagogica
registrada antes da curadoria.

O livro paradidatico indicado no roteiro nao entra automaticamente no quiz.
Qualquer lote baseado nele exige uma historia propria, objetivo de aprendizagem
definido e avaliacao de direitos de uso.

## Sequencia segura de entrega

1. Selecionar uma disciplina e um tema do mapa para lotes que, somados,
   atinjam 20 questoes.
2. O Content Curator Agent prepara questoes originais com referencias minimas
   de apostila e pagina.
3. O Pedagogical Quality Agent valida linguagem, ortografia, ausencia de
   ambiguidade, resposta unica e explicacoes.
4. A aprovacao humana pedagogica fica registrada antes de alterar arquivos de
   questoes.
5. O PR do lote executa `npm run validate:content` e `npm test`; o catalogo
   `2026-t2-v1` so pode ser publicado junto de um lote aprovado e testado.

## Criterios de aceite por tema

- cada tema do roteiro possui exatamente 20 questoes aprovadas;
- um lote pode ter no maximo dez questoes, mas nao encerra o tema sozinho se
  o total ainda for inferior a 20;
- cada questao usa `content-v1`, `contentSetId: 2026-t2-v1` e `sourceRef`
  limitado a identificador, disciplina e pagina;
- nenhuma questao depende de trecho transcrito da apostila;
- cada enunciado possui uma unica resposta correta defensavel;
- explicacao da resposta correta e explicacoes das alternativas incorretas sao
  adequadas ao 3o ano;
- historico e acervo do 1o trimestre continuam acessiveis apos a publicacao.
