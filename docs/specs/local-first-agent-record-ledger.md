# Spec: Ledger Local-First de Registros de Agentes

## Objetivo

Persistir, auditar, exportar e sincronizar registros reais
`agent-execution-record-set-v1` sem backend, rede ou versionamento desses dados
no repositorio. O ledger vive somente em um diretorio externo informado pelo
operador.

## Contratos v1

`agent-execution-ledger-v1` armazena uma lista nao vazia de revisoes. Cada
revisao possui numero sequencial, hash da revisao anterior, registros
adicionados e seu proprio SHA-256. O hash cobre a representacao JSON canonica
de `revision`, `previousSha256` e `addedRecords`; a primeira revisao usa
`previousSha256: null`.

Os registros de uma revisao usam ordem canonica por `recordId` e
`executionId`. O ledger completo e validado cumulativamente contra o contrato
de registros, o modelo central de capabilities e as regras de separacao.

`agent-execution-sync-bundle-v1` contem o conjunto completo e canonico de
registros mais seu SHA-256. Nao inclui timestamp, hostname, caminho local ou
identificador de origem, portanto exportacoes do mesmo conjunto sao identicas.

`agent-execution-audit-report-v1` informa hash da cabeca, quantidades de
revisoes e registros, contagens de outcomes e severidades e os IDs de findings
abertos. O relatorio e `attention-required` quando existe finding aberto ou
outcome `adjustments-required`, `blocked` ou `failed`; isso nao torna um ledger
estruturalmente valido em invalido.

## Interface operacional

Use o runner unico:

```bash
npm run records:ledger -- init --ledger-dir <diretorio> --input <record-set>
npm run records:ledger -- append --ledger-dir <diretorio> --input <record-set>
npm run records:ledger -- audit --ledger-dir <diretorio>
npm run records:ledger -- audit --ledger-dir <diretorio> --output <arquivo>
npm run records:ledger -- export --ledger-dir <diretorio> --output <bundle>
npm run records:ledger -- sync --ledger-dir <diretorio> --input <bundle>
```

`append` e `sync` tambem aceitam `--dry-run`. Nesse modo nao criam lock,
temporario ou arquivo de saida.

`init` exige diretorio existente, externo ao repositorio, vazio e que nao seja
symlink. Depois da inicializacao, o diretorio gerenciado contem somente
`ledger.json`; bundles e relatorios devem ser gravados fora dele e nunca
sobrescrevem arquivo existente.

## Append e sincronizacao

O ledger e logicamente append-only. Registros existentes nao podem ser
alterados ou removidos pelas interfaces. Um registro recebido e idempotente
somente quando `recordId`, `executionId` e todo o conteudo canonico sao
identicos. Qualquer colisao diferente aborta o lote inteiro antes da escrita.

`append` recebe um record-set, enquanto `sync` recebe um bundle completo de
outra copia local. Ambos validam a uniao resultante, permitindo que um checker
novo referencie uma execucao produtora ja persistida. A sincronizacao e manual,
sem watcher, rede ou resolucao automatica de conflito.

O modelo de capabilities nao e copiado para o ledger ou bundle. A copia
receptora valida todos os registros contra o modelo versionado no checkout
atual; incompatibilidade aborta a operacao sem escrita. Migracao entre versoes
incompativeis do modelo nao faz parte da v1.

## Integridade e recuperacao

Mutacoes adquirem `ledger.lock` com criacao exclusiva, revalidam o ledger sob o
lock, escrevem `ledger.next.json` com permissao restrita, sincronizam o arquivo
e o substituem atomicamente. Falhas anteriores ao rename removem o temporario e
preservam o ledger anterior; depois do rename, o estado novo ja e um documento
completo e validado. Lock residual, arquivo extra, symlink ou operacao
concorrente falham fechados e exigem verificacao humana antes de qualquer
limpeza.

Arquivos de entrada e saida sao limitados a 16 MiB. O utilitario nao acessa
rede, rejeita symlinks como arquivo de entrada, ledger ou pai imediato da
saida, e canonicaliza os ancestrais do destino antes de escrever. Ele nao
escreve dentro do repositorio. Erros da CLI nao reproduzem o conteudo recebido
nem caminhos absolutos.

A cadeia detecta alteracao interna enquanto a cabeca esperada for conhecida,
mas nao autentica o autor e nao prova sozinha que a ultima revisao nao foi
truncada e re-hasheada. O hash do relatorio anexado ao PR ou card funciona como
checkpoint externo. Assinatura, criptografia e gestao de chaves pertencem a
uma entrega futura.

## Dados e governanca

O ledger aceita os campos textuais permitidos pelo contrato existente, logo a
revisao humana continua responsavel por impedir segredo, credencial, dado
identificavel de crianca ou feedback escolar bruto. A auditoria nao abre URLs
nem tenta provar a existencia das evidencias referenciadas.

Somente schemas, utilitario, testes e fixtures ficticias sao versionados.
Ledgers, bundles e relatorios reais permanecem externos. Esta entrega nao
altera o MCP `quiz-governance`, agentes executaveis, runtime ou interface do
quiz.

## Rollback

Reverter o utilitario, schemas, testes e documentacao. Nao apagar ledgers
externos: eles permanecem JSON legivel e seus conjuntos podem ser preservados
em bundles. Nao existe migracao ou deploy.
