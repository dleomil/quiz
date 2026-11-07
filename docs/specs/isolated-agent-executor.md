# Executor de agentes em copia isolada

## Objetivo e estado

Entrega 3 da evolucao aprovada, issue #403. Spec e Implementer possuem adapters
JSON candidatos em `config/agents/`, consumidos exclusivamente pelo runner
protegido. Nao sao agentes nativos em `.codex/agents/`. Spec solicita
`gpt-6.1-sol high`; Implementer solicita `gpt-6-luna medium`. Os cinco adapters
nativos existentes continuam somente leitura e com os modelos anteriores.

O estado `candidate` do modelo `agent-capabilities-v2` permite somente avaliacao
explicita; nao ativa categorias nem configura fallback. O modo `evaluation` e
manual e devera integrar a reserva e contabilizacao da entrega #404 antes das
chamadas reais do experimento. Falhas de invocacao tambem contam no teto de 32.
Nesta entrega o runner bloqueia chamadas reais mesmo com login; somente fixtures
identificadas por `--codex-bin` executam. A entrega #404 devera substituir esse
bloqueio pela reserva obrigatoria, sem ativar categorias automaticamente.
Testes com CLI ficticia sao sempre marcados `testOnly`, sem comprovar modelo,
login ou isolamento real. Nenhuma chamada real e necessaria para validar o codigo.

## Entrada e contexto

Reutiliza `agent-work-v1` e `agent-context-v1` com contratos integrais e aceite
verificado no GitHub. Cada adapter, politica, catalogo e capacidade deve
corresponder ao commit base. Este contrato e uma dependencia normativa dos dois
papeis; uma revisao sem aceite bloqueia o consumo operacional. A ficha delimita
arquivos exatos, comandos previstos, exemplos, aceite, rollback e verificador.
O verificador previsto deve ser diferente do autor; uma declaracao na ficha nao
substitui a execucao independente e seus registros existentes.

Os caminhos permitidos sao arquivos relativos explicitos, sem globs, caminhos
absolutos, segmentos vazios, `.` ou `..`, caracteres especiais ou sobreposicao
entre arquivo e diretorio. Um arquivo autorizado pode ser criado ou excluido;
diretorios ancestrais necessarios sao preparados pelo coordenador.

## Copia e limites do sistema operacional

Exporta somente blobs regulares do commit aprovado. Nao copia `.git`, `.codex`,
`.agents`, `.aws`, `.ssh`, `.gnupg`, `.env*`, `.npmrc`, `auth.json`, certificados
privados, `node_modules` ou `SchoolContent`; nao copia arquivos nao versionados.
Symlinks e submodulos no material exportavel bloqueiam antes da execucao. O
limite de copia e resultado e 64 MiB. Arquivos binarios usam Base64 no artefato.

A CLI validada e 0.160.0. O perfil de permissoes nomeado usa raiz negada,
runtime minimo de leitura, copia de leitura, arquivos autorizados de escrita e
scratch exclusivo de escrita. Nega tambem temporarios compartilhados e o home
real. No macOS permite a configuracao OpenSSL do sistema necessaria ao Node.
A rede dos comandos permanece desabilitada. Nao usa sandbox irrestrita ou
`workspace-write` amplo como alternativa. Uma plataforma so pode executar apos
passar o probe nativo da propria invocacao; falha ou permissao nao comprovada
bloqueia antes da chamada ao modelo.

O probe offline testa leitura da copia, escrita autorizada, escrita extra,
traversal, symlink externo, arquivos externos, checkout original, configuracao
do perfil de autenticacao e conexao TCP local. Os testes normais de CI usam
fixtures; o teste nativo e manual, sem modelo ou login, e deve ser repetido no
ambiente de execucao. Resultados de fixtures nunca substituem esse probe.

