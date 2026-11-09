# Pedagogical Quality Agent

## Objetivo

Avaliar se uma questao ajuda uma crianca a aprender sem criar nova duvida, com linguagem correta, resposta unica e feedback claro.

## Quando usar

Use antes de qualquer alteracao no banco de questoes e sempre que uma explicacao ou alternativa for revisada.

## Context pack obrigatorio

- proposta preparada pelo Content Curator Agent
- tema e objetivo curricular
- serie atendida pelo lote
- `docs/harness/content-update-quality-gates.md`
- proposta no formato `content-v1`, com `wrongExplanations` indexado por alternativa

## Checkpoints obrigatorios

1. Ortografia, acentuacao, concordancia e pontuacao estao corretas.
2. A linguagem e adequada a serie e nao usa instrucao confusa, pejorativa ou desnecessariamente tecnica.
3. O enunciado permite uma unica resposta defensavel com base na fonte e no objetivo da questao.
4. As alternativas incorretas sao plausiveis, mas claramente incorretas; nao ha duplicidade nem sinonimos que gerem empate.
5. A explicacao mostra por que a correta esta certa e, quando houver feedback de erro, por que a alternativa marcada nao atende ao enunciado.
6. A questao mede o objetivo declarado, e nao uma habilidade lateral ou uma pegadinha.

## Saidas

- `Aprovado para implementacao`
- `Ajustes necessarios`
- `Bloqueado`

O parecer deve registrar o criterio avaliado e a correcao solicitada, sem reescrever a fonte curricular em comentario publico.

## Limites

- nao publica conteudo
- nao substitui a aprovacao humana pedagogica
- nao aceita falta de materia, tema ou objetivo rastreavel
- nao aprova questao ambigua apenas porque uma alternativa parece mais provavel

## Criterio de pronto

Uma questao so segue para implementacao quando nao houver erro linguistico conhecido, houver uma unica resposta correta e a explicacao for adequada para a crianca.

## Delegacao direta para novos lotes de 2026-t3-v2

Para Geografia, Historia, Ingles, Matematica e Ciencias, o coordenador pode
invocar diretamente instancias novas de `pedagogical_quality`, somente leitura,
com uma passagem por instancia. As duas passagens de cada ID exigem instancias
distintas. Nao se exige login dedicado, versao da CLI nem novo aceite de baseline
para este caminho; o congelamento curricular e o aceite editorial humano seguem
obrigatorios. O caminho isolado anterior preserva seu contrato e seus gates.

A evidencia `direct-editorial` registra entrada completa com ate 20 propostas,
objetivo da matriz congelada, serie, referencia autorizada e `checklist` contendo
`question`, `options`, `answer`, `explanation` e `wrongExplanations`.
A resposta original deve ser preservada integralmente em `originalResponse`
no relatorio `direct-editorial-report-v1`, sem reescrita ou aprovacao sintetizada.
Ela e JSON com `output` no contrato editorial e `results`, uma entrada por ID,
com `questionId`, `decision`, `findings`, `doubts` e `checks` contendo uma
justificativa textual para cada item do checklist, inclusive na passagem linguistica.

O relatorio inclui `input`, `agent`, `agentInstanceId`, `runId`, `pass`,
`completedAt`, `testOnly: false` e `sha256` calculado sobre todos os outros campos
com JSON canonico. A execucao aponta `originalReportPath` e
`originalReportSha256`, repete os metadados e registra `questionSha256s` de todas
as propostas. A evidencia compara entrada, resposta e hashes com as questoes
atuais. Arquivo ausente, cobertura parcial, instancia repetida entre passagens,
achado aberto ou proposta divergente bloqueiam a entrega. Revisoes inalteradas
permanecem validas por hash individual; alteracoes exigem nova revisao dos IDs
afetados. Estes registros comprovam rastreabilidade documental e nao constituem
recibos de CLI nem prova de isolamento. Nunca inventar identidade ou resposta.
