# Operacao da avaliacao limitada de modelos

Entrega #404 do plano aprovado em `docs/specs/agent-workflow-evolution.md`.
Este guia descreve a ferramenta; os contratos e aceites normativos continuam
fixados pela ficha de trabalho e pela politica de contexto.

## Preparacao

A rodada usa somente fixtures sinteticas, identificadas em
`config/agent-evaluation-plan.json`. Sao oito casos editoriais comparados entre
os dois modelos, duas repeticoes de codigo, documentacao e curadoria em cada
modelo de autoria, e um caso de verificacao nos dois modelos. Trinta tentativas
iniciais e duas reservas compoem o teto de 32. O plano e os modelos sao fixos;
nao existe argumento livre para escolher outro modelo ou aumentar o teto.

Concluir os testes e os checks do codigo antes da medicao. Fazer commit dos
arquivos envolvidos: os runners rejeitam codigo ou casos divergentes do commit.
O login usa o perfil dedicado ja preparado, pelo fluxo oficial ChatGPT e
chaveiro. Nao copiar `auth.json` nem usar API como alternativa.

```sh
node scripts/agent-auth.cjs login --auth-home "$HOME/.codex-quiz-auth"
npm run evaluation -- init --auth-home "$HOME/.codex-quiz-auth"
npm run evaluation -- ready --auth-home "$HOME/.codex-quiz-auth"
npm run evaluation -- list --auth-home "$HOME/.codex-quiz-auth"
```

`ready` confere autenticacao, catalogo local, ferramentas desabilitadas e o
isolamento nativo, sem invocar modelos nem consumir tentativa. A presenca no
catalogo nao comprova disponibilidade do modelo para a conta. Falha bloqueia
o inicio; investigar a causa antes de reservar uma tentativa real.

Antes da reserva, os schemas efetivamente enviados tambem passam por verificacao
offline do subconjunto suportado pelo servico. O schema de transporte tem campos
tipados e obrigatorios, objetos fechados e listas com itens definidos. O contrato
editorial completo permanece na validacao local. Valores nulos representam apenas
ausencias previstas; o decoder nao cria textos, traducoes ou evidencias. Recibos
novos identificam a versao do transporte e os hashes do contrato, schema e resposta.
Esse check offline nao comprova aceitacao pelo servico.

## Reserva e execucao

A campanha tem ID fixo `agent-evolution-2026-10` e fica em
`<auth-home>/quiz-evaluations/agent-evolution-2026-10`. A inicializacao nao
substitui uma campanha existente. A reserva e exclusiva por slot e ocorre antes
do runner: falha de preflight, falha remota e interrupcao continuam consumidas.
Uma segunda reivindicacao do ticket e recusada. Nao existe comando de reset ou
reabertura de tentativa. Mudanca na base, no codigo critico ou no corpus bloqueia
novas chamadas e exige voltar ao planejamento, preservando o contador.

Executar manualmente um ID da agenda, em serie, com uma invocacao por comando:

```sh
npm run evaluation -- run --auth-home "$HOME/.codex-quiz-auth" \
  --slot historia-valida-editorial-current
```

O modelo e esforco da variante aparecem explicitamente no ticket e no recibo.
O adapter normal permanece fixado: a comparacao e exclusiva do experimento e
nao habilita o candidato para trabalhos gerais. Revisoes usam os contratos
editoriais existentes; o verificador analitico recebe codigo e evidencias reais
de testes aprovados para conferir o requisito ausente. Cada chamada tem processo
e contexto proprios. Testes independentes usam scripts, sem chamadas extras a IA.

Cada invocacao tem prazo total de cinco minutos para iniciar e concluir a
chamada ao modelo. O preflight reduz o tempo restante. O processo encerra o
grupo iniciado por ele ao expirar ou receber interrupcao; nao reinicia o modelo.
O limite de eventos permanece em 16 MiB. Um processo terminado abruptamente pode
deixar uma tentativa sem resultado ou uma trava; preservar esses registros e
investigar os processos antes de qualquer recuperacao manual.

## Avaliacao independente e correcoes

Os revisores recebem apenas a proposta e a passagem solicitada. O gabarito da
avaliacao nao integra o prompt. Controles validos precisam ser aceitos sem
achados; defeitos precisam de ID, criterio, gravidade e evidencia especifica.
Os congelamentos de fonte registrados nas fixtures sao ficticios e nao
representam aprovacao curricular de producao.

Executores de codigo e documentacao recebem somente o arquivo sintetico
delimitado e `package.json`, exportados do commit. Nao recebem os testes de
avaliacao, o gabarito, material escolar local ou arquivos nao versionados. A
proposta nao e aplicada ao checkout. Codigo gerado e executado somente em outro
processo sob a sandbox, sem rede e sem escrita na copia; o coordenador confere
o resultado estruturado completo. Vetores usados na verificacao ficam registrados.
Documentacao e curadoria passam por checagens de estrutura e fatos delimitados;
a amostra nao comprova qualidade geral para qualquer documento ou materia.

