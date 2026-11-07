# Contexto completo e autenticacao dedicada dos agentes

## Estado e objetivo

Entrega 2 de `agent-workflow-evolution.md`, acompanhada na issue #402.
Os modelos atuais continuam fixados; candidatos economicos ainda nao estao
ativados. A avaliacao real permanece limitada a 32 invocacoes manuais.

O runner editorial recebe contratos completos, aprovados e conferidos por hash.
Usa login oficial ChatGPT em perfil dedicado, com chaveiro do sistema. Nao aceita
chave de API, copia de `auth.json`, configuracao pessoal ou troca silenciosa de
modelo. O PR #385 continua separado porque usa copia de credenciais.

## Ficha e contexto

A ficha `agent-work-v1` tem campos fechados:

| Campo                                       | Conteudo                                                                    |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| `id`, `objective`, `baseCommit`, `role`     | Trabalho delimitado e commit completo de 40 caracteres                      |
| `subjectId`, `curriculumCycle`              | Materia e ciclo, como `ingles` e `2026-t3`; nulos somente fora do editorial |
| `dependencies`, `requirements`              | Dependencias explicitas e requisitos verificaveis                           |
| `documents`                                 | Lista de `id`, `version`, `sourceCommit` e `sha256`, sem alias movel        |
| `validExamples`, `invalidExamples`          | Exemplos especificos para orientar e verificar a execucao                   |
| `allowedPaths`, `commands`, `evidence`      | Escopo de arquivos, comandos autorizados e evidencias previstas             |
| `acceptanceCriteria`, `independentVerifier` | Criterios objetivos e identidade prevista para verificacao separada         |
| `stopConditions`, `rollback`                | Condicoes de interrupcao e reversao                                         |

Exemplos, requisitos, criterios e condicoes de interrupcao nao podem ser vazios.
Listas de dependencias, arquivos, comandos e evidencias podem estar vazias; no
editorial nao autorizam execucao de comandos. A identidade prevista na ficha
nao comprova, por si so, a realizacao de uma revisao independente.

`config/agent-context-policy.json` define documentos comuns, contratos de cada
papel por meio do catalogo de capabilities, dependencias transitivas e regras
curriculares. Para T3 de 2026 e ciclos posteriores, carrega o manifesto vigente
registrado. Um ciclo futuro sem manifesto proprio bloqueia antes da invocacao;
nao reutiliza automaticamente o manifesto de 2026. Uma nova fonte curricular
exige atualizacao explicita dessa politica.
Em Ingles, carrega o contrato bilingue mesmo que seu nome de arquivo cite T2.
Links de navegacao nao carregam automaticamente toda a documentacao.

A ficha deve corresponder ao trabalho, papel, materia e ciclo da entrada
editorial. Omissao de contrato obrigatorio, documento ausente, hash divergente,
versao sem aceite, base alterada ou configuracao fora do commit bloqueia a
invocacao. Documentos historicos, superados e nao classificados nao sao contratos.

O build reconstrui o baseline do commit fixado, confere seu hash e consulta o
comentario original no GitHub. O comentario deve conter integralmente a frase
de aceite definida em `document-versioning.md`, sob a conta do mantenedor. Um
recibo JSON local isolado nao substitui essa consulta. O aceite inicial foi
autorizado nesta sessao e registrado na issue #401; o branch com o commit de
origem deve ser preservado enquanto esse snapshot for consumido.

O bundle `agent-context-v1` inclui textos integrais, identificadores, versoes,
hashes, commits, recibos de aceite e hashes da ficha e das configuracoes. Seu
hash cobre todo o payload. O prompt efetivamente enviado inclui esse bundle
renderizado, a ficha e a entrada editorial; caminhos isolados nao bastam.

```sh
npm run context:build -- --work /caminho/ficha.json > /caminho/contexto.json
```

O coordenador prepara a ficha com os requisitos aprovados e os vinculos do
catalogo; o build valida essa ficha, sem presumir autorizacao pelo preenchimento.
Uma mudanca nos textos normativos exige novo aceite para os hashes alterados.

## Preparacao do login

CLI validada: `codex-cli 0.160.0`. Outra versao bloqueia ate nova verificacao.
O diretorio dedicado deve ficar fora do repositorio e do perfil pessoal Codex,
com pai existente, proprietario atual e permissao 0700. `init` cria somente um
diretorio novo ou vazio; nunca adapta um perfil existente ou copia credenciais.

```sh
node scripts/agent-auth.cjs init --auth-home /caminho/privado/quiz-codex-auth
node scripts/agent-auth.cjs login --auth-home /caminho/privado/quiz-codex-auth
node scripts/agent-auth.cjs status --auth-home /caminho/privado/quiz-codex-auth
```

