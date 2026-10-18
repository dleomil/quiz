# Inglês T3: revisão dos apoios em português, versão 2

Incidente: [#392](https://github.com/dleomil/quiz/issues/392).
Público: 3º ano do Ensino Fundamental. Quatro temas, 20 questões por tema.

## Estado e escopo da revisão

A sessão principal realizou uma passagem pedagógica e uma passagem linguística
dos 80 apoios alterados. Este registro é revisão do autor, sem representar
parecer de agente independente ou aprovação humana. O pacote de correspondências
EN/PT depende de aceite editorial humano antes da publicação.

Os 80 enunciados ingleses, alternativas, respostas, explicações, feedbacks,
habilidades, fontes e IDs foram preservados. A revisão cobre o apoio em português;
os demais campos foram conferidos como invariantes. As questões corrigidas têm
versão 2. Nenhum material-fonte escolar foi transcrito ou publicado.

As quatro auditorias anteriores `2026-t3-v1-ing-*-audit.json` permanecem intactas
como evidência histórica. Foram emitidas pelos geradores da versão 1; seus
registros favoráveis automáticos não comprovam a revisão desses novos apoios.
Os geradores corrigidos validam as questões e gravam somente os rascunhos.

## Passagem pedagógica

- Present continuous: a ação solicitada é explicada em português. As frases com
  lacunas, a ordem das palavras e os verbos avaliados, como `play` e `read`,
  permanecem em inglês. O apoio não completa as lacunas nem fornece a forma -ing.
- Places in the city: perguntas sobre a função de locais receberam tradução
  específica. A expressão `places in the city` foi preservada quando seu
  significado constitui a própria pergunta.
- Celebrations: foram preservados `birthday`, `present`, `party`,
  `family celebration` e `celebrate` nas perguntas de significado. As demais
  instruções receberam tradução adequada à ação pedida, sem inserir a resposta.
- Means of transport: características e situações receberam tradução específica.
  Os termos `driver`, `passenger` e `means of transport` foram preservados quando
  constituem o conteúdo lexical avaliado. A condição “sem motor” foi mantida.

Observação preexistente: em `2026t3v1_ing_means_transport_018`, o inglês usa
“transport” para uma alternativa referente à calçada. O apoio usa “opção” para
orientar a escolha sem classificar a calçada como veículo. O enunciado original
permanece preservado; essa classificação deve ser avaliada em correção separada.

## Passagem linguística

Os 80 pares foram relidos para conferir ação, sentido, tempo verbal, negação,
acentuação, concordância e clareza. Foram usadas perguntas curtas, como “Em que
lugar...” e “Qual veículo...”. Instruções equivalentes podem compartilhar uma
tradução correta; não foi imposta uma exigência artificial de 80 textos únicos.

As expressões em inglês dentro dos apoios identificam o conteúdo a ser avaliado.
Na revisão das perguntas de significado, foi conferido que o apoio não inclui a
tradução da palavra que o aluno precisa interpretar.

## Evidências e critérios

- O runtime público anterior contém 80 apoios genéricos iguais. A nova validação
  rejeita os 80, inclusive variações de caixa, espaços, pontuação e acentos.
- O validador também rejeita apoio ausente, vazio ou que apenas repete o enunciado
  inglês em conteúdo ativo de T2/T3. Esses controles não constituem verificação
  semântica universal; revisão editorial continua necessária.
- O contrato do conteúdo original foi congelado em
  `tests/fixtures/content/english-t3-bilingual-baseline.json`. Seu digest cobre
  todos os campos preservados dos 80 IDs do main anterior à correção.
- Os testes comparam gerador, rascunho e runtime, validam cobertura 20/20/20/20,
  versão 2 e distribuição 5/5/5/5. Casos semânticos verificam lacunas, negação,
  termos avaliados e ausência de respostas reveladas nos exemplos críticos.
- Cada gerador é executado em diretório temporário, com verificação de que produz
  o rascunho validado e não produz auditorias.
- A interface é verificada nas 80 questões no quiz e no gabarito, com respostas
  certas e erradas dos quatro temas, desktop/celular e temas claro/escuro.

## Publicação

`npm run verify:local` foi concluído com sucesso: suíte integral, lint,
formatação e integridade do diff. A verificação de interface passou nas 80
questões, com 320 respostas em desktop/celular e temas claro/escuro; as capturas
do quiz e do gabarito foram inspecionadas visualmente.

Branch isolada `release/correcao-apoio-ingles-t3`, baseada em `main`, em modo
protegido. O runtime passa a ser referenciado como `t3-published.js?v=3`.
Publicar após aceite editorial, suíte integral, checks remotos e preview; conferir
o lote em produção e reconciliar em `develop` por PR exclusivo.

A investigação histórica da perda do requisito e das lacunas das validações será
entregue depois da correção publicada, conforme a prioridade definida pelo
mantenedor. Reversão por PR em caso de regressão bloqueante; a versão anterior
restaura o apoio genérico e exige nova contenção.

## Identificação do pacote revisado

| Tema               | SHA-256 das questões do rascunho                                   |
| ------------------ | ------------------------------------------------------------------ |
| present-continuous | `c12a5af50406302121d186f041bbbe4507cb9640dd722bb19a48c30b14b90510` |
| places-city        | `bddff5db730b484b495c062bf5042d301743604ddc5b2e94550e01d69bc02d8c` |
| celebrations       | `4c291971c2f6bf183f56231680a937e4c16be206c5e30569ef74f517a7f4761a` |
| means-transport    | `848607aa503a71c677bc111455df684962ce25d423d0f9b867ae39ad538cd777` |
