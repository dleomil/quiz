# Instrucoes do projeto Quiz

## Operacao eficiente e segura

- Para operacoes Git rotineiras, use o auxiliar global `codex-safe-git`.
- Push automatizado so e permitido pelo auxiliar para branches temporarias
  deste repositorio; nunca faca push direto para `main` ou `develop`.
- Nao use reset, clean, amend, rebase, force-push ou exclusao de branches sem
  autorizacao explicita e verificacao do alvo.
- Agrupe leituras e verificacoes independentes e execute
  `npm run verify:local` antes de abrir um PR.
- Preserve alteracoes existentes do usuario; nao as inclua em commits sem
  autorizacao explicita.
- Use mensagens de commit curtas em portugues ASCII; nao use comentarios em
  ingles nem anexe historico automatico.

## Qualidade e publicacao

- Conteudo T3 deve respeitar manifesto curricular, cobertura e revisoes
  pedagogica e linguistica, alem da aprovacao humana aplicavel.
- Automacao, parecer de agente ou passagem nos checks nao autorizam merge,
  release ou deploy por si so.
- Mudancas para `main` exigem PR, checks obrigatorios e autorizacao explicita
  de release; mantenha o fluxo de reconciliacao documentado.
