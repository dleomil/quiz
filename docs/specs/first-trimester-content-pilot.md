# Spec: Primeiro Lote do 2o Trimestre

## Objetivo

Preparar um piloto pequeno e reversivel para o acervo `2026-t2-v1`, sem publicar conteudo antes da revisao humana.

## Escopo

- uma materia e um topico por lote
- no maximo dez questoes
- referencia de fonte por pagina ou secao, sem anexar o arquivo escolar
- revisao do Content Curator Agent e do Pedagogical Quality Agent

## Criterios de aceite

- todas as questoes atendem a `content-v1` e passam no validador
- existe aprovacao humana pedagogica registrada
- o catalogo so muda de `draft` para `published` no PR do lote aprovado
- o PR possui teste de regressao e rollback por revert

## Nao objetivos

- nao abrir ou importar o material escolar nesta etapa
- nao publicar perguntas sem a proxima autorizacao explicita