`login` usa o fluxo oficial `codex login --device-auth`, com participacao do
mantenedor. A configuracao fixa `cli_auth_credentials_store="keyring"` e
`forced_login_method="chatgpt"`. Falha de chaveiro ou login interrompe o fluxo;
nao ha alternativa automatica por arquivo, token importado ou API.

O perfil dedicado e persistente para permitir renovacao oficial da sessao.
Temporarios, configuracoes XDG e workspace da invocacao sao novos e removidos
ao terminar. O motor da CLI usa o `HOME` do sistema para localizar o chaveiro
padrao do macOS; um `HOME` ficticio impede esse acesso. `CODEX_HOME` continua
fixado no perfil dedicado. O ambiente de comandos recebe somente `HOME` e
`TMPDIR` temporarios, sem heranca; ferramentas editoriais seguem desabilitadas.
O runner nao remove o perfil de autenticacao e nao herda variaveis de tokens,
chaves, proxies ou configuracoes do processo pai. Seu ambiente contem somente
caminhos de execucao, localidade, terminal e os diretorios isolados.

## Execucao protegida

```sh
node scripts/run-editorial-agent.cjs \
  --agent pedagogical_quality \
  --input /caminho/entrada.json \
  --work /caminho/ficha.json \
  --auth-home /caminho/privado/quiz-codex-auth \
  --delivery-package /caminho/lote.json \
  --output /caminho/revisao.json
```

O preflight confere perfil e configuracao exatos, login ChatGPT, versao da CLI,
flags efetivas sem ferramentas, MCP vazio e modelo no catalogo. Catalogo nao
comprova acesso da conta: indisponibilidade remota deve falhar sem fallback.
O runner executa com configuracao estrita, sem configuracao pessoal ou regras
herdadas, sem historico de sessao e em sandbox `read-only`. As mesmas restricoes
de autenticacao e ferramentas sao repetidas nos argumentos da invocacao.

Shell, navegadores, imagem, computador, plugins, apps, hooks, busca de skills,
memoria e subdelegacao ficam desabilitados. O workspace contem somente o schema
de saida. Nenhum checkout, credencial ou arquivo-fonte e copiado para o agente.
O motor da CLI conserva o acesso necessario ao servico de modelos e ao chaveiro;
essa conexao nao autoriza ferramentas de rede do agente. Uma ferramenta observada
nos eventos invalida a saida. A prova real com login e registrada separadamente
dos testes com fixtures; a aprovacao dos testes nao declara essa prova concluida.

Ha uma unica invocacao, com prazo de cinco minutos, sem nova tentativa ou
correcao automatica. Um lock por perfil impede concorrencia. Se um processo
terminar abruptamente e deixar um lock, o operador deve verificar que nao existe
execucao ativa antes de remover somente `quiz-run.lock` do perfil dedicado.
Saida ou recibo existentes bloqueiam uma nova execucao para preservar evidencias.

## Recibos, compatibilidade e verificacao

Cada tentativa iniciada com argumentos validos grava
`<saida>.receipt.json`, inclusive em falhas de preflight. O sidecar
`agent-run-receipt-v1` registra ator, runId, tempos, tentativa, resultado, modelo
e esforco solicitados, hashes do adaptador, entrada, ficha, contexto,
configuracao e artefato, alem de aceites e resultado do preflight.

Tokens sao registrados apenas quando a CLI os informa em `turn.completed`.
Consumo da assinatura, cobranca e identidade remota do modelo ficam declarados
como nao informados; nao sao estimados com precos de API. O recibo local nao e
uma assinatura criptografica de autoria ou aprovacao humana.

O sidecar pode ser referenciado nas evidencias dos registros de execucao
existentes. Nenhum schema antigo de registro, ledger ou auditoria e reescrito.
O resultado editorial conserva o contrato anterior e o marcador `testOnly`.
`--codex-bin` sempre marca fixtures como teste; `--test-comment` exige esse
binario e jamais gera evidencia editorial real aceita pelo gate de publicacao.

Os testes cobrem contexto omitido, mudanca de hash, aceite invalido, falta de
login/modelo, API indevida, ferramentas ativas, MCP, perfil contaminado,
concorrencia, artefato divergente e eventos invalidos, sem chamadas reais no CI.
Rollback por PR reverte runner, politica e contratos; conserva evidencias e
perfil dedicado ate decisao explicita do mantenedor. Nao ha efeito no runtime
do quiz ou publicacao em producao.

Referencias oficiais: [autenticacao](https://learn.chatgpt.com/docs/auth) e
[configuracao](https://learn.chatgpt.com/docs/config-file/config-reference).
