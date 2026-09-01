# Spec: Agentes Executaveis do Codex

## Objetivo

Configurar Reviewer, Verifier, Product Discovery, Content Curator e Pedagogical
Quality como agentes customizados do Codex, com modelos e limites adequados a
cada papel e sem ampliar sua autoridade operacional.

## Decisao

Os contratos em `docs/agents/` continuam sendo a fonte de comportamento. Os
arquivos `.codex/agents/*.toml` sao adaptadores executaveis que apontam para
esses contratos e definem modelo, esforco e sandbox.

## Configuracao inicial

| Agente              | Arquivo                    | Modelo          | Esforco  | Sandbox   |
| ------------------- | -------------------------- | --------------- | -------- | --------- |
| Reviewer            | `reviewer.toml`            | `gpt-5.6-sol`   | `high`   | read-only |
| Verifier            | `verifier.toml`            | `gpt-5.6-terra` | `medium` | read-only |
| Product Discovery   | `product-discovery.toml`   | `gpt-5.6-sol`   | `high`   | read-only |
| Content Curator     | `content-curator.toml`     | `gpt-5.6-sol`   | `high`   | read-only |
| Pedagogical Quality | `pedagogical-quality.toml` | `gpt-5.6-sol`   | `high`   | read-only |

Os agentes editoriais declaram uma tabela `mcp_servers` vazia. Isso impede a
heranca de servidores MCP configurados no projeto. A delegacao ainda exige o
preflight da sessao principal: `codex mcp list --json` deve retornar zero
servidores, pois ferramentas e connectors fornecidos pela sessao pai nao sao
controlados somente pelo arquivo do agente.

Reviewer, Product Discovery e os agentes editoriais exigem raciocinio mais
profundo por lidarem com ambiguidade, risco, linguagem e recomendacao. O
Verifier usa um modelo mais eficiente para leitura, execucao de checks e
consolidacao de evidencias.

## Precedencia

Quando o arquivo do agente define `model` ou `model_reasoning_effort`, essa
configuracao prevalece para o subagente. Configuracoes globais e o modelo do
agente principal nao devem substituir silenciosamente os valores fixados aqui.

## Uso

O agente principal pode delegar explicitamente:

```text
Use o agente reviewer para revisar este PR contra a spec. Aguarde o resultado e
consolide os achados antes de propor qualquer acao.
```

No fluxo curricular, delegue primeiro para `content_curator`. Depois da
proposta, execute `pedagogical_quality` separadamente com `reviewPass`
`pedagogical` e `linguistic`. As saidas seguem
`editorial-agent-output-contract.md` e continuam pendentes de aprovacao humana.

Na CLI, `/agent` permite inspecionar as threads ativas. A delegacao deve ocorrer
somente quando o trabalho for independente e delimitado.

## Guardrails

- todos os agentes desta fase operam em `read-only`;
- subagentes nao fazem commit, merge, deploy ou alteracao de board;
- `.codex/config.toml` e pessoal e nao pode ser versionado;
- arquivos TOML nao podem conter token, chave, segredo ou permissao ampla;
- agentes editoriais nao podem declarar servidor MCP;
- qualquer connector ou ferramenta externa ativa na sessao principal bloqueia
  a delegacao editorial;
- instrucoes executaveis devem referenciar os contratos versionados;
- mudanca de modelo ou permissao exige issue, validacao e PR proprio;
- o agente principal continua responsavel por consolidar resultados;
- o Product Owner continua responsavel por decisoes de produto e release.

## Disponibilidade e fallback

Os modelos dependem da disponibilidade da conta e da superficie do Codex. Se um
modelo configurado nao estiver disponivel, a execucao deve parar e registrar o
bloqueio. Nao e permitido substituir silenciosamente por outro modelo. Uma
troca deve ser avaliada com documentacao oficial atual, qualidade, custo e risco.

Os slugs desta versao foram confirmados com `codex debug models` na CLI 0.147.0.
O nome generico `gpt-5.6` nao foi usado porque o catalogo local publica o modelo
forte como `gpt-5.6-sol`.

## Custo e paralelismo

Cada subagente consome seu proprio contexto e tokens. Nesta fase:

- usar no maximo tres subagentes especializados por fluxo;
- preferir uma unica execucao por papel;
- paralelizar apenas leituras e verificacoes independentes;
- evitar agentes de escrita concorrentes;
- registrar quando o ganho de qualidade nao justificar o custo.

## Gate automatizado

`npm run validate:agents` valida:

- conjunto exato de agentes autorizados;
- campos obrigatorios;
- nome, modelo e esforco esperados;
- sandbox exclusivamente `read-only`;
- referencias obrigatorias aos contratos;
- padroes comuns de credenciais e chaves privadas.
- contrato de saida dos agentes editoriais;
- cenarios de aprovacao, ajuste e bloqueio;
- proibicao de aprovar contexto incompleto ou ambiguo.

O gate roda em `npm test`. Ele valida configuracao e seguranca estrutural, mas
nao consome tokens nem invoca os modelos.

## Criterios de aceite

- os cinco TOMLs atendem ao schema aceito pelo Codex;
- cada agente esta vinculado ao contrato correto;
- configuracoes pessoais permanecem fora do Git;
- casos validos e invalidos do gate possuem testes;
- a suite completa passa sem alterar comportamento do quiz;
- nenhum modelo e invocado automaticamente durante CI.

## Rollback

Reverter os TOMLs, o validador e a entrada de `npm test`. Como os arquivos nao
participam do runtime do quiz, o rollback nao exige deploy emergencial nem
migracao de dados.
