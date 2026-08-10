# Matriz de Curadoria: Crustaceos e Miriapodes

## Fontes e limites

| Tema       | Referencia                           | Quantidade |
| ---------- | ------------------------------------ | ---------- |
| Crustaceos | Roteiro escolar, Ciencias, pagina 40 | 20         |
| Miriapodes | Roteiro escolar, Ciencias, pagina 43 | 20         |

Fontes institucionais foram usadas somente para conferir fatos zoologicos, sem
ampliar o escopo curricular:

- [BioKIDS/University of Michigan](https://www.biokids.umich.edu/critters/Crustacea/)
  para crustaceos;
- [University of Minnesota Extension](https://extension.umn.edu/insect-relatives/sowbugs-millipedes-and-centipedes)
  para centopeias e piolhos-de-cobra.

## Distribuicao de Crustaceos

| Itens         | Foco                                                |
| ------------- | --------------------------------------------------- |
| `001` a `005` | classificacao, exemplos, ambientes e antenas        |
| `006` a `010` | exoesqueleto, muda, locomocao e especies terrestres |
| `011` a `015` | respiracao, umidade, decapodes e pincas             |
| `016` a `020` | crescimento, comparacoes, conservacao e seguranca   |

## Distribuicao de Miriapodes

| Itens         | Foco                                                   |
| ------------- | ------------------------------------------------------ |
| `001` a `005` | classificacao, exemplos, segmentos, antenas e protecao |
| `006` a `010` | habitat e diferencas entre os principais grupos        |
| `011` a `015` | alimentacao, defesa, quantidade de pernas e coluna     |
| `016` a `020` | muda, comparacoes, ambiente e observacao segura        |

## Guardrails

- nao afirmar que todos os crustaceos vivem no mar ou possuem dez pernas;
- apresentar dois pares de antenas como caracteristica dos crustaceos;
- limitar a respiracao por branquias a muitos crustaceos aquaticos;
- nao atribuir exatamente cem pernas a toda centopeia nem mil a todo piolho-de-cobra;
- diferenciar um par de pernas por segmento das centopeias de dois pares por
  segmento aparente dos piolhos-de-cobra usando `geralmente`;
- diferenciar os habitos predadores de muitas centopeias dos habitos
  decompositores de muitos piolhos-de-cobra;
- evitar contato direto com animais desconhecidos;
- implementar cada tema com `correctIndex` distribuido em `5/5/5/5`;
- manter quatro alternativas, uma resposta correta e tres retornos de erro por item;
- aplicar ortografia e acentuacao corretas em todo texto exibido para a crianca;
- manter `2026-t2-v1` como `draft`.
