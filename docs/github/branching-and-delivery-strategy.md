# Estrategia de Branching e Evolucao Controlada

## Objetivo

Definir uma estrategia simples de branching para o inicio da evolucao do
produto, reduzindo risco operacional e impondo governanca leve com checks e
decisoes humanas rastreaveis.

## Estrategia recomendada

### Branches permanentes

- `main`
  - branch de producao
  - deve refletir apenas codigo aprovado para release

- `develop`
  - branch de integracao
  - recebe features e ajustes aprovados antes de promover para `main`

### Branches temporarias

- `feature/*`
  - novas capacidades

- `fix/*`
  - correcao comum

- `hotfix/*`
  - correcao urgente com destino preferencial para `main`

- `release/*`
  - branch opcional para consolidacao e validacao final antes do merge em `main`

- `chore/*`
  - manutencao tecnica

- `docs/*`
  - alteracoes de documentacao

- `refactor/*`
  - reorganizacao estrutural sem mudanca funcional planejada

## Fluxo recomendado

1. Criar branch a partir de `develop` para trabalho normal.
2. Abrir Pull Request da branch temporaria para `develop`.
3. Exigir a revisao permitida pelo modo de manutencao vigente e concluir com
   squash as branches temporarias que entram em `develop`, exceto a
   reconciliacao pos-release.
4. Promover `develop` para `main` via Pull Request com autorizacao de release.
5. Quando houver necessidade de estabilizacao antes da publicacao, permitir `release/*` com destino a `main`.

### Reconciliacao obrigatoria apos release

- concluir promocoes de `develop` para `main` com merge commit; nao usar squash
  ou rebase nesse fluxo;
- depois de cada promocao, incorporar `main` novamente em `develop` por uma
  branch `chore/reconcile-main-develop` e Pull Request exclusivo, tambem
  concluido com merge commit;
- preservar em `develop` qualquer trabalho posterior ao corte do release e
  revisar conflitos sem escolher um lado inteiro de forma automatica;
- confirmar que `main` faz parte do historico reconciliado antes de iniciar a
  proxima entrega;
- se houver hotfix direto em `main`, reconciliar o hotfix em `develop` antes de
  retomar o desenvolvimento normal.

A reconciliacao registra a ancestralidade do release e nao autoriza nova
promocao, deploy ou alteracao funcional.

O historico linear deve permanecer desabilitado em `main` e `develop` para
permitir esses merge commits controlados. As demais protecoes continuam
obrigatorias. O gate de ancestralidade bloqueia uma promocao ou reconciliacao
quando o historico esperado nao estiver presente; a escolha do metodo de merge
continua sendo uma verificacao manual do Product Owner.

Imediatamente antes do merge, o operador deve buscar novamente `origin/main` e
executar `npm run validate:branch-sync` contra o SHA atual do PR. Se `main`
tiver avancado desde o check da esteira, a integracao deve ser interrompida e o
head atualizado. Essa verificacao just-in-time cobre a janela que os eventos
nativos de Pull Request nao invalidam automaticamente.

### Modo temporario de mantenedor unico

Enquanto `dleomil` for o unico colaborador humano elegivel, `main` e `develop`
nao exigem aprovacao de outro usuario no GitHub, pois o autor nao pode aprovar o
proprio Pull Request. A excecao remove somente `required_pull_request_reviews`.

Continuam obrigatorios:

- Pull Request e proibicao de push direto;
- checks remotos configurados e branch atualizada;
- resolucao de conversas e protecao aplicada a administradores;
- evidencia tecnica no PR e decisao final do mantenedor unico;
- autorizacao explicita de release para `main`;
- aprovacoes humanas pedagogicas, editoriais ou de produto aplicaveis.

Parecer automatizado ou de agente nao deve ser descrito como aprovacao humana
independente. A excecao e rastreada pela Tech Task #310.

Quando existir um segundo colaborador humano com permissao `write`, `maintain`
ou `admin`, antes do proximo merge devem ser restauradas em ambas as branches:

- uma aprovacao obrigatoria;
- descarte de aprovacoes obsoletas apos novos pushes;
- aprovacao por outro usuario depois do ultimo push.

## Modos de operacao por calendario escolar

O Product Owner deve declarar no epic ou PR de promocao qual modo esta ativo.
Na ausencia dessa declaracao, aplica-se o modo protegido.

### Modo continuo - fora de epoca de provas

- promover lotes pequenos de `develop` para `main` com maior frequencia;
- manter PR exclusivo de promocao, aprovacao manual, checks obrigatorios,
  preview, rollback e smoke test em producao;
- preferir mudancas reversiveis e independentes, sem acumular um grande release;
- interromper novas promocoes se houver regressao ou evidencia insuficiente.

### Modo protegido - preparacao e realizacao de provas

- congelar evolucoes nao essenciais em producao;
- permitir apenas correcoes bloqueantes, seguranca ou conteudo indispensavel para
  a prova, sempre com escopo minimo;
- exigir regressao completa das jornadas afetadas e evidencia no card ou PR;
- evitar promocoes durante o horario de estudo definido pelo Product Owner;
- monitorar o deploy e manter rollback imediato disponivel.

A mudanca de modo altera a frequencia permitida, nao reduz os gates de
qualidade. Conteudo educacional continua sujeito aos gates pedagogicos,
linguisticos e humanos em ambos os modos.

## Regras de governanca inicial

- nao fazer push direto em `main`
- nao fazer push direto em `develop`
- toda evolucao deve passar por Pull Request
- exigir aprovacao independente quando houver ao menos dois mantenedores
  elegiveis; durante a fase de mantenedor unico, aplicar a excecao rastreada em
  #310
- usar GitHub Actions como gate minimo de governanca nos PRs
- registrar o modo operacional vigente em toda promocao para `main`

## Motivacao arquitetural

Este modelo e propositalmente simples. Criar muitas branches permanentes neste momento aumentaria custo de coordenacao sem gerar ganho proporcional. Para a maturidade atual do projeto, `main` e `develop` sao suficientes.

## Evolucao futura

Quando o produto tiver ambientes e releases mais frequentes, a estrategia pode evoluir para:

- ambientes com aprovacao por environment
- release branches sob demanda
- validacoes obrigatorias mais fortes no CI
- deploy automatizado com gates manuais por ambiente
