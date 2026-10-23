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
- Antes de criar ou ampliar conteudo T3, executar o preflight apenas para os
  temas autorizados:

  ```sh
  npm run preflight:t3 -- --subject <materia> --topic <tema>
  ```

  Repetir `--topic <tema>` para cada tema. Codigo 2 significa que pelo menos
  um tema solicitado ja esta publicado e completo: interromper antes de
  escrever e revisar o escopo; codigo 1 indica entrada ou estado invalido;
  codigo 0 indica que o trabalho solicitado nao esta completo, sem substituir
  revisao editorial ou aprovacao humana.

- Automacao, parecer de agente ou passagem nos checks nao autorizam merge,
  release ou deploy por si so.
- Mudancas para `main` exigem PR, checks obrigatorios e autorizacao explicita
  de release; mantenha o fluxo de reconciliacao documentado.
