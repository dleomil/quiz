# Revisao Pedagogica: Nossas Origens - A Africa

## Escopo

- 20 questoes sobre `Nossas origens: a Africa`;
- publico: criancas do 3o ano;
- referencia curricular: tema de Historia do 2o trimestre;
- acervo de destino futuro: `2026-t2-v1`, mantido como `draft`;
- card: `#245`.

## Parecer tecnico

O lote apresenta a Africa como um continente diverso, formado por muitos
paises, povos, linguas, paisagens e culturas. Ele reconhece historias,
sociedades, conhecimentos e expressoes africanas anteriores a chegada dos
europeus e evita reduzir o continente a escravizacao.

Os enunciados usam conceitos introdutorios e exemplos concretos adequados ao
3o ano. Cada item possui uma resposta defensavel, quatro alternativas,
explicacao da resposta correta e retorno especifico para as tres incorretas.
As alternativas evitam sinonimos concorrentes e nao exigem memorizacao
desnecessaria ao objetivo curricular.

## Revisao antirracista

- a Africa nao e apresentada como pais, bloco uniforme ou cultura unica;
- povos africanos aparecem como sujeitos de suas historias e produtores de
  conhecimentos;
- diferencas culturais nao sao organizadas em escala de valor;
- o lote nao associa todo o continente a pobreza, natureza, aldeias ou
  escravizacao;
- contribuicoes para a formacao do Brasil sao reconhecidas sem atribuir uma
  pratica especifica a todos os povos africanos;
- estereotipos aparecem apenas como alternativas explicitamente corrigidas por
  feedback educativo;
- o vocabulario evita termos pejorativos, folclorizacao e descricoes graficas.

## Riscos revisados

| Risco                                             | Resultado                                                |
| ------------------------------------------------- | -------------------------------------------------------- |
| generalizacao de povos, linguas ou costumes       | mitigado pelo uso de diversidade e pluralidade           |
| historia africana iniciada pela presenca europeia | negado explicitamente                                    |
| sobreposicao com grupos linguisticos              | evitada; nenhuma classificacao de grupos foi introduzida |
| sobreposicao com escravizacao                     | evitada; o tema nao e desenvolvido neste lote            |
| resposta ambigua                                  | nenhuma ambiguidade conhecida apos a revisao tecnica     |
| reproducao de material de terceiros               | nenhum trecho, exercicio ou imagem foi copiado           |
| linguagem inadequada ao 3o ano                    | nenhuma inadequacao conhecida apos a revisao editorial   |

## Validacoes exigidas antes da implementacao

- confirmar automaticamente 20 IDs unicos;
- confirmar quatro alternativas distintas por questao;
- confirmar uma resposta correta presente nas alternativas;
- confirmar tres retornos incorretos por questao;
- confirmar ausencia de enunciados duplicados apos normalizacao;
- registrar aprovacao humana pedagogica no card `#245`.

## Gate

Status: `aprovado tecnicamente, aguardando aprovacao humana`.

Este parecer nao autoriza implementacao nem publicacao. Depois da aprovacao
humana, a implementacao deve ocorrer em PR separado, distribuir `correctIndex`
em `5/5/5/5` e preservar `2026-t2-v1` como `draft`.
