# Revisao Pedagogica: Multiplicacao por Dezenas

## Identificacao

| Campo             | Valor                                                           |
| ----------------- | --------------------------------------------------------------- |
| Acervo            | `2026-t2-v1`                                                    |
| Disciplina        | Matematica                                                      |
| Tema              | `multiplicacao_por_dezenas`                                     |
| Proposta revisada | `second-trimester-math-tens-multiplication-completion-draft.md` |
| Estado            | aguardando aprovacao humana                                     |

## Parecer

O lote contem 20 questoes originais, com uma unica resposta correta e
enunciados curtos adequados ao calculo mental e ao registro no caderno. A
cobertura percorre multiplicacoes por 20, 30, 40, 50, 60 e 70, sem introduzir
procedimentos ou conceitos fora do tema.

A revisao corrigiu a ultima questao para `3 x 70 = 210`. Assim, o lote segue a
referencia declarada e nao inclui a dezena 90, que nao fazia parte do objetivo
do recorte original.

## Explicacoes validadas

| ID    | Explicacao da resposta correta | Feedback das alternativas incorretas                                                 |
| ----- | ------------------------------ | ------------------------------------------------------------------------------------ |
| `001` | 2 grupos de 20 formam 40.      | 22 soma os numeros; 200 trata 20 como 100; 60 seriam 3 grupos de 20.                 |
| `002` | 3 grupos de 20 formam 60.      | 40 sao 2 grupos; 80 sao 4 grupos; 600 trata 20 como 200.                             |
| `003` | 4 grupos de 20 formam 80.      | 60 sao 3 grupos; 100 sao 5 grupos; 800 trata 20 como 200.                            |
| `004` | 5 grupos de 20 formam 100.     | 80 sao 4 grupos; 90 nao completa 5 grupos; 200 trata 20 como 40.                     |
| `005` | 2 grupos de 30 formam 60.      | 50 fica 10 a menos; 90 sao 3 grupos; 600 trata 30 como 300.                          |
| `006` | 3 grupos de 30 formam 90.      | 60 sao 2 grupos; 120 sao 4 grupos; 900 trata 30 como 300.                            |
| `007` | 4 grupos de 30 formam 120.     | 90 sao 3 grupos; 100 nao completa 4 grupos; 300 trata 30 como 75.                    |
| `008` | 5 grupos de 30 formam 150.     | 120 sao 4 grupos; 180 sao 6 grupos; 300 trata 30 como 60.                            |
| `009` | 2 grupos de 40 formam 80.      | 60 fica 20 a menos; 100 soma 40 duas vezes de modo incorreto; 800 trata 40 como 400. |
| `010` | 3 grupos de 40 formam 120.     | 100 fica 20 a menos; 140 nao e multiplo de 40; 400 trata 40 como 100.                |
| `011` | 4 grupos de 40 formam 160.     | 120 sao 3 grupos; 140 nao completa 4 grupos; 400 trata 40 como 100.                  |
| `012` | 5 grupos de 40 formam 200.     | 180 fica 20 a menos; 220 passa 20; 400 sao 10 grupos de 40.                          |
| `013` | 2 grupos de 50 formam 100.     | 80 fica 20 a menos; 120 passa 20; 500 trata 50 como 250.                             |
| `014` | 3 grupos de 50 formam 150.     | 100 sao 2 grupos; 200 sao 4 grupos; 500 sao 10 grupos.                               |
| `015` | 4 grupos de 50 formam 200.     | 150 sao 3 grupos; 180 nao e multiplo de 50; 500 sao 10 grupos.                       |
| `016` | 5 grupos de 50 formam 250.     | 200 sao 4 grupos; 300 sao 6 grupos; 500 sao 10 grupos.                               |
| `017` | 2 grupos de 60 formam 120.     | 100 fica 20 a menos; 140 passa 20; 600 trata 60 como 300.                            |
| `018` | 3 grupos de 60 formam 180.     | 150 fica 30 a menos; 200 passa 20; 600 sao 10 grupos.                                |
| `019` | 2 grupos de 70 formam 140.     | 120 fica 20 a menos; 160 passa 20; 700 trata 70 como 350.                            |
| `020` | 3 grupos de 70 formam 210.     | 180 fica 30 a menos; 200 fica 10 a menos; 700 nao representa 3 grupos de 70.         |

## Requisitos de implementacao

- Cada questao deve ter `explanation` com a explicacao correta acima e
  `wrongExplanations` para cada alternativa incorreta, sem linguagem punitiva.
- Os IDs executaveis devem ser unicos e seguir o padrao existente do acervo:
  `mat_t2_md_001` a `mat_t2_md_020`.
- Todas devem declarar `contentSetId: '2026-t2-v1'`, `contentVersion:
'content-v1'` e manter o acervo em `draft`.
- A implementacao so pode ocorrer apos aprovacao humana deste parecer no card
  `#141` e deve incluir `npm test` e regressao que confirme a ausencia das
  questoes para alunos enquanto o acervo estiver em `draft`.

## Decisao do agente de qualidade pedagogica

Status: `aprovado tecnicamente, aguardando aprovacao humana`.

Nao foram encontradas respostas ambiguas, alternativas duplicadas ou termos
inadequados para o publico infantil na proposta revisada.