As reservas `repair-1` e `repair-2` escolhem propostas de Luna reprovadas com
diagnostico, na ordem codigo, documentacao e curadoria. Cada tentativa inicial
pode receber uma unica correcao, usando o mesmo modelo. Nao corrigem outra
correcao, nao promovem automaticamente o executor a Sol e nao criam rodada extra.
Uma falha sem proposta aproveitavel nao consome reserva de correcao.

```sh
npm run evaluation -- run --auth-home "$HOME/.codex-quiz-auth" --slot repair-1
```

## Retomada excepcional aprovada

A primeira tentativa real, `historia-valida-editorial-current` no commit
`7c2d1294064d87b2f82928a4ef9c48d4dcf269a6`, recebeu HTTP 400
`invalid_json_schema`, sem resposta avaliavel. O mantenedor aprovou usar uma das
reservas para repor esse controle. O adendo versionado
`config/agent-evaluation-resumption.json` fixa os hashes dessa falha e a excecao.

A conta final permanece em ate 32: uma falha tecnica, 30 casos avaliados e uma
correcao de Luna. `repair-2` fica desabilitado; `repair-1` conserva a prioridade
codigo, documentacao e curadoria. A reposicao usa `schema-replacement-1`, mesmo
caso, modelo e esforco. Identificadores de execucao e commit podem mudar.

Depois dos testes e checks do novo commit, consultar `report` para obter
`stateSha256` e registrar a transicao explicita:

```sh
npm run evaluation -- resume --auth-home "$HOME/.codex-quiz-auth" \
  --expected-state <stateSha256-do-relatorio>
npm run evaluation -- ready --auth-home "$HOME/.codex-quiz-auth"
npm run evaluation -- run --auth-home "$HOME/.codex-quiz-auth" \
  --slot schema-replacement-1
```

`resume` so aceita a unica falha identificada, sem mudancas no corpus, modelos,
criterios ou contratos normativos. Confere os registros e grava um unico
`resumption.json`, sem substituir campanha, ticket, recibo ou resultado antigos.
O estado esperado impede retomar a partir de uma leitura desatualizada. Os novos
tickets vinculam o adendo e o commit ativo; consultas historicas continuam possiveis.

O relatorio conserva o total consumido e separa falha tecnica, reposicao e
desempenho. O controle so fica coberto pelo resultado da reposicao; a falha original
nao vira um julgamento de qualidade do modelo. Uma nova incompatibilidade de schema
bloqueia outras reservas e exige novo planejamento. Nao ha segunda retomada,
repeticao automatica ou aumento do limite.

## Relatorio e decisao

```sh
npm run evaluation -- report --auth-home "$HOME/.codex-quiz-auth" \
  --output /caminho/novo/relatorio.json
```

O relatorio confere hashes dos tickets, resultados, recibos e artefatos. Pode
ser consultado depois de mudancas no checkout usando o snapshot Git da campanha;
essa leitura historica nao libera novas chamadas. Registra tentativas consumidas,
falhas, duracoes, correcoes, tokens informados e cobertura dos dados de uso.
Custos de API nao sao apresentados como cobranca da assinatura. Dados ausentes
permanecem ausentes, sem estimativa fabricada de consumo ou identidade remota.

`categoryEligibility` e um criterio para a decisao: exige rodada concluida e
todos os casos da categoria aprovados, com eventual correcao permitida registrada.
O relatorio nao modifica perfis. Ativar somente categorias comprovadas, por PR,
com as referencias ao relatorio e os aceites documentais aplicaveis. Spec,
revisao de PR ou outros papeis sem medicao propria continuam sem ativacao por
inferencia. Product Discovery permanece no modelo atual nesta rodada.

`--codex-bin` e `--test-comment` sao exclusivos de fixtures. Uma campanha de
teste nao se mistura com campanha real e nunca produz elegibilidade, mesmo
quando todos os casos simulados passam. Os testes normais e o CI usam essas
fixtures, sem chamar modelos. `npm run test:agent-evaluation-sandbox` verifica
manualmente o executor independente nativo, tambem sem modelo ou login.

O codigo usa os eventos JSONL e a resposta estruturada da CLI conforme a
[documentacao oficial de execucao nao interativa](https://learn.chatgpt.com/docs/non-interactive-mode).
Os resultados distinguem a validacao dos mecanismos, as medicoes reais e as
limitacoes da amostra. Nenhum artefato da rodada autoriza publicacao curricular,
merge, release ou deploy. Reversao de perfis e feita por PR; recibos e contador
da campanha permanecem preservados.
