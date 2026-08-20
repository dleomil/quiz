# Avaliacao de Seguranca do Frontend

## Objetivo

Consolidar a baseline atual, os riscos conhecidos e a sequencia segura de
endurecimento do frontend sem alterar o comportamento da aplicacao em producao.

## Escopo

- renderizacao dinamica no navegador
- conteudo curricular e historico local
- dependencia remota de runtime
- headers entregues pela Vercel
- validacoes nativas do GitHub

Ficam fora desta avaliacao autenticacao, backend, DAST e ferramentas externas.

## Baseline Atual

| Superficie             | Estado atual                                          | Controle existente                               |
| ---------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| Conteudo curricular    | Arquivos JavaScript versionados                       | revisao editorial, validador estrutural e CodeQL |
| Historico              | `localStorage`, limitado a 60 sessoes                 | sem importacao remota ou sincronizacao           |
| Dependencia de runtime | Chart.js 4.4.3 pelo jsDelivr                          | versao fixada                                    |
| Headers                | `nosniff`, `DENY` e `strict-origin-when-cross-origin` | configuracao versionada em `vercel.json`         |
| Pipeline               | CodeQL e dependency review                            | GitHub Actions nativo                            |

## Mapa de Riscos

### Prioridade 1: dados inseridos em HTML

As views usam `innerHTML` para montar telas com conteudo curricular, metadados e
historico. Parte das explicacoes ja passa por escape, mas a regra nao e uniforme.
Hoje as fontes sao locais e versionadas, o que reduz a explorabilidade. A futura
entrada por painel, API ou sincronizacao transformaria essa lacuna em risco alto.

Pontos prioritarios:

- `js/views/quiz.js`: texto, pergunta, alternativas e metadados
- `js/views/results.js`: pergunta, alternativas, topico e arquivo HTML baixado
- `js/views/history.js`: valores recuperados do `localStorage`
- `js/views/home.js` e `js/views/subject.js`: metadados e atributos dinamicos
- `scripts/validate-content.cjs`: nao bloqueia marcacao executavel no conteudo

### Prioridade 2: dependencia remota

O Chart.js e carregado diretamente do jsDelivr. A versao e fixa, mas nao ha SRI,
fallback ou teste de indisponibilidade. O dependency review do npm nao cobre esse
script remoto.

### Prioridade 3: headers e CSP

Os headers atuais oferecem uma baseline adequada, mas nao ha CSP nem
`Permissions-Policy`. Uma CSP estrita nao deve ser ativada imediatamente porque
existem handlers e estilos inline que precisam ser removidos ou tratados antes.

## Plano de Evolucao

### Fase 1: teste e renderizacao segura

- criar testes com conteudo e historico contendo marcacao inerte
- centralizar escape por contexto ou preferir `textContent` e `createElement`
- validar o schema do historico lido do `localStorage`
- rejeitar marcacao executavel no gate de conteudo
- remover handlers `onclick` inline

### Fase 2: dependencia confiavel

- preferir Chart.js versionado e servido pelo proprio projeto
- se o CDN permanecer, adicionar SRI, `crossorigin` e fallback sem grafico
- validar que o historico continua utilizavel quando o grafico nao carregar

### Fase 3: headers graduais

- adicionar `Permissions-Policy` restritiva
- definir CSP compativel com os recursos realmente usados
- validar CSP primeiro em preview e modo de observacao
- promover o header de bloqueio somente apos eliminar violacoes conhecidas
- confirmar os headers efetivos no deployment da Vercel

## Requisitos de Seguranca

- dados curriculares, persistidos ou futuros dados remotos nunca podem executar HTML
- controles devem considerar o contexto de texto, atributo e URL
- falha do Chart.js nao pode impedir acesso ao historico textual
- nenhum header pode ser promovido sem teste da preview em desktop e mobile
- nenhuma evidencia deve conter dado identificavel de aluno
- cada fase deve ser entregue em PR independente e reversivel

## Validacao Minima por Fase

- testes negativos de renderizacao e persistencia
- suite completa, lint e formatacao
- CodeQL e dependency review sem falha
- smoke Playwright da home, quiz, resultado e historico
- verificacao dos headers na preview
- evidencia registrada no card antes de merge

## Rollout e Rollback

Cada fase entra primeiro em `develop` e preview. Mudancas funcionais ou de headers
so podem seguir para `main` depois da aprovacao humana. O rollback e feito pela
reversao do PR da fase; nao ha migracao destrutiva prevista.

## Decisoes

- a issue #47 foi consolidada na #48 por sobreposicao integral
- o PR #50 permanece como baseline de CI, nao como conclusao do hardening
- a primeira implementacao deve ser a Fase 1; CSP nao deve antecipar a correcao
  dos pontos de renderizacao
