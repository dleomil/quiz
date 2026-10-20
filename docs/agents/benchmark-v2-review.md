# Pacote para revisão humana do benchmark v2

Estado: preparado para revisão; **nenhuma nova chamada autorizada por este documento**.
Entrega #404, PR #410. Este pacote substitui apenas a comparação experimental;
contratos normativos, perfis efetivos e o plano mestre permanecem fixados.

## Decisão solicitada

Aprovar o pacote concreto identificado por commit e SHA-256 emitidos por
`benchmark-check`, antes de registrar `revise-benchmark` ou invocar modelos.
O aceite anterior do plano permite preparar este pacote e seus controles.
O aceite deste pacote é outra etapa, restrita ao experimento sintético.

São 28 novas comparações: 16 editoriais e 12 de autoria. Com as três tentativas
históricas, o total projetado é 31 de um teto global de 32. A tentativa restante
não está autorizada para correção, repetição ou chamada adicional. As duas
comparações de verificadores ficam adiadas e exigem planejamento e orçamento
próprios. Não há aumento do teto nem reinicialização do contador.

## Objetivos e fontes

Todas as entradas são sintéticas, do 3º ano, T3 de 2026, vinculadas ao escopo do
[manifesto curricular](../specs/third-trimester-curriculum-manifest-2026.md).
Nenhum texto escolar protegido é reproduzido. A fonte sintética abaixo define
os fatos fornecidos ao agente. O objetivo da ficha descreve a tarefa do agente;
`input.authorizedObjective` descreve o aprendizado da criança.

### Historia — povo-brasileiro

Objetivo: Reconhecer a diversidade de origens na formação histórica do povo brasileiro.

Habilidade: `reconhecer-diversidade-origens-povo-brasileiro`. Fonte: `synthetic-benchmark-v2-historia`.

- O povo brasileiro tem origens diversas, incluindo povos indígenas, africanos e europeus.
- Esses grupos, entre outros, contribuíram para a formação histórica e cultural do Brasil.
- Reconhecer essa diversidade não significa reduzir a população a uma única origem.

### Ingles — present-continuous

Objetivo: Reconhecer ações em andamento e completar frases com a forma adequada de to be no present continuous.

Habilidade: `reconhecer-acoes-em-andamento-present-continuous`. Fonte: `synthetic-benchmark-v2-ingles`.

- O present continuous expressa uma ação em andamento por meio de sujeito + am/is/are + verbo com ing.
- She combina com is; they combina com are; I combina com am.
- She **_ reading a book corresponde a Ela _** lendo um livro, mantendo a lacuna no apoio.
- They **_ playing in the park corresponde a Eles _** brincando no parque, mantendo a lacuna no apoio.

### Matematica — multiplicacao

Objetivo: Resolver multiplicações do 3º ano e comparar os produtos de pequenos números naturais.

Habilidade: `calcular-comparar-produtos-naturais`. Fonte: `synthetic-benchmark-v2-matematica`.

- Multiplicar pode representar grupos com a mesma quantidade de elementos.
- 2 × 3 = 6 e 3 × 2 = 6; 2 × 2 = 4; 4 × 2 = 8.
- Três grupos de dois elementos totalizam seis; 3 × 2 = 6.

## Oito casos editoriais

Cada caso é executado em processo e contexto próprios, com `gpt-5.6-sol/high`
e `gpt-6.1-sol/high`. A ordem alterna entre os modelos por caso. O agente recebe
a proposta, os fatos autorizados e a passagem solicitada. O resultado esperado,
a classificação válido/inválido e as evidências do avaliador ficam fora do prompt.
Controles válidos exigem aprovação sem achados nem dúvidas. Defeitos exigem o ID
correto, critério exato, gravidade major/blocking e evidência específica. A rubrica
canônica e o avaliador independente não foram relaxados.

### `historia-valida`

Passagem: `pedagogical`. ID: `EVAL-HIS-VALID`. Resultado esperado: aprovar sem achados.

Qual alternativa reconhece a diversidade de origens na formação do povo brasileiro?

1. Povos indígenas, africanos e europeus, entre outros, contribuíram para essa formação.
2. Somente os povos europeus contribuíram para essa formação.
3. Somente os povos indígenas contribuíram para essa formação.
4. Somente os povos africanos contribuíram para essa formação.

