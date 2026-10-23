# Evolucao dos agentes e execucao economica

## Objetivo aprovado

Concentrar capacidade na especificacao e verificacao, com execucao economica
delimitada e documentos rastreaveis. Usar a assinatura Codex atual, perfil de
autenticacao dedicado e escrita em copia isolada. Nenhuma chave de API ou copia
de token sera habilitada como alternativa automatica.

A base de planejamento e develop `9add103f4ecc9342019269f3f6d63b47f8709469`.
Revalidar a base antes de cada implementacao. Preservar alteracoes do usuario,
questoes, rascunhos e auditorias. A prevencao curricular abrange T3 e proximos
acervos; T1/T2, promocao para main e deploy ficam fora desta iniciativa.

## Entregas e dependencias

| Ordem | Entrega                                           | Aceite                                                                              |
| ----- | ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1     | Catalogo documental, ferramentas e baseline       | Inventario completo, hashes conferidos, compatibilidade e pacote de aceite concreto |
| 2     | Contexto completo, autenticacao isolada e recibos | Contratos efetivamente carregados e falhas de preflight comprovadas                 |
| 3     | Executor isolado e perfis candidatos              | Escrita restrita, diff integral e preservacao do checkout original                  |
| 4     | Avaliacao real e selecao de modelos               | Relatorio dentro de 32 execucoes e ativacao somente das categorias aprovadas        |
| 5     | Integracao e aprendizados                         | Fluxo completo e bloqueios conhecidos comprovados no CI                             |
| 6     | README e indices                                  | Instrucoes reproduziveis e estado documentado conforme a entrega                    |

Cada entrega tem issue e PR proprio para develop. Os testes do componente
entram no mesmo PR que o introduz. Nenhum parecer de agente autoriza merge,
aceite curricular, baseline documental ou publicacao por si so.

## Contratos do fluxo

O pacote de trabalho versionado informa objetivo, commit base, dependencias,
documentos fixados, requisitos, exemplos validos e invalidos, arquivos
permitidos, criterios de aceite, comandos e evidencias. Toda ficha identifica
o verificador independente, as condicoes de interrupcao e o rollback.

O bundle de contexto inclui o conteudo dos contratos autorizados e hashes
conferidos. Referenciar um caminho sem carregar o documento nao satisfaz o
contrato. Dependencias normativas sao explicitas; links de navegacao nao
provocam carga indiscriminada da documentacao. Uma mudanca normativa exige
analise de impacto e nova vinculacao das revisoes afetadas.

O recibo identifica ator, execucao, modelo, esforco, configuracao, contexto,
artefato, resultado e limitacoes. Registra tokens e uso da assinatura somente
quando informados pela ferramenta, duracao, tentativas e correcoes. Informacao
ausente e declarada; preco de API nao e apresentado como cobranca da assinatura.
Os novos recibos sao evidencias dos registros existentes, sem reescrever ledgers.

## Permissoes e modelos

Spec e Implementer serao executaveis somente pelo runner protegido. A ampliacao
do modelo de capacidades exige revisao propria; os outros agentes permanecem
somente leitura. Autoria, revisao e verificacao usam execucoes independentes.

O perfil dedicado usa login oficial ChatGPT e chaveiro do sistema, fora do
repositorio. A ausencia de login, chaveiro, modelo ou isolamento bloqueia a
execucao. Nao herdar configuracoes pessoais, connectors, plugins, hooks ou
variaveis com credenciais. Ferramentas externas ficam desabilitadas nos runners
protegidos; revisores editoriais recebem o contexto autorizado sem shell.

Executores recebem copia do commit aprovado, sem .git, credenciais ou arquivos
nao versionados. Leitura e escrita se limitam a copia e recursos minimos;
comandos ficam sem rede. O diff integral inclui novos arquivos, exclusoes e
symlinks. Mudanca fora do escopo bloqueia a entrega. Antes de aplicar o diff,
conferir hashes atuais; qualquer conflito preserva o checkout e volta ao plano.

| Papel                                                       | Candidato                                 |
| ----------------------------------------------------------- | ----------------------------------------- |
| Spec e planejamento                                         | gpt-6.1-sol high                          |
| Implementer e propostas curriculares delimitadas            | gpt-6-luna medium                         |
| Verificacao analitica, revisao de PR, pedagogia e linguagem | gpt-6.1-sol high                          |
| Execucao de testes e coleta de evidencias                   | Scripts                                   |
| Arquitetura                                                 | Sob demanda; Astra fora do fluxo padrao   |
| Product Discovery                                           | Modelo atual nesta rodada                 |
| Release e board                                             | Sessao principal, com autorizacao vigente |

O planejamento forte define objetivos curriculares e resolve duvidas da fonte.
O curador economico prepara propostas dentro desse mapa, sujeitas a revisoes
pedagogica e linguistica separadas e aceite humano aplicavel.

## Avaliacao limitada

Usar casos ficticios ou copias de teste; nenhum conteudo escolar protegido sera
enviado. Cada execucao e uma invocacao do runner, sem subdelegacao automatica,
com limite de cinco minutos. Falhas contam. Limite total: 32 execucoes, sem
rodada adicional automatica ou fallback para API.

- 16 editoriais: oito cenarios comparados entre gpt-5.6-sol high e
  gpt-6.1-sol high, com casos validos e defeitos de idioma, apoio generico,
  resposta revelada, ambiguidade, resposta incorreta e feedback contraditorio.
- 12 de autoria: codigo, documentacao e proposta curricular, duas repeticoes
  por tarefa com Luna medium e duas com Sol medium.
- 2 de verificacao: verificador atual e Sol high avaliam um caso em que os
  testes passam mas um requisito esta ausente.
- 2 reservadas: uma correcao por tentativa escolhida, priorizando falhas de
  Luna na ordem codigo, documentacao e curadoria.

Revisores devem detectar todos os defeitos criticos e aceitar os controles
validos; saidas cobrem todos os IDs e respeitam o contrato. Autoria deve passar
integralmente nos testes independentes. Habilitar Luna por categoria comprovada,
considerando qualidade, retrabalho e uso observado. Resultado insuficiente
mantem a categoria desabilitada; nao promove automaticamente o executor a Sol.
O relatorio distingue medicao, estimativa e limitacoes da amostra.

## Validacao, operacao e reversao

Testar documento ausente, hash divergente, contexto incompleto, aprovacao
desatualizada, modelo indisponivel e recibo ficticio. Testar escape de escrita,
acesso ao checkout original, credenciais, rede, concorrencia e mistura de
autoria com revisao. Manter as regressoes de Historia e Ingles e os caminhos
reais dos geradores/publicadores. CI usa fixtures; chamadas reais sao manuais.

Executar verify:local antes dos PRs e checks remotos obrigatorios. O aceite do
baseline usa o pacote concreto, nao a aprovacao generica deste planejamento.
O login oficial exige participacao do mantenedor; a automacao nao copia cache.
O PR aberto #385 copia auth.json e nao atende a decisao atual: preservar seu
historico e registrar a relacao antes de qualquer integracao, sem merge ou
encerramento automatico desse PR.

Atualizar Status e Workflow segundo as evidencias. O README explicara seis
materias, acervos, instalacao, testes, agentes e publicacao, distinguindo develop
da producao. Alinhar metadados do pacote a licenca MIT existente, sem modificar
seus termos. Reverter cada entrega por PR quando necessario; configuracoes
pessoais, ledgers e auditorias permanecem preservados.
