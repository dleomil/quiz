# Mapa de Cobertura: 2o Trimestre de 2026

## Objetivo

Registrar o escopo curricular autorizado para preparar lotes do acervo
`2026-t2-v1`. Este documento e um mapa de planejamento; nao e uma fonte de
questoes e nao contem transcricoes de materiais de terceiros.

## Regra de rastreabilidade por tema

O produto cria conteudo original a partir dos temas curriculares autorizados.
A rastreabilidade registra programa, ano, trimestre, materia e tema; pagina de
apostila nao e requisito, referencia de resposta nem bloqueio editorial.

Fontes institucionais podem apoiar verificacao factual quando necessario, mas
nao substituem os gates de clareza, adequacao etaria, resposta unica e aprovacao
humana.

## Regra de capacidade

A unidade de planejamento e completude do segundo trimestre e cada tema da
coluna `Objetos de Conhecimento` do roteiro. Cada tema deve possuir exatamente
20 questoes originais e aprovadas no acervo `2026-t2-v1`.

O total por disciplina nao e uma meta fixa: ele resulta da quantidade de temas
do roteiro. Um acervo so pode ser publicado quando todos os temas previstos
para o trimestre atingirem 20 questoes e passarem pelos gates de qualidade.

## Matriz de cobertura auditada

Auditoria atualizada em 10 de agosto de 2026 a partir dos temas autorizados e
das questoes executaveis de `develop`. A coluna `Atual` conta somente questoes
com `contentSetId: 2026-t2-v1`.

| Disciplina | Objeto de conhecimento                             | Atual | Meta | Card        |
| ---------- | -------------------------------------------------- | ----: | ---: | ----------- |
| Historia   | Nossas origens: a Africa                           |    20 |   20 | #245        |
| Historia   | Os principais grupos linguisticos africanos        |    20 |   20 | #246        |
| Historia   | Os africanos e a escravidao                        |    20 |   20 | #247        |
| Historia   | Os afrodescendentes na atualidade                  |    20 |   20 | #244        |
| Ciencias   | Caracteristicas e desenvolvimento dos artropodes   |    20 |   20 | #206 (Done) |
| Ciencias   | Introducao ao estudo dos insetos                   |    20 |   20 | #206 (Done) |
| Ciencias   | Introducao ao estudo dos aracnideos                |    20 |   20 | #206 (Done) |
| Ciencias   | Introducao ao estudo dos crustaceos                |    20 |   20 | #206 (Done) |
| Ciencias   | Introducao ao estudo dos miriapodes                |    20 |   20 | #206 (Done) |
| Ciencias   | Caracteristicas e desenvolvimento dos equinodermos |    20 |   20 | #206 (Done) |
| Matematica | Lidando com moedas e notas                         |    20 |   20 | concluido   |
| Matematica | Multiplicacao por 20, 30, 40, 50, 60, 70, 80 e 90  |    20 |   20 | concluido   |
| Matematica | Explorando graficos de barras e de colunas         |    20 |   20 | concluido   |
| Matematica | Explorando tabelas e graficos de dupla entrada     |    20 |   20 | concluido   |
| Matematica | Prisma                                             |    20 |   20 | concluido   |
| Matematica | Figuras geometricas planas                         |    20 |   20 | concluido   |
| Matematica | Vamos medir?                                       |    20 |   20 | concluido   |
| Matematica | Retas paralelas                                    |    20 |   20 | concluido   |
| Geografia  | O que e Cartografia?                               |    20 |   20 | #228 (Done) |
| Geografia  | Diferentes representacoes cartograficas            |    20 |   20 | #228 (Done) |
| Geografia  | Os mapas e a representacao do espaco               |    20 |   20 | #228 (Done) |
| Ingles     | Prepositions                                       |    20 |   20 | #231        |
| Ingles     | Father's Day                                       |    20 |   20 | #231        |
| Ingles     | Sports                                             |    20 |   20 | #231        |
| Ingles     | Action verbs                                       |    20 |   20 | #231        |
| Portugues  | Usos de L e U                                      |    20 |   20 | #137        |
| Portugues  | Pronomes pessoais e pronomes de tratamento         |    20 |   20 | #137        |
| Portugues  | Palavras com ce e ci                               |    20 |   20 | #137        |
| Portugues  | Verbos I                                           |    20 |   20 | #137        |
| Portugues  | Palavras semelhantes                               |    20 |   20 | #174        |
| Portugues  | Verbos II                                          |    20 |   20 | #137        |

### Resumo da auditoria

| Disciplina | Temas completos | Temas previstos | Questoes atuais |    Meta |
| ---------- | --------------: | --------------: | --------------: | ------: |
| Historia   |               4 |               4 |              80 |      80 |
| Ciencias   |               6 |               6 |             120 |     120 |
| Matematica |               8 |               8 |             160 |     160 |
| Geografia  |               3 |               3 |              60 |      60 |
| Ingles     |               4 |               4 |              80 |      80 |
| Portugues  |               6 |               6 |             120 |     120 |
| **Total**  |          **31** |          **31** |         **620** | **620** |

Todos os temas previstos no mapa possuem 20 questoes executaveis no acervo
`2026-t2-v1`, atualmente publicado. O manifesto executavel correspondente fica
em `config/content-coverage-manifest.json`; qualquer divergencia entre ele e as
questoes bloqueia `npm run validate:content`.

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
2. O Content Curator Agent prepara questoes originais com referencia de materia
   e tema curricular.
3. O Pedagogical Quality Agent valida linguagem, ortografia, ausencia de
   ambiguidade, resposta unica e explicacoes.
4. A aprovacao humana pedagogica fica registrada antes de alterar arquivos de
   questoes.
5. O PR do lote executa `npm run validate:content` e `npm test`; o catalogo
   `2026-t2-v1` so pode ser publicado junto de um lote aprovado e testado.

Para um novo trimestre, o manifesto deve ser atualizado no mesmo PR que cria o
catalogo. Acervos `draft` podem ter menos questoes que a meta enquanto estao em
construcao; temas desconhecidos e quantidades acima da meta sempre bloqueiam. Ao
alterar o status para `published`, todos os temas declarados devem atingir
exatamente a quantidade esperada.

## Criterios de aceite por tema

- cada tema do roteiro possui exatamente 20 questoes aprovadas;
- cada pacote de curadoria deve conter as 20 questoes completas do tema;
- cada questao usa `content-v1`, `contentSetId: 2026-t2-v1` e `sourceRef`
  limitado a programa, disciplina e tema;
- nenhuma questao depende de trecho transcrito de material de terceiros;
- cada enunciado possui uma unica resposta correta defensavel;
- explicacao da resposta correta e explicacoes das alternativas incorretas sao
  adequadas ao 3o ano;
- historico e acervo do 1o trimestre continuam acessiveis apos a publicacao.
