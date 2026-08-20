# Auditoria linguistica de Ingles - 2026 T2

## Objetivo

Corrigir o acervo de Ingles do segundo trimestre antes da prova de 21/08/2026,
eliminando erros de portugues, traducoes imprecisas e questoes com mais de uma
resposta defensavel. Este lote implementa a etapa de Ingles do card `#276`.

## Escopo

- acervo `2026-t2-v1`;
- 80 questoes em quatro temas;
- 80 enunciados, 320 alternativas, 80 explicacoes corretas e 240 explicacoes
  incorretas;
- IDs `ING-T2-PRE-*`, `ING-T2-FAD-*`, `ING-T2-SPO-*` e `ING-T2-ACT-*`.

Historia, Ciencias, Matematica, Geografia, Portugues e o primeiro trimestre nao
podem ser alterados neste lote.

## Diagnostico inicial

A primeira auditoria encontrou 47 IDs com ajustes:

- 16 bloqueantes por ambiguidade ou mais de uma resposta defensavel;
- 31 editoriais por ortografia, acentuacao, traducao ou clareza;
- 33 IDs sem achados.

A segunda auditoria confirmou a resolucao dos 47 problemas originais e
identificou sete ajustes residuais em sete IDs. Tres desses IDs nao faziam parte
da lista inicial, totalizando 50 IDs modificados no lote.

## Requisitos

- preservar os 80 IDs, quatro temas e quatro alternativas por questao;
- usar acentuacao correta em todo texto em portugues;
- fornecer contexto suficiente para existir uma unica resposta correta;
- nao apresentar uma frase gramaticalmente valida como se estivesse errada;
- traduzir `skateboarding` como `andar de skate` neste contexto;
- explicar `in front of` como posicao a frente, sem usar `before`;
- manter linguagem curta e adequada ao terceiro ano;
- revisar enunciado, alternativas e quatro explicacoes de cada ID;
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

O lote so fica pronto quando os 47 achados iniciais e os sete ajustes residuais
estiverem corrigidos, a auditoria final nao apontar bloqueios, todas as
validacoes passarem e a aprovacao
humana estiver registrada no card ou PR. A conclusao deste lote nao autoriza
automaticamente a liberacao de Geografia ou Portugues.