Gabarito fornecido: alternativa 1 (índice 0).

Explicação: A população brasileira tem origens diversas: povos indígenas, africanos e europeus, entre outros, contribuíram para sua formação.

Feedback das demais alternativas:

- 2: A formação do povo brasileiro também inclui contribuições indígenas e africanas, além de outras origens.
- 3: Os povos indígenas fazem parte dessa história, junto de africanos, europeus e outros grupos.
- 4: Os povos africanos fazem parte dessa história, junto de indígenas, europeus e outros grupos.

### `ingles-valido`

Passagem: `linguistic`. ID: `EVAL-ENG-VALID`. Resultado esperado: aprovar sem achados.

Complete: She \_\_\_ reading a book.

Apoio: Complete: Ela \_\_\_ lendo um livro.

1. is
2. are
3. am
4. be

Gabarito fornecido: alternativa 1 (índice 0).

Explicação: Com she, usamos is antes do verbo com ing para indicar uma ação em andamento.

Feedback das demais alternativas:

- 2: Are acompanha sujeitos como they, não she.
- 3: Am acompanha I, não she.
- 4: Be não é a forma usada após she nesta frase.

### `historia-em-ingles`

Passagem: `linguistic`. ID: `EVAL-HIS-LANGUAGE`. Resultado esperado: identificar `idioma` com evidência específica.

Which option recognizes the diversity of origins in the formation of the Brazilian people?

1. Indigenous, African and European peoples, among others, contributed to this formation.
2. Only European peoples contributed to this formation.
3. Only Indigenous peoples contributed to this formation.
4. Only African peoples contributed to this formation.

Gabarito fornecido: alternativa 1 (índice 0).

Explicação: The Brazilian population has diverse origins, including Indigenous, African and European peoples, among others.

Feedback das demais alternativas:

- 2: A formação do povo brasileiro também inclui contribuições indígenas e africanas, além de outras origens.
- 3: Os povos indígenas fazem parte dessa história, junto de africanos, europeus e outros grupos.
- 4: Os povos africanos fazem parte dessa história, junto de indígenas, europeus e outros grupos.

Evidências esperadas: Which option / diversity of origins / Indigenous, African.

### `apoio-generico`

Passagem: `linguistic`. ID: `EVAL-ENG-GENERIC`. Resultado esperado: identificar `apoio-generico` com evidência específica.

Complete: She \_\_\_ reading a book.

Apoio: Leia a pergunta em inglês e escolha a alternativa correta.

1. is
2. are
3. am
4. be

Gabarito fornecido: alternativa 1 (índice 0).

Explicação: Com she, usamos is antes do verbo com ing para indicar uma ação em andamento.

Feedback das demais alternativas:

- 2: Are acompanha sujeitos como they, não she.
- 3: Am acompanha I, não she.
- 4: Be não é a forma usada após she nesta frase.

Evidências esperadas: Leia a pergunta / escolha a alternativa correta.

### `resposta-revelada`

Passagem: `linguistic`. ID: `EVAL-ENG-LEAK`. Resultado esperado: identificar `resposta-revelada` com evidência específica.

Complete: She \_\_\_ reading a book.

Apoio: Complete: Ela está lendo um livro. A resposta correta é is.

1. is
2. are
3. am
4. be

Gabarito fornecido: alternativa 1 (índice 0).

Explicação: Com she, usamos is antes do verbo com ing para indicar uma ação em andamento.

Feedback das demais alternativas:

- 2: Are acompanha sujeitos como they, não she.
- 3: Am acompanha I, não she.
- 4: Be não é a forma usada após she nesta frase.

Evidências esperadas: resposta correta é is / Ela está lendo.

### `duas-respostas`

Passagem: `pedagogical`. ID: `EVAL-MAT-AMB`. Resultado esperado: identificar `ambiguidade` com evidência específica.

Qual conta tem resultado 6?

1. 2 × 3
2. 3 × 2
3. 2 × 2
4. 4 × 2

Gabarito fornecido: alternativa 1 (índice 0).

Explicação: Duas vezes três resulta em seis.

Feedback das demais alternativas:

- 2: Confira se há mais de uma conta que chega ao resultado seis.
- 3: Duas vezes dois resulta em quatro.
- 4: Quatro vezes dois resulta em oito.

