# Spec: Piloto MCP de Governanca Somente Leitura

## Objetivo

Disponibilizar as fontes versionadas de governanca para consulta estruturada
por uma sessao principal do Codex, sem conceder escrita, rede, operacoes de
repositorio ou acesso a caminhos arbitrarios.

O servidor `quiz-governance` e um piloto local por STDIO. O catalogo em
`config/governance-guidelines.json`, seus `sourcePath` e o modelo em
`config/agent-capabilities.json` continuam sendo as fontes de verdade.

## Interface `quiz-governance` v1

O servidor negocia somente MCP `2025-11-25` e `2025-06-18` e implementa
`initialize`, `ping`, `tools/list` e `tools/call`. Prompts, resources, HTTP,
OAuth e metodos desconhecidos nao fazem parte do piloto.

Tres ferramentas sao expostas:

- `list_guidelines`: retorna o catalogo canonico e seus metadados, sem o texto
  normativo;
- `read_guideline`: recebe somente um `id` existente no catalogo e retorna os
  metadados e o documento original depois de conferir o SHA-256;
- `read_agent_capabilities`: retorna o modelo central depois de validar papeis,
  capabilities, contratos e regras de separacao.

Os schemas de entrada e saida sao fechados. Todas as ferramentas declaram
`readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true` e
`openWorldHint: false`.

## Seguranca e integridade

O cliente nunca informa um caminho. Cada leitura parte de um ID catalogado ou
de um caminho fixo do servidor e exige arquivo regular, versionado no Git e sem
symlink. O catalogo e seus documentos sao revalidados a cada chamada para
detectar alteracoes durante uma sessao longa.

O processo nao possui ferramenta de escrita, transporte de rede, credencial ou
integracao com GitHub. `stdout` fica reservado ao protocolo; erros devolvidos
ao cliente e escritos em `stderr` nao reproduzem conteudo, caminho absoluto ou
detalhe interno do parser. Mensagens maiores que 1 MiB sao rejeitadas.

Ler um documento pelo MCP nao cria uma segunda fonte normativa. A resposta e o
conteudo do proprio `sourcePath`, validado contra a versao e o hash existentes
no catalogo.

## Execucao e ativacao opt-in

Valide as fontes e inicie o servidor com:

```bash
npm run validate:mcp-governance
npm run mcp:governance
```

Para habilitar o piloto no Codex, acrescente localmente uma entrada equivalente
ao arquivo ignorado `.codex/config.toml`, substituindo o `cwd` pelo caminho
absoluto deste checkout:

```toml
[mcp_servers.quiz_governance]
command = "npm"
args = ["run", "--silent", "mcp:governance"]
cwd = "/caminho/absoluto/para/Quiz"
enabled_tools = [
  "list_guidelines",
  "read_guideline",
  "read_agent_capabilities",
]
default_tools_approval_mode = "writes"
```

Depois de reiniciar o cliente, `codex mcp list` ou `/mcp` deve mostrar somente
as ferramentas allowlisted para esse servidor. A ativacao e pessoal: o PR nao
edita, remove a protecao do `.gitignore` nem versiona `.codex/config.toml`.

Para desativar o piloto, remova apenas a tabela
`mcp_servers.quiz_governance` da configuracao local e reinicie o cliente.

## Fronteira com agentes executaveis

O piloto atende somente a sessao principal que optar por configura-lo. Os cinco
adapters em `.codex/agents/` continuam com `mcpPolicy: none` e tabelas
`mcp_servers` vazias. O runner editorial usa ambiente e workspace temporarios,
ignora a configuracao do usuario e continua bloqueando qualquer MCP ou
connector herdado.

## Validacao e aceite

`npm run test:mcp-governance` cobre negociacao, descoberta e chamada das tres
ferramentas, saida deterministica, argumentos invalidos, metodos desconhecidos,
JSON malformado, limite de mensagem, fonte ausente, arquivo nao versionado,
symlink, hash divergente e modelo de capacidades invalido.

O gate roda em `npm test` e no workflow PR Governance. O CI nao configura um
servidor permanente, nao invoca modelos e nao acessa rede pelo servidor.

## Nao objetivos

- nao expor registros de execucao ou conteudo curricular;
- nao criar REST, HTTP, RBAC, OAuth, plugin, persistencia ou sincronizacao;
- nao habilitar MCP em subagentes;
- nao alterar interface, comportamento ou runtime do quiz;
- nao substituir revisao ou aprovacao humana.

## Rollback

Reverter o servidor, os testes, esta spec e a integracao de CI. Quem tiver
ativado o piloto remove a tabela local indicada acima. Nao existe migracao,
deploy ou impacto em producao.
