# Auditoria linguistica de Portugues - 2026 T2

## Objetivo

Corrigir o acervo de Portugues do segundo trimestre antes da prova de
24/08/2026, eliminando erros de formacao de palavras, ortografia, regencia,
ambiguidade e explicacoes fragmentadas. Este lote implementa a etapa de
Portugues do card `#276`.

## Escopo

- acervo `2026-t2-v1`;
- 120 questoes em seis temas;
- 120 enunciados, 480 alternativas, 120 explicacoes corretas e 360 explicacoes
  incorretas;
- IDs dos temas `usos_de_l_e_u`, `palavras_com_ce_e_ci`, `verbos_i`,
  `pronomes_pessoais_tratamento`, `verbos_ii` e `palavras_semelhantes`.

Historia, Ciencias, Matematica, Geografia, Ingles e o primeiro trimestre nao
podem ser alterados neste lote.

## Diagnostico inicial

A primeira auditoria encontrou 47 IDs com ajustes:

- 25 bloqueantes por palavra formada incorretamente, mais de uma resposta
  defensavel, regencia ou enunciado incompatível com as alternativas;
- quatro de severidade media por clareza e naturalidade;
- 18 de severidade baixa por feedbacks fragmentados ou sem padronizacao;
- 73 IDs sem achados.

A segunda auditoria integral confirmou 39 correcoes e encontrou 14 ajustes
residuais. Oito pertenciam ao diagnostico inicial e seis estavam em novos IDs,
totalizando 53 IDs modificados no lote. Cinco desses ajustes eram bloqueantes
por ambiguidade ou substituicao que formava uma frase incorreta.

## Requisitos

- preservar os 120 IDs, seis temas e quatro alternativas por questao;
- garantir que a alternativa correta complete literalmente a lacuna exibida;
- usar ortografia, acentuacao, regencia e pontuacao corretas;
- garantir uma unica resposta defensavel com base no enunciado;
- evitar pronomes ou formas de tratamento sem contexto suficiente;
- usar frases completas nos feedbacks, com inicial maiuscula e pontuacao;
- explicar individualmente por que cada alternativa esta errada;
- manter linguagem natural e adequada ao terceiro ano;
- exigir nova auditoria integral e aprovacao humana antes da liberacao.

## Validacao

- `npm run validate:content`;
- `npm run test:content`;
- `npm run lint`;
- `npm run format:check`;
- `npm test`;
- smoke Playwright com resposta correta e incorreta;
- inspecao visual em desktop e mobile;
- preview autenticado da Vercel antes de qualquer promocao.

## Criterio de conclusao

O lote so fica pronto quando os 47 achados iniciais e os 14 ajustes residuais
estiverem corrigidos, a auditoria final nao apontar bloqueios, todas as
validacoes passarem e a aprovacao humana estiver registrada no card ou PR. A
conclusao deste lote nao autoriza automaticamente a liberacao de Geografia ou
Ingles.
