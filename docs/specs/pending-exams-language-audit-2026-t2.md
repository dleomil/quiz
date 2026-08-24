# Auditoria linguistica das provas pendentes - 2026 T2

## Contexto

Um aluno relatou erros de portugues em textos exibidos pelo quiz. Como o
produto apoia criancas em fase de alfabetizacao e consolidacao da escrita,
enunciados, alternativas e explicacoes incorretos podem reforcar aprendizados
inadequados.

Esta especificacao complementa os gates de qualidade de conteudo e registra a
correcao emergencial no card `#276`.

## Escopo e ordem

A auditoria considera somente o acervo `2026-t2-v1` e segue a ordem das provas
que ainda nao ocorreram:

1. Geografia - 20/08/2026.
2. Ingles - 21/08/2026.
3. Portugues - 24/08/2026.

Historia, Ciencias, Matematica e todo o acervo do primeiro trimestre estao fora
do escopo. O primeiro trimestre e legado congelado e nao deve gerar outro ciclo,
novo card, auditoria, correcao ou migracao.

## Textos obrigatorios

Cada questao deve ter revisados:

- enunciado;
- quatro alternativas;
- explicacao da resposta correta;
- tres explicacoes das respostas incorretas;
- nome do topico quando exibido para a crianca.

## Requisitos de qualidade

- ortografia, acentuacao, concordancia, regencia e pontuacao corretas;
- linguagem natural, completa e adequada ao terceiro ano;
- uma unica resposta defensavel com base no enunciado;
- pronomes e referencias sem antecedente ambiguo;
- explicacoes que indiquem por que a alternativa esta certa ou errada;
- ausencia de afirmacoes conceitualmente imprecisas;
- preservacao dos IDs, topicos e quantidade de questoes;
- nenhuma referencia a pagina de apostila exibida para a crianca.

## Estrategia de entrega

Cada materia deve usar branch e PR proprios. A materia seguinte pode ser
auditada em paralelo, mas somente uma materia por vez pode entrar no fluxo de
liberacao. A producao permanece inalterada ate que o lote tenha:

1. parecer do Pedagogical Quality Agent;
2. correcoes rastreadas por ID;
3. validacao estrutural e testes automatizados aprovados;
4. teste de interface no navegador;
5. aprovacao humana registrada no card ou PR;
6. deploy controlado e verificacao posterior ao deploy.

## Lote 1 - Geografia

Foram auditados 60 enunciados, 240 alternativas, 60 explicacoes corretas e 180
explicacoes incorretas, totalizando 540 textos visiveis. O parecer identificou
ajustes nos IDs:

`GEO-T2-CAR-010`, `GEO-T2-REP-003`, `GEO-T2-REP-007`,
`GEO-T2-REP-008`, `GEO-T2-REP-010`, `GEO-T2-REP-012`,
`GEO-T2-REP-013`, `GEO-T2-MAP-001`, `GEO-T2-MAP-003`,
`GEO-T2-MAP-007`, `GEO-T2-MAP-008`, `GEO-T2-MAP-012` e
`GEO-T2-MAP-017`.

As correcoes abrangem concordancia, clareza, explicacoes sem referente,
ambiguidade pronominal e precisao conceitual. Nenhuma questao, ID ou topico foi
adicionado ou removido.

## Lote 2 - Ingles

Foram auditadas 80 questoes, totalizando 720 textos visiveis. O parecer
identificou 47 IDs com ajustes: 16 de severidade alta e 31 de severidade media.
Os bloqueios incluem enunciados sem contexto suficiente para definir uma unica
preposicao, alternativas igualmente defensaveis, traducoes imprecisas e falta
de acentuacao nos textos em portugues.

Este lote esta diagnosticado, mas ainda nao foi corrigido. Ele nao pode manter
aprovacao pedagogica nem seguir para liberacao antes de branch propria,
correcao dos 47 IDs, nova auditoria integral e aprovacao humana.

## Lote 3 - Portugues

Foram auditadas 120 questoes, com 20 itens em cada um dos seis temas. O parecer
identificou 47 IDs com ajustes: 25 de severidade alta, quatro de severidade
media e 18 de severidade baixa. Os bloqueios incluem lacunas que formam palavras
incorretas, mais de uma resposta defensavel, erros de acentuacao e regencia e
enunciados que nao correspondem a suas alternativas.

Este lote esta diagnosticado, mas ainda nao foi corrigido. Ele nao pode manter
aprovacao pedagogica nem seguir para liberacao antes de branch propria,
correcao dos 47 IDs, nova auditoria integral e aprovacao humana.

## Evidencias esperadas

- lista de IDs alterados e parecer pedagogico no card `#276`;
- saidas de `npm run validate:content`, `npm run test:content`,
  `npm run lint` e `npm run format:check`;
- evidencia do fluxo de Geografia no navegador, incluindo resposta correta e
  incorreta;
- confirmacao de que os demais acervos nao foram modificados;
- URL de preview e resultado da verificacao antes de qualquer deploy.

## Criterio de conclusao

A historia so pode ser concluida quando Geografia, Ingles e Portugues tiverem
seus lotes corrigidos, validados e registrados. A conclusao de uma materia nao
autoriza automaticamente a publicacao das demais.
