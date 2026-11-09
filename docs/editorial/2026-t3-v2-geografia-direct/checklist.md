# Geografia 2026-t3-v2

Base: branch temporaria `feature/geografia-direct-editorial-20261109`, criada
de `origin/develop` em `0e5f0e0`. Autoria editorial nesta entrega:
coordenador Codex, com propostas avaliadas por agentes pedagogical_quality.
Preflight confirmou os nove temas pendentes antes da primeira edicao.

O pacote candidato contem nove temas, 180 IDs unicos e 360 vinculos de revisao
aprovados nos hashes atuais. O estado verificavel e gerado por
`node scripts/geografia-direct-package.cjs --final` e salvo em
`package-summary.json`. O runtime publicado permanece sem estas propostas.
O pacote aguarda aceite editorial humano.

- [x] Usos da agua: 20 questoes, 40 vinculos aprovados.
- [x] Percurso da agua: 20 questoes, 40 vinculos aprovados.
- [x] Agua potavel, reuso e reaproveitamento: 20 questoes, 40 vinculos aprovados.
- [x] Agua nos centros urbanos: 20 questoes, 40 vinculos aprovados.
- [x] Agua no campo: 20 questoes, 40 vinculos aprovados.
- [x] Municipio: 20 questoes, 40 vinculos aprovados.
- [x] Integracao e infraestrutura urbana e rural: 20 questoes, 40 vinculos aprovados.
- [x] Desigualdades urbanas e rurais: 20 questoes, 40 vinculos aprovados.
- [x] Tecnologia no campo: 20 questoes, 40 vinculos aprovados.
- [x] Testes de entrega, captura direta e compatibilidade legada.
- [x] Preview editorial HTML com manifesto de 180 IDs, hashes por questao e hashes de lote.
- [ ] Captura visual renderizada: indisponivel neste ambiente, que bloqueia servidor local e inicializacao do Chromium.
- [x] `npm run verify:local`: testes de agentes, entrega e seguranca passaram; a etapa UI falhou ao iniciar o servidor em `127.0.0.1:4187`. Reexecutar em host que permita servidor local e Chromium.
- [ ] Aceite editorial humano do hash exato e autorizacao de release.

Cada parecer direto guarda a entrada completa, a resposta original integral, a
identidade real da instancia e da execucao, a data, os IDs e os hashes. As
passagens registram rastreabilidade documental; nao sao recibos de CLI nem
prova de isolamento. Pareceres anteriores aos ajustes permanecem preservados,
mas apenas resultados individuais aprovados para o hash atual entram nos
registros finais.

A criacao do card unico no GitHub foi bloqueada pelo sistema de aprovacao da
sessao: a ferramenta exigiu aprovacao e a politica ativa era `never`. O texto
e os passos externos estao em `external-operations.md`.

Publicacao depende do aceite humano do hash exato, autorizacao de release, PR
e checks obrigatorios. Nao houve push, merge ou alteracao no runtime publicado.
O rollback deve reverter somente a entrega de Geografia ou o suporte direto,
preservando conteudo e relatorios anteriores.