Evidências esperadas: 2 × 3 / 2 x 3 / 2 vezes 3; 3 × 2 / 3 x 2 / 3 vezes 2.

### `gabarito-incorreto`

Passagem: `pedagogical`. ID: `EVAL-MAT-ANSWER`. Resultado esperado: identificar `resposta-incorreta` com evidência específica.

Quanto é 3 × 2?

1. 5
2. 6
3. 7
4. 8

Gabarito fornecido: alternativa 1 (índice 0).

Explicação: Três grupos de dois elementos totalizam seis.

Feedback das demais alternativas:

- 2: Confira o gabarito: três vezes dois resulta em seis.
- 3: Três vezes dois não resulta em sete.
- 4: Três vezes dois não resulta em oito.

Evidências esperadas: 5 / cinco; 6 / seis.

### `feedback-contraditorio`

Passagem: `pedagogical`. ID: `EVAL-MAT-FEEDBACK`. Resultado esperado: identificar `feedback-contraditorio` com evidência específica.

Quanto é 3 × 2?

1. 5
2. 6
3. 7
4. 8

Gabarito fornecido: alternativa 2 (índice 1).

Explicação: Três grupos de dois elementos totalizam seis.

Feedback das demais alternativas:

- 1: Muito bem! Cinco é a resposta correta para três vezes dois.
- 3: Três grupos de dois totalizam seis, não sete.
- 4: Três grupos de dois totalizam seis, não oito.

Evidências esperadas: Muito bem / Cinco é a resposta correta; 6 / seis.

## Autoria: escopo e aceite

Cada categoria recebe duas tarefas, cada uma comparada entre `gpt-6-luna/medium`
e `gpt-6.1-sol/medium`. A segunda repetição inverte a ordem. Nenhum avaliador
recebe proposta de outro modelo. Não há tentativa de reparo. O avaliador usa os
mesmos requisitos nas duas variantes.

Código: arquivo sintético `score.cjs`; exportar `summarizeResponses(responses)`;
validar array de objetos com `correct` booleano ou lançar TypeError; devolver
somente total, correct, points e percent. Points = correct × 5; percent =
Math.round(correct × 100 / total); entrada vazia retorna todos os valores zero.
Preservar entrada, inclusive congelada, sem dependências ou efeitos externos.
Os testes independentes usam vetores adicionais em sandbox nativa, sem IA.

Documentação: arquivo sintético `guide.txt`, em português, com títulos Execução,
Regras e Falhas; comando exato `node exemplo.cjs --entrada respostas.json --saida resultado.json`;
explicar os quatro resultados, suas fórmulas, entrada vazia, TypeError e uso local
sem rede nem credenciais. Incluir exemplo JSON com duas respostas, uma correta,
produzindo total 2, correct 1, points 5 e percent 50. O avaliador verifica os
requisitos, inclusive fórmulas e exemplo completo.

Curadoria 1: gerar apenas `EVAL-CUR-1`, “Complete: She **_ reading a book.”;
apoio “Complete: Ela _** lendo um livro.”; opções is/are/am/be, correta is.
Curadoria 2: gerar apenas `EVAL-CUR-2`, “Complete: They **_ playing in the park.”;
apoio “Complete: Eles _** brincando no parque.”; opções are/is/am/be, correta are.
Em ambas: objetivo de inglês acima, quatro alternativas distintas, explicação do
gabarito e de todas as erradas, apoio específico com a mesma lacuna e sem resposta
revelada, `reviewStatus=draft` e `humanApprovalRequired=true`. O avaliador canônico
confere identidade, fatos e apoio. Nenhuma proposta é aplicada ou publicada.

## Agenda autorizada

