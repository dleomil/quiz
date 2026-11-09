# Operacoes externas pendentes

O candidato esta completo em 180 IDs e 360 vinculos, fora do runtime. O card
unico nao foi criado porque a ferramenta GitHub exigiu aprovacao e a politica
desta sessao e `never`.

## Preview visual e verificacao local

Execute a partir da raiz desta branch em um host que permita servidor local e
Chromium:

```sh
node scripts/geografia-direct-package.cjs --final
node scripts/geografia-direct-preview.cjs
CONTENT_DELIVERY_RESULT=docs/editorial/2026-t3-v2-geografia-direct/ui-preview-selection.json CONTENT_DELIVERY_ARTIFACTS=docs/editorial/2026-t3-v2-geografia-direct/visual node tests/ui/content-delivery.spec.cjs --preview --draft-geografia
npm run verify:local
```

A UI salva `result.json` e capturas em `docs/editorial/2026-t3-v2-geografia-direct/visual`.
Anexe essa evidencia ao card e confirme que os IDs e hashes do resultado
correspondem a `package-summary.json` e ao manifesto do preview.

## Card unico de acompanhamento

**Titulo:** Entregar Geografia 2026-t3-v2 — 180 questoes, 360 revisoes e aceite pendente

**Descricao:**

- [x] Nove temas completos, 20 questoes por tema.
- [x] Duas passagens independentes por ID, 360 vinculos aprovados nos hashes atuais.
- [x] Revisoes, correcoes, validacao e preview editorial rastreados no pacote local.
- [ ] Captura visual em host com servidor local e Chromium disponiveis.
- [ ] Executar `npm run verify:local` sem bloqueio ambiental.
- [ ] Revisar e aceitar o hash exato em `package-summary.json`.
- [ ] Autorizar release; publicar somente pelo fluxo com PR e checks obrigatorios.

Fontes: `docs/drafts/2026-t3-v2-geo-*.json`,
`docs/editorial/2026-t3-v2--geografia--*.json` e
`docs/editorial/2026-t3-v2-geografia-direct/`. Nao publicar antes do aceite
humano e da autorizacao de release. Rollback deve se restringir a esta entrega
ou ao suporte direto, sem remover conteudo ou relatorios anteriores.
