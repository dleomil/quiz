# Revisao humana das falhas do benchmark de agentes v2

**Estado:** classificacao confirmada pelo mantenedor em 2026-10-22.
**Entrega:** #404, PR corretivo #410.  
**Pacote avaliado:** SHA-256 `93d837d8d3864b50568961b3583bd13026f30d1e3bb40d537d6fe750dc459914`.  
**Relatorio privado:** SHA-256 `da16bbb25bd1107ffcdf7825e1f9b91cb74899f8171cfdba48a559cd111feb7d`.

## Resultado original

A campanha terminou com 31 de 32 tentativas consumidas, 17 aprovacoes e 11
reprovacoes entre 28 comparacoes. O resultado historico classificou dez como
qualidade e uma como validacao de saida, sem falha tecnica. Esses registros,
recibos e capturas permanecem inalterados; esta revisao nao recalcula as
metricas nem autoriza nova chamada.

## Reclassificacao proposta

| Tentativas                                                                                                                                                                                                                             | Quantidade | Evidencia resumida                                                                                                                                    | Interpretacao proposta                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------: | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `v2-code-1-author-luna`, `v2-code-1-author-sol`, `v2-code-2-author-luna`, `v2-code-2-author-sol`, `v2-documentation-1-author-luna`, `v2-documentation-1-author-sol`, `v2-documentation-2-author-luna`, `v2-documentation-2-author-sol` |          8 | A CLI informou que o host de Code Mode estava desativado; as propostas nao foram produzidas.                                                          | Falhas do ambiente de execucao, nao evidencia de baixa qualidade dos modelos.      |
| `v2-historia-valida-editorial-candidate`, `v2-ingles-valido-editorial-candidate`                                                                                                                                                       |          2 | Controles validos foram bloqueados por alegacoes de ferramenta sem evento correspondente; o preflight comprovou isolamento e ausencia de ferramentas. | Falsos bloqueios do avaliador, sem defeito editorial demonstrado nesses controles. |
| `v2-curation-1-author-sol`                                                                                                                                                                                                             |          1 | `findings[0].questionId` nao correspondeu a uma questao da proposta.                                                                                  | Falha genuina de contrato/validacao da saida.                                      |

## Correcao ja integrada e limites

O PR #410 integrou a verificacao antecipada do host de Code Mode e a regra que
so desconsidera alegacao de uso de ferramenta quando o preflight e os eventos
comprovam o isolamento. A captura, a classificacao e os recibos historicos nao
foram reescritos. A correcao melhora a validade de execucoes futuras, mas nao
converte esta amostra em prova geral de capacidade nem habilita modelos ou
categorias para uso regular.

## Decisao do mantenedor

O mantenedor confirmou a reclassificacao acima em [#404](https://github.com/dleomil/quiz/issues/404#issuecomment-6354156955).
A issue #404 foi encerrada como concluida; #405 pode prosseguir conforme seu
escopo proprio. A iniciativa #400 permanece aberta ate a conclusao das demais
entregas. A tentativa restante nao esta autorizada para correcao, repeticao ou
comparacao de verificadores. Capturas brutas e dados completos do relatorio
permanecem no perfil privado de avaliacao, fora do Git e do GitHub.