| Slot                                            | Modelo      | Esforço |
| ----------------------------------------------- | ----------- | ------- |
| `v2-historia-valida-editorial-current`          | gpt-5.6-sol | high    |
| `v2-historia-valida-editorial-candidate`        | gpt-6.1-sol | high    |
| `v2-ingles-valido-editorial-candidate`          | gpt-6.1-sol | high    |
| `v2-ingles-valido-editorial-current`            | gpt-5.6-sol | high    |
| `v2-historia-em-ingles-editorial-current`       | gpt-5.6-sol | high    |
| `v2-historia-em-ingles-editorial-candidate`     | gpt-6.1-sol | high    |
| `v2-apoio-generico-editorial-candidate`         | gpt-6.1-sol | high    |
| `v2-apoio-generico-editorial-current`           | gpt-5.6-sol | high    |
| `v2-resposta-revelada-editorial-current`        | gpt-5.6-sol | high    |
| `v2-resposta-revelada-editorial-candidate`      | gpt-6.1-sol | high    |
| `v2-duas-respostas-editorial-candidate`         | gpt-6.1-sol | high    |
| `v2-duas-respostas-editorial-current`           | gpt-5.6-sol | high    |
| `v2-gabarito-incorreto-editorial-current`       | gpt-5.6-sol | high    |
| `v2-gabarito-incorreto-editorial-candidate`     | gpt-6.1-sol | high    |
| `v2-feedback-contraditorio-editorial-candidate` | gpt-6.1-sol | high    |
| `v2-feedback-contraditorio-editorial-current`   | gpt-5.6-sol | high    |
| `v2-code-1-author-luna`                         | gpt-6-luna  | medium  |
| `v2-code-1-author-sol`                          | gpt-6.1-sol | medium  |
| `v2-code-2-author-sol`                          | gpt-6.1-sol | medium  |
| `v2-code-2-author-luna`                         | gpt-6-luna  | medium  |
| `v2-documentation-1-author-luna`                | gpt-6-luna  | medium  |
| `v2-documentation-1-author-sol`                 | gpt-6.1-sol | medium  |
| `v2-documentation-2-author-sol`                 | gpt-6.1-sol | medium  |
| `v2-documentation-2-author-luna`                | gpt-6-luna  | medium  |
| `v2-curation-1-author-luna`                     | gpt-6-luna  | medium  |
| `v2-curation-1-author-sol`                      | gpt-6.1-sol | medium  |
| `v2-curation-2-author-sol`                      | gpt-6.1-sol | medium  |
| `v2-curation-2-author-luna`                     | gpt-6-luna  | medium  |

## Integridade, execução e interrupção

`benchmark-check` compila offline a agenda, as fichas completas, entradas,
resultados esperados, fontes e hashes. Não autentica, não invoca modelos e não
altera o contador. O JSON compilado é o pacote exato submetido a aceite; seu hash
não é inserido neste arquivo para evitar uma referência circular ao commit.

A aprovação registrada deve identificar o commit, hash do pacote e estado
histórico, com origem na manifestação do mantenedor nesta conversa. O registro
local é rastreável e não fornece assinatura criptográfica da identidade humana.
Não criar esse registro antes do aceite explícito do pacote. Ausência de aceite,
aceite de outra versão ou estado alterado bloqueiam a transição.

`revise-benchmark` acrescenta um registro exclusivo à campanha existente. Os
três tickets, recibos, resultados e capturas anteriores conservam seus bytes.
Eles consomem orçamento e aparecem como diagnósticos históricos; não entram nas
métricas de qualidade v2. `inspect-capture` é somente diagnóstico e jamais produz
elegibilidade. A causa exata da segunda falha continua desconhecida.

A exceção de protocolo reconhece apenas duas mensagens exatas de configuração
na CLI 0.160.0, antes de `turn.started`, com flags, perfil e preflight compatíveis.
Os avisos ficam registrados. Mensagem desconhecida, mudança de contexto, erro
real, ferramenta proibida, captura incompleta ou inválida interrompem a rodada.
Não habilitar Code Mode nem alterar autenticação para suprimir os avisos.

Após o aceite: preflight sem modelo; executar e inspecionar primeiro o par de
História válido. Prosseguir em série pela agenda fixada. Defeito novo do benchmark
ou falha técnica exige parar e voltar ao planejamento. Falha genuína de qualidade
num caso válido é resultado da comparação: conta, permanece e não gera repetição.

O relatório separa consumo global, diagnósticos históricos e desempenho v2.
Fixture aprovada em CI nunca gera elegibilidade. Nenhuma comparação aprova
merge, ativação de perfil, release, deploy ou conteúdo curricular. Spec, revisão
de PR, Discovery e verificadores mantêm os perfis atuais sem inferência.

Rollback: interromper chamadas e reverter o código por PR, preservando campanha,
contador, registros e capturas. Retomar requer nova avaliação do estado real.
