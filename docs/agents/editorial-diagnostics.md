# Diagnóstico privado do runner editorial

Guia informativo para localizar evidências; não altera critérios editoriais,
modelos, versão homologada, isolamento ou aprovações humanas.

## Produção

Cada invocação cria um diretório privado em
`<auth-home>/quiz-editorial-runs/<runId>/result.json.capture`.
O recibo público identifica `captureId` e `captureSha256`; os arquivos brutos
permanecem fora do checkout. Avaliações conservam seus caminhos existentes.

A captura contém stdout JSONL, stderr, resposta final quando disponível e um
manifesto com hashes, tamanhos, término do processo e diagnóstico estruturado.
Diretórios usam 0700 e arquivos exclusivos usam 0600. O limite conjunto dos
fluxos é 16 MiB. Uma falha de captura impede aceitar a saída editorial.

## Inspeção

Usar `verifyCapture` de `scripts/agent-event-capture.cjs`, passando o caminho
`<auth-home>/quiz-editorial-runs/<captureId>/result.json` e o hash do recibo.
Inspecionar os eventos indicados pelo diagnóstico somente depois de verificar
a integridade. Mensagens detalhadas de erro ficam nos arquivos privados;
não colar logs brutos em PRs, issues ou documentos públicos.

Uma captura íntegra comprova o que ocorreu, mesmo em uma execução rejeitada.
Não transforma erro em sucesso nem autoriza nova tentativa. Preservar os
recibos anteriores e criar nova ficha, runId e saída a cada tentativa autorizada.
Não remover capturas automaticamente. A reversão do código não apaga evidências.

## Compatibilidade de configuração

A execução editorial usa a CLI homologada 0.160.0 com `--no-daemon`,
`features.code_mode.enabled=false` e o host de Code Mode desativado.
O perfil persistente permanece intacto; os argumentos explícitos também
valem quando a execução ignora a configuração de usuário. O erro de host
indisponível continua bloqueante. A aceitação depende do resultado real
e da captura íntegra, não apenas da configuração ou do código de saída.
