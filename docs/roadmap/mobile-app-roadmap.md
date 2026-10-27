# Roadmap: app familiar para iOS e Android

## Objetivo e principio de entrega

Validar uma oferta familiar paga nas lojas sem interromper o site. Cada etapa
tem um gate de entrada e de saida, produz evidencia revisavel e pode ser
revertida antes da seguinte. Este roadmap nao altera a prioridade da fila atual
nem autoriza datas, gastos, publicacao ou mudancas no board.

## Decisoes de referencia

- Cliente inicial: familias; usuario estudante do 3o ano.
- React Native/Expo, em `apps/mobile` dentro de monorepo npm.
- App gratis, uma amostra por materia, compra unica para o catalogo publicado
  incluido na versao inicial.
- Compra e restauracao separadas por loja; sem login, backend, sincronizacao,
  anuncios ou analytics de terceiros no MVP.
- Web continua na Vercel com fluxo e artefato independentes. Painel enterprise
  e uma trilha futura da web.

## Fases e gates

### Fase 0 — Produto, conteudo e conformidade

**Entregas:** validar proposta e compra unica com responsaveis; definir temas de
amostra; congelar o catalogo incluido; levantar custos e escolher preco antes
de criar SKUs; revisar privacidade, direitos de conteudo, classificacao etaria
e checklist infantil.

**Gate:** responsaveis entendem o valor, o limite da amostra, o que a compra
desbloqueia e a ausencia de sincronizacao; a pessoa responsavel aceita preco e
condicoes da oferta; nenhum requisito legal ou editorial bloqueia o piloto.

### Fase 1 — Workspace e isolamento do site

**Entregas:** workspace npm, `apps/mobile`, configuracao Expo/EAS, comandos de
desenvolvimento separados, CI por paths e exclusao de artefatos mobile do
deploy Vercel.

**Gate:** instalacao limpa e build mobile em iOS e Android; `npm run verify:local`
do site aprovado; preview Vercel sem arquivos/rotas moveis e sem diferenca
funcional web.

### Fase 2 — Conteudo, quiz e progresso local

**Entregas:** fronteira compartilhavel de conteudo, adaptador mobile, navegacao,
selecao de materia/tema, sessoes, feedback, explicacoes, revisao, historico e
offline; selecao editorial da amostra em cada materia.

**Gate:** teste de paridade cobre as seis materias e todos os campos editoriais
relevantes; regressao web preservada; testes em dispositivos reais confirmam
acessibilidade e jornada principal sem rede.

### Fase 3 — Compra e protecao parental

**Entregas:** produto nao consumivel em cada loja, fluxo atras de area parental,
restauracao, estados de erro e acesso gratuito/pago sem pressao comercial sobre
a crianca; politica de privacidade e declaracoes das lojas.

**Gate:** cenarios de compra, cancelamento, pendencia, reinstalacao e restauracao
passam nos ambientes sandbox de Apple e Google; descricao da loja corresponde
ao SKU; nenhuma conta ou telemetria infantil e introduzida.

### Fase 4 — Beta fechado e prontidao de loja

**Entregas:** distribuicao TestFlight e teste fechado Google Play, suporte,
captura de defeitos sem identificadores infantis, metadados, screenshots,
classificacao, politica, instrucoes de revisao e plano de rollback.

**Gate:** sem defeitos bloqueadores; checklist de privacidade, conteudo, compra,
restauracao, acessibilidade e dispositivo assinado por responsaveis; Product
Owner decide go/no-go para cada loja.

### Fase 5 — Lancamento controlado

**Entregas:** submissao manual aprovada para cada loja, monitoramento de crash e
suporte, revisao de conversao agregada e correcoes por releases pequenos.

**Gate:** avaliacao inicial confirma estabilidade, compreensao da oferta e
qualidade educacional; qualquer novo acervo ou faixa etaria passa por decisao de
produto e revisao editorial antes de entrar na oferta.

### Fase futura — Produto escolar na web

Descobrir necessidades com escolas separadamente: organizacoes, papeis,
consentimento, turmas, relatorios e retencao. So iniciar especificacao apos
evidencia de demanda e decisao sobre backend, identidade e governanca de dados.

## Validacao e sinais de decisao

- Pesquisa pre-beta: compreensao da proposta e disposicao a pagar por familias.
- Qualidade: sucesso de sessao, erros, navegacao e revisoes pedagogicas; nao
  compensar problemas educacionais com metricas de aquisicao.
- Operacao: crash, falha de compra/restauracao, tickets e reembolso agregados.
- Negocio: instalacoes, conversao e receita agregadas fornecidas pelas lojas,
  considerando impostos, comissao, suporte e custo de aquisicao.
- Definir limites quantitativos de go/no-go e periodo de observacao antes da
  beta; nao recolher eventos individuais de criancas no MVP.

## Riscos, dependencias e rollback

| Risco                                      | Controle ou resposta                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------- |
| Workspaces afetam instalacao/CI web        | `npm ci`, checks web e build mobile em jobs separados; PR pequeno de fundacao         |
| Deploy Vercel inclui arquivos moveis       | lista de exclusao e verificacao do artefato de preview antes de integrar app          |
| Conteudo diverge entre plataformas         | export/adaptador e teste de paridade; bloqueio por qualquer diferenca                 |
| Compra unica gera receita insuficiente     | entrevista, teste de oferta e calculo de custos antes de fixar preco e SKU            |
| Revisao de loja infantil atrasa ou rejeita | checklist previo, area parental, politica de privacidade e janela de revisao          |
| Compra nao atravessa iOS/Android           | informar claramente; tratar cada loja como entitlement separado no MVP                |
| Perda de progresso no dispositivo          | informar persistencia local; sincronizacao exige uma fase nova com avaliacao de dados |

Reverter uma etapa pelo PR da propria etapa. Nao remover o deploy web, alterar
`main` diretamente, apagar dados do site ou submeter uma nova versao sem
autorizacao explicita de release.

## Governanca e acompanhamento

Este roadmap e fonte para refinamento de issues, mas nao cria nem movimenta
issues ou cards automaticamente. Depois da revisao deste pacote documental,
converter cada fase em epic/historias vinculadas ao board existente, sem
misturar a trilha mobile com publicacao de conteudo T3 ou releases do site.
