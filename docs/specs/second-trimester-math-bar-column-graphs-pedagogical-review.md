# Revisao Pedagogica: Graficos de Barras e Colunas

## Identificacao

| Campo             | Valor                                              |
| ----------------- | -------------------------------------------------- |
| Acervo            | `2026-t2-v1`                                       |
| Disciplina        | Matematica                                         |
| Tema              | `graficos_barras_colunas`                          |
| Proposta revisada | `second-trimester-math-bar-column-graphs-draft.md` |
| Estado            | aguardando aprovacao humana                        |

## Parecer

O lote propoe 20 questoes originais, de leitura direta e comparacao de dados
simples. Os enunciados informam todos os valores necessarios, evitando que a
resposta dependa de imagem, escala oculta ou convencao nao apresentada. Cada
item tem uma unica resposta defensavel e linguagem apropriada ao 3o ano.

Os contextos alternam graficos de barras e colunas. Eles cobrem identificacao
de quantidade, maior e menor valor, diferenca, total, empate e funcao do titulo,
sem exigir conteudo alem do objetivo curricular indicado.

## Explicacoes validadas

| ID    | Explicacao da resposta correta                             | Feedback das alternativas incorretas                                                       |
| ----- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `001` | Banana tem 8 votos, mais que 5 e 3.                        | Maca tem 5; uva tem 3; nao ha empate porque as quantidades sao diferentes.                 |
| `002` | Uva tem 3 votos, menos que 5 e 8.                          | Banana tem a maior quantidade; maca tem 5; nao ha empate.                                  |
| `003` | 8 mais 5 e igual a 13.                                     | 3 e a diferenca; 8 e so a banana; 40 nao representa essa soma.                             |
| `004` | 8 menos 3 e igual a 5.                                     | 8 e o total da banana; 11 soma as quantidades; 24 nao representa a diferenca.              |
| `005` | Terca tem 9 livros, a maior quantidade.                    | Segunda tem 6; quarta tem 7; quinta tem 4.                                                 |
| `006` | A quinta-feira corresponde a 4 livros.                     | 5 nao aparece; 7 e quarta; 9 e terca.                                                      |
| `007` | 9 menos 4 e igual a 5.                                     | 4 e a quantidade de quinta; 9 e a de terca; 13 seria uma soma.                             |
| `008` | 6 mais 9 mais 7 mais 4 e igual a 26.                       | 13 e soma parcial; 22 nao inclui todos os dias; 64 nao representa o total.                 |
| `009` | Cachorros tem 10 preferencias.                             | Gatos tem 7; passaros tem 4; existe uma barra com 10.                                      |
| `010` | 10 menos 7 e igual a 3.                                    | 2 nao e a diferenca; 7 e a quantidade dos gatos; 17 seria uma soma.                        |
| `011` | 10 mais 7 mais 4 e igual a 21.                             | 14 e soma parcial; 17 nao inclui todos; 70 nao representa o total.                         |
| `012` | Gatos tem 7 votos e passaros tem 4.                        | Cachorros tem mais que gatos; passaros tem menos que gatos; as quantidades nao sao iguais. |
| `013` | A bola vermelha tem 12 escolhas.                           | 8 e azul; 10 e verde; 30 e a soma das tres cores.                                          |
| `014` | Verde tem 10, que e 2 a mais que 8.                        | Vermelha tem 12, quatro a mais; azul e a referencia; ha uma cor com 2 a mais.              |
| `015` | 8 mais 10 e igual a 18.                                    | 2 e a diferenca; 10 e so a verde; 80 nao representa a soma.                                |
| `016` | Vermelha tem 12, a maior quantidade.                       | Azul tem 8; verde tem 10; as colunas nao tem a mesma altura.                               |
| `017` | Maca e biscoito tem 9 escolhas cada.                       | Maca e queijo tem 9 e 6; queijo e biscoito tem 6 e 9; queijo nao empatou.                  |
| `018` | 9 menos 6 e igual a 3.                                     | 6 e a quantidade de queijo; 9 e a maior quantidade; 15 seria uma soma.                     |
| `019` | 9 mais 6 mais 9 e igual a 24.                              | 15 e soma parcial; 18 soma as duas quantidades de 9; 96 nao representa o total.            |
| `020` | O titulo informa o assunto do grafico: lanches escolhidos. | O titulo nao define cor, autor ou resposta correta.                                        |

## Requisitos de implementacao

- Cada questao deve ter `explanation` e `wrongExplanations` para as tres
  alternativas incorretas, com linguagem acolhedora.
- Os IDs executaveis devem seguir `mat_t2_gr_001` a `mat_t2_gr_020`.
- Todas devem declarar `contentSetId: '2026-t2-v1'`, schema `content-v1`,
  referencia a Matematica, pagina 86, e `reviewStatus: 'pedagogical-approved'`.
- A implementacao somente pode ocorrer apos aprovacao humana deste parecer no
  card `#150`, seguida de `npm test` e regressao que confirme a ausencia do
  lote para alunos enquanto o acervo estiver em `draft`.

## Decisao do agente de qualidade pedagogica

Status: `aprovado tecnicamente, aguardando aprovacao humana`.

Nao foram encontradas respostas ambiguas, alternativas duplicadas ou termos
inadequados para o publico infantil na proposta revisada.
