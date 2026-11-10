# Procedimento de atualizacao por materia

## Objetivo

Atualizar uma materia pendente de 2026-t3-v2 em ate 180 minutos corridos,
com delegacao explicita, revisoes independentes e consumo reduzido.
Portugues e Geografia publicados permanecem fora desta preparacao.

## Coordenacao

- Um card, uma branch e um pacote completo por materia.
- Spec, arquitetura e pesquisa nao sao invocadas na rotina ja planejada.
- O coordenador recebe a autorizacao e mantem o registro da execucao.
- Curadoria e feita por tema com ate 20 propostas completas.
- Cada lote congelado recebe passagens pedagogica e linguistica de instancias
  distintas, tambem distintas da autoria. Revisores nao recebem o outro parecer.
- No maximo tres agentes filhos ativos. Curadoria de outro tema pode ocorrer
  enquanto um lote pronto passa pelas duas revisoes.
- Um verificador confere criterios e evidencias; um revisor examina o pacote
  final. Nenhum deles repete curadoria ou testes validos do mesmo snapshot.
- Integracao, operacoes Git, promocao, board e publicacao sao serializados.

## Contexto e custo

Enviar somente as regras editoriais aplicaveis, objetivo autorizado e questoes
do lote. Nao herdar a conversa inteira nem documentos de autenticacao,
arquitetura geral ou outras materias. Nao resumir requisitos pedagogicos para
economizar tokens. Scripts executam transformacoes e verificacoes estruturais.

Planejar tres chamadas editoriais por tema; aceitar somente uma rodada de
correcao, com teto total de seis chamadas. IDs inalterados preservam seus
pareceres por hash. Respostas de revisao usam IDs e justificativas curtas por
criterio, sem reproduzir as propostas. Nao reduzir cobertura individual.

Nao executar benchmarks, pesquisa de modelos ou retries automaticos. Manter os
modelos configurados. Registrar tokens quando expostos e chamadas sempre;
consumo desconhecido permanece nulo, nunca zero. Paralelismo nao significa
economia de tokens.

## Registro operacional

`node scripts/subject-run.cjs create <registro.json> <entrada.json>` cria o
registro com materia, acervo, temas, base e referencia da autorizacao.
`reserve` registra cada chamada antes de consumir inferencia e aplica limites
de escopo, duplicacao, concorrencia e prazo. `finish` registra sucesso ou
falha e consumo disponivel. Uma falha continua contando no teto de chamadas.
Retomar o mesmo registro preserva inicio e prazo. Nao criar outro registro para
contornar um limite. O registro e controle operacional, nao prova de revisao,
autenticacao ou autorizacao de producao.

## Verificacao e publicacao

O procedimento exige selecao local e remota identica por materia e componente
alterado. Infraestrutura alterada usa dados sinteticos. Outras materias,
pilotos fixos e infraestrutura intocada nao pertencem ao caminho curricular.
O pacote deve conter todos os temas, revisoes validas, runtime e visibilidade.
Confirmar a materia no candidato antes de promover. Conferir a revisao do
deploy e somente a materia nova em producao. Preparar rollback previamente.

Manter branch temporaria para develop, promocao para main e reconciliacao.
Nao promover mudancas incidentais. Concluir o board depois da conferencia em
producao e da reconciliacao. Preservar trabalho local existente.

## Orcamento de tempo

Prontidao 10 min; curadoria 40; revisoes 40; correcoes 25; verificacao e
promocao 35; deploy e reconciliacao 15; reserva 15. O total e 180 minutos
corridos, incluindo esperas. Ao atingir um limite, preservar resultados e
informar a causa. Nunca publicar incompleto para cumprir horario.

## Comando e pacote

Ao receber o comando aprovado, o coordenador le somente a fila curricular de
materias pendentes e as regras deste procedimento; seleciona a proxima materia
na ordem do manifesto congelado, ignorando materias ja publicadas. O pacote
usa os caminhos abaixo, com tema em kebab-case:

- Runtime: js/data/t3-<materia>-v2-published.js.
- Descritor: .github/subject-delivery.json, schemaVersion subject-delivery-v1,
  subject, contentSetId, runtimePath, runPath e batches. runPath aponta para o
  registro operacional sob docs/editorial/subject-runs/<materia>/.
- Cada batch informa topic, draftPath e recordPath.
- Rascunho: docs/drafts/2026-t3-v2--<materia>--<tema>.json com questions.
- Registro: docs/editorial/2026-t3-v2--<materia>--<tema>.json.
- Evidencias originais: docs/editorial/subject-runs/<materia>/<identificador>.json.
- Registro editorial inclui curationEvidencePaths e approval.kind delegated,
  delegationId cadastrado, sourceSha256, executionId e evidenceRef do comando.

Capture a resposta original de cada instancia com
scripts/capture-direct-editorial.cjs; a captura identifica autoria e passagens
pela transcricao real. Nunca inventar identidades ou fabricar transcricoes.

Prepare runtime, descritor e inclusao do script no index (indentacao de quatro
espacos). Acrescente somente a materia a publishedSubjects no catalogo; os
outros bytes permanecem identicos. O caminho rapido rejeita qualquer outro
arquivo compartilhado. Mudanca necessaria fora desse limite exige planejamento.

Execute npm run verify:subject para gerar o JSON do candidato. Antes de anexar
as evidencias visuais, as pendencias sao esperadas; use esse resultado com
CONTENT_DELIVERY_RESULT e test:ui:content-delivery -- --preview. Apos anexar as
evidencias, npm run verify:local exige todos os gates e repete a conferencia do
candidato final. Um preview nao representa aprovacao do pacote.

Abra um unico PR de entrega para develop apos a verificacao. Aguarde os checks
obrigatorios, confira o SHA e execute merge pelo metodo documentado. Abra PR de
promocao para main apenas se o diff integral contiver somente essa materia e
os manifestos operacionais ja aprovados; qualquer trabalho incidental bloqueia
a promocao. Confirme o deploy pelo SHA e rode a mesma verificacao visual com
BASE_URL apontando para producao e o JSON aprovado. Reconcilie main em develop.

O coordenador usa as ferramentas autenticadas existentes do GitHub. O runner
antigo e opcional; autenticacao do GitHub nao deve ser confundida com a sessao
ChatGPT do runner. O registro operacional nao substitui as evidencias reais.

## Aceite operacional

Os gates de curadoria direta, delegacao, escopo e conteudo podem ser ensaiados
com dados sinteticos sem chamada de modelo. A publicacao real permanece
condicionada ao comando especifico de atualizar a proxima materia. A meta de
180 minutos e o consumo efetivo somente ficam comprovados nessa execucao;
nao presumir sucesso por testes de infraestrutura.
