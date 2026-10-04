# Piloto T3 Ciencias Luz e Visao

## Objetivo

Validar o fluxo completo do T3 com um único tema de Ciências antes de abrir a
produção paralela. O piloto não publica o acervo T3 e não altera T1 ou T2.

## Identificação

| Campo                   | Valor                           |
| ----------------------- | ------------------------------- |
| Acervo                  | `2026-t3-v1`                    |
| Matéria                 | Ciências                        |
| Tema                    | `luz-visao`                     |
| Meta                    | 20 questões originais           |
| Prova relacionada       | 2026-10-14                      |
| Estado                  | `draft`                         |
| Prazo interno de pacote | 2026-10-07                      |
| Card                    | #300, dependente do intake #301 |

## Escopo curricular

O pacote deve cobrir, sem copiar texto da fonte, fontes de luz, visão, cuidados
com a saúde visual e propriedades introdutórias da luz. Afirmações factuais
serão conferidas contra o roteiro e, quando necessário, fonte institucional ou
primária adequada.

## Definition of Ready

- [x] tema consta do manifesto T3 congelado;
- [x] objetivo verificável e meta 20 definidos;
- [x] ano, série, trimestre e prova relacionados;
- [x] fonte sob custódia local e fora do Git;
- [x] formato final das questões confirmado;
- [x] referências de evidência por lote registradas;
- [x] responsável humano pelo aceite do piloto confirmado.

## Definition of Done

- 20 questões com IDs `2026t3v1_cie_luz_visao_*`;
- quatro alternativas, resposta única e `correctIndex` válido;
- explicação correta e feedback para as três alternativas incorretas;
- revisão curricular/factual concluída;
- revisão pedagógica/linguística concluída;
- duas passagens registradas como sequenciais pelo mesmo agente, se essa for a
  configuração da fase atual;
- relatório sem achado bloqueante pendente;
- distribuição 5/5/5/5;
- validador estrutural e testes de navegador executados em harness isolado;
- aprovação humana do piloto e decisão explícita `go` para produção editorial.

## Sequência e calendário

| Data limite | Entrega                                  |
| ----------- | ---------------------------------------- |
| 2026-10-03  | fechar formato, evidências e responsável |
| 2026-10-04  | produzir lote inicial para revisão       |
| 2026-10-05  | concluir passagem curricular/factual     |
| 2026-10-06  | concluir passagem pedagógica/linguística |
| 2026-10-07  | validar lote, navegador e distribuição   |
| 2026-10-08  | registrar aprovação humana e `go/no-go`  |

Se o piloto não cumprir todos os gates até 08/10, o T3 permanece invisível e
T2 V2 continua sendo o acervo padrão.

## Evidências esperadas

- pacote de 20 questões em formato draft;
- duas passagens de auditoria e referências sem transcrição da fonte;
- resultados de validação e regressão;
- evidência de seletor, sessão e histórico isolados;
- decisão humana de `go/no-go` no card #300.

## Decisão do piloto

Em 2026-10-03, o Product Owner registrou `go` para iniciar a curadoria dos
demais temas do T3. O acervo `2026-t3-v1` permanece `draft` e invisível; esta
decisão não autoriza publicação nem alteração do runtime.
