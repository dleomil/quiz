# Matriz de Curadoria: Aracnideos e Equinodermos

## Fontes e limites

| Tema         | Referencia                           | Quantidade |
| ------------ | ------------------------------------ | ---------- |
| Aracnideos   | Roteiro escolar, Ciencias, pagina 39 | 20         |
| Equinodermos | Roteiro escolar, Ciencias, pagina 45 | 20         |

Fontes institucionais usadas somente para conferencia factual:

- [Smithsonian National Museum of Natural History](https://naturalhistory.si.edu/visit/accessibility/audio-and-visual-description/insect-zoo-audio-description-tour)
  e [University of Minnesota Extension](https://extension.umn.edu/insect-relatives/spiders)
  para aracnideos;
- [NOAA Ocean Service](https://oceanservice.noaa.gov/facts/starfish.html) e
  [Smithsonian Ocean](https://ocean.si.edu/ocean-life/invertebrates/sea-stars-urchins-and-relatives)
  para equinodermos.

## Distribuicao de Aracnideos

| Itens         | Foco                                                  |
| ------------- | ----------------------------------------------------- |
| `001` a `005` | classificacao, exemplos, pernas, antenas e corpo      |
| `006` a `010` | diversidade, exoesqueleto, muda e comparacao          |
| `011` a `015` | alimentacao, seda, exemplos e risco sem generalizacao |
| `016` a `020` | ambientes, movimento e observacao segura              |

## Distribuicao de Equinodermos

| Itens         | Foco                                                   |
| ------------- | ------------------------------------------------------ |
| `001` a `005` | classificacao, ambiente, exemplos e pele espinhosa     |
| `006` a `010` | simetria, pes ambulacrais, sistema aquifero e espinhos |
| `011` a `015` | comparacao, esqueleto, regeneracao e ovos              |
| `016` a `020` | desenvolvimento, diversidade, ecologia e conservacao   |

## Guardrails

- usar oito pernas apenas para aracnideos adultos;
- nao afirmar que todo aracnideo produz teia ou e perigoso;
- distinguir aranhas de insetos por pernas, antenas e regioes corporais;
- nao afirmar que toda estrela-do-mar possui exatamente cinco bracos;
- limitar equinodermos a ambientes marinhos;
- tratar simetria em cinco partes e regeneracao sem regras absolutas;
- nao orientar contato ou retirada de animais do ambiente;
- implementar cada tema com `correctIndex` distribuido em `5/5/5/5`;
- manter quatro alternativas, uma resposta correta e tres retornos de erro por item;
- aplicar ortografia e acentuacao corretas em todo texto exibido para a crianca;
- manter `2026-t2-v1` como `draft`.
