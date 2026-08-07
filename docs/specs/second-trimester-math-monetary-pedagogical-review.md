# Parecer Pedagogico: Lote de Sistema Monetario

## Escopo revisado

- proposta: `docs/specs/second-trimester-math-monetary-draft.md`
- serie: 3o ano
- acervo pretendido: `2026-t2-v1`
- itens: `MAT-T2-MON-001` a `MAT-T2-MON-006`

## Resultado

**Aprovado para implementacao, condicionado a aprovacao humana pedagogica.**

O parecer avalia a qualidade da proposta. Ele nao publica conteudo, nao muda o
catalogo e nao substitui a etapa de aprovacao humana registrada.

## Checkpoints aplicados

| Item             | Linguagem e ortografia | Resposta unica     | Alternativas                  | Explicacoes          | Resultado |
| ---------------- | ---------------------- | ------------------ | ----------------------------- | -------------------- | --------- |
| `MAT-T2-MON-001` | adequada ao 3o ano     | R$ 7,00            | distintas e nao concorrentes  | explica soma e erros | aprovado  |
| `MAT-T2-MON-002` | adequada ao 3o ano     | R$ 15,00           | distintas e nao concorrentes  | explica composicao   | aprovado  |
| `MAT-T2-MON-003` | adequada ao 3o ano     | R$ 2,00            | distingue preco de troco      | explica subtracao    | aprovado  |
| `MAT-T2-MON-004` | adequada ao 3o ano     | R$ 8,00            | distingue preco, troco e soma | explica subtracao    | aprovado  |
| `MAT-T2-MON-005` | adequada ao 3o ano     | R$ 10,00 + R$ 5,00 | valores verificaveis          | explica valor exato  | aprovado  |
| `MAT-T2-MON-006` | adequada ao 3o ano     | R$ 2,00            | distingue diferenca de soma   | explica comparacao   | aprovado  |

## Verificacoes adicionais

- o lote permaneceu limitado a composicao, comparacao e troco simples; a
  proposta que exigia multiplicacao foi removida antes deste parecer;
- os contextos de compra sao apenas situacoes cotidianas originais e nao
  reproduzem exercicios ou texto da apostila;
- os feedbacks de erro corrigem o raciocinio sem constranger a crianca;
- nenhuma questao exige conhecimento fora do objetivo declarado.

## Gate restante

Antes da implementacao, deve existir aprovacao humana pedagogica registrada em
`#119`. Depois disso, o Implementer Agent podera adicionar o novo topico e as
questoes em um PR separado, executar o validador, os testes de regressao e o
teste controlado de dois acervos antes de publicar `2026-t2-v1`.
