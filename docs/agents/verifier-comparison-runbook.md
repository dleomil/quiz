# Operacao da comparacao separada de verificadores

Este experimento atende a issue #411. Ele compara somente os modelos
gpt-5.6-terra/medium e gpt-6.1-sol/high, usando seis casos sinteticos e ate 12
chamadas no total. Cada caso e avaliado uma vez por modelo. O contador, os
recibos e os resultados ficam em uma campanha privada separada do benchmark v2.

## Preparar e aprovar o pacote

Concluir npm run verify:local, integrar o codigo aprovado no commit que sera
medido e manter o checkout limpo. Gerar o pacote fora do repositorio:

    npm run evaluation:verifiers -- benchmark-check \
      --output /private/tmp/agent-verifier-comparison-package.json

Revisar o corpus e apresentar o SHA-256, o commit de origem e o teto de 12
invocacoes ao mantenedor. benchmark-check nao autentica, nao reserva slots e
nao chama modelos. Antes das chamadas, obter aceite explicito para o hash e o
teto. O aceite fica vinculado ao pacote e nao e assinatura criptografica.

## Autenticacao e prontidao

Use somente o perfil dedicado oficial, sem copiar credenciais e sem chave de
API. Se o status indicar logout, conclua o login ChatGPT por device code:

    node scripts/agent-auth.cjs login --auth-home "$HOME/.codex-quiz-auth"
    npm run evaluation:verifiers -- ready \
      --auth-home "$HOME/.codex-quiz-auth" \
      --package /private/tmp/agent-verifier-comparison-package.json

ready verifica login, versao da CLI, isolamento, MCP vazio e presenca dos dois
modelos no catalogo, sem invocar modelos. O catalogo nao comprova acesso da
conta; falha de acesso durante chamada e registrada, consome o slot e nao tem
fallback.

Depois do aceite explicito do pacote e do orcamento, registrar a aprovacao
local vinculada ao hash:

    npm run evaluation:verifiers -- approve \
      --auth-home "$HOME/.codex-quiz-auth" \
      --package /private/tmp/agent-verifier-comparison-package.json \
      --statement "Aprovo o pacote HASH e o limite total de 12 chamadas."

## Execucao e limites

Executar cada combinacao uma vez, sem concorrencia, retry, reset, retomada ou
troca de modelo. Qualquer resultado de modelo valido, inclusive falha de
qualidade, permanece registrado. Falha tecnica depois da reserva tambem
consome o slot. Interrupcao abrupta pode deixar o bloqueio de concorrencia; nao
remova o bloqueio nem retome a campanha sem revisao e nova decisao do mantenedor.

    npm run evaluation:verifiers -- run \
      --auth-home "$HOME/.codex-quiz-auth" \
      --package /private/tmp/agent-verifier-comparison-package.json \
      --case missing-empty-case --variant current

Repetir para cada ID listado no pacote (valid-reducer, valid-loop, valid-helper,
missing-empty-case, missing-input-validation e contradictory-test-evidence)
com current e candidate. O ledger bloqueia slots duplicados e qualquer
execucao acima de 12. Propostas, capturas e resultados permanecem no perfil
privado, nunca no Git ou GitHub.

## Aceite e relatorio

O resultado esperado e aceitar os tres controles sem achados; identificar
VER-EMPTY e VER-INPUT nos casos de defeito; e bloquear a evidencia contraditoria
com VER-EVIDENCE. Cada achado precisa de severidade e evidencia especifica. O
resultado nao habilita modelo para uso regular.

    npm run evaluation:verifiers -- report \
      --auth-home "$HOME/.codex-quiz-auth" \
      --package /private/tmp/agent-verifier-comparison-package.json \
      --output /private/tmp/agent-verifier-comparison-report.json

O relatorio inclui tentativas, recibos, uso informado, duracao, resultados e
limitacoes. A amostra pequena e sintetica nao comprova desempenho geral; a CLI
nao atesta identidade remota do modelo nem consumo da assinatura. Qualquer
ativacao de perfil exige decisao, PR e autorizacao proprios.