A autenticacao oficial dedicada e preservada conforme
`agent-context-and-auth.md`. O motor da CLI usa o chaveiro e seu proprio trafego
de servico; comandos do modelo ficam sob a politica sem rede. Configuracoes
pessoais, regras, hooks, skills, MCP, plugins, apps e subagentes ficam desabilitados.
Somente a ferramenta de shell e habilitada para autoria apos os preflights.
Os comandos previstos sao uma instrucao contratual: a sandbox restringe seus
efeitos em arquivos e rede, sem ser um interpretador de allowlist textual.

Nao instalar dependencias ou ampliar permissoes automaticamente. Um comando que
dependa de rede, segredo ou recurso externo deve ser interrompido e levado ao
planejamento. A invocacao tem cinco minutos e limite de 16 MiB de eventos,
sem repeticao automatica. O runner encerra o grupo de processos iniciado por ele
ao concluir ou expirar; isso nao substitui as restricoes herdadas da sandbox.

## Proposta, revisao e aplicacao

O runner gera `agent-change-v1`; nao aplica sua propria proposta. O diff integral
inspeciona todos os arquivos da copia e inclui inclusoes, exclusoes, conteudo e
modo executavel. Symlinks, hardlinks e entradas irregulares sao rejeitados;
mudanca fora da lista exata bloqueia todo o resultado. O artefato inclui commit,
hashes da ficha e contexto, execucao, estados anteriores e posteriores e hash
do payload. Arquivos temporarios devem ficar no scratch, fora da copia.
Artefatos e recibos devem ser gravados fora do checkout original.

O coordenador revisa o artefato e informa explicitamente seu hash para aplicar.
A aplicacao reconfere contexto, base e hashes de todos os caminhos autorizados
contra o commit e o checkout atual, incluindo ausencia de novos arquivos. Um
arquivo novo local nunca e sobrescrito. Symlinks ancestrais sao rejeitados.
Conflito anterior a aplicacao nao escreve nada e exige voltar ao planejamento.

Uma trava por checkout serializa aplicacoes deste runner. Escritas usam arquivos
intermediarios exclusivos e rename. Falha posterior reverte somente as escritas
que ainda correspondem a esta aplicacao; mudancas concorrentes de terceiros
sao preservadas para resolucao manual. A trava nao bloqueia editores externos e
o filesystem nao oferece transacao atomica entre varios arquivos; revalidacoes
reduzem essa janela, sem prometer isolamento transacional de editores externos.
Nenhuma operacao do runner altera Git, board, branch, PR, merge ou deploy.

O recibo lateral registra resultado, modo, modelo solicitado, contexto, adapter,
proposta, preflight, tokens informados e quantidade de invocacoes. `proposed`
significa somente proposta coletada; `applied` nao significa verificada ou
publicada. Revisao, verificacao independente e aprovacao humana continuam sendo
etapas distintas. Os ledgers e schemas historicos nao sao reescritos.

## Comandos

Preparar a ficha e obter os aceites documentais antes do uso. A avaliacao real
depende tambem do login e da contabilizacao da entrega #404:

```sh
node scripts/run-writer-agent.cjs --mode evaluation \
  --work /caminho/ficha.json --auth-home /caminho/perfil-dedicado \
  --output /caminho/proposta.json
```

Aplicar somente a proposta revisada no checkout correspondente:

```sh
node scripts/run-writer-agent.cjs --mode apply \
  --work /caminho/ficha.json --artifact /caminho/proposta.json \
  --expected-sha256 HASH_REVISADO --output /caminho/aplicacao.json
```

`--codex-bin` e `--test-comment` existem para fixtures identificadas como teste.
Nao usar resultados assim marcados como evidencia de avaliacao real.

## Validacao e reversao

`npm run test:writer-runner` cobre copia, diff, arquivos extras, modos, exclusoes,
symlinks, traversal, conflitos, concorrencia e falhas dos preflights. Executar
`npm run test:writer-sandbox` manualmente para comprovar o isolamento nativo,
sem chamar modelo. `npm run verify:local` e checks remotos continuam obrigatorios.
Reverter por PR proprio; descartar propostas nao aplicadas nao altera o original.
Nao ha alteracao no quiz, conteudo publicado, acervos anteriores ou producao.
