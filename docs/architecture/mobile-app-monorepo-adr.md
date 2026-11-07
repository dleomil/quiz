# ADR: apps moveis em monorepo

## Estado

Proposto. Registrar a decisao final e sua revisao no fluxo de PR antes de usar
este documento como norma operacional.

## Contexto

O site atual e uma aplicacao estatica em HTML, CSS e JavaScript sem framework,
publicada pela Vercel. Os dados de conteudo sao carregados por scripts globais,
e o historico fica no `localStorage`. Apps precisam de interface nativa,
persistencia local compativel com mobile e cobranca pelas lojas. Alterar a
experiencia ou o deploy web para iniciar o app criaria risco desnecessario.

## Decisao proposta

1. Manter site e apps no mesmo repositorio usando npm workspaces, com o app em
   `apps/mobile`. Expo/React Native fornece as duas plataformas; EAS Build e
   Submit sao a trilha proposta para builds e submissao.
2. Manter dependencias e configuracoes de loja no workspace mobile. Comandos
   EAS, credenciais, identificadores e perfis de release ficam associados ao
   app, nao ao deploy web.
3. Criar `packages/quiz-content` somente quando a extracao do conteudo puder
   preservar a fonte editorial atual e comprovar paridade. O pacote compartilhado
   usa os contratos de conteudo existentes; adaptadores de UI permanecem
   especificos de web ou mobile.
4. Nao migrar o site para React Native, Expo Router ou um WebView. A interface
   mobile sera feita em React Native e deve ter navegacao, acessibilidade,
   persistencia e fluxo offline adequados a telefone e tablet.
5. Preservar o projeto Vercel e o artefato web atual. Configurar exclusao dos
   fontes/builds mobile do deploy estatico e adicionar uma verificacao de preview
   para confirmar que rotas do site, headers e conteudo permanecem corretos.
6. Usar armazenamento local para sessoes no MVP e um adaptador de compra para
   compra nao consumivel e restauracao em cada loja. Nao criar backend ou conta
   familiar nesta etapa.

## Estrutura alvo

```text
apps/mobile/                 # Expo, navegacao, UI e integracoes nativas
packages/quiz-content/       # conteudo validado compartilhavel, apos paridade
css/, js/, index.html        # site atual, mantido funcional durante a transicao
scripts/, tests/             # governanca e validacoes do site/conteudo
```

O pacote compartilhado nao deve conter APIs de navegador, renderizacao,
componentes visuais ou secrets. Cada app fornece adaptadores para carregar
conteudo e persistir sessao sem alterar a semantica dos contratos existentes.

## Estrategia de migracao sem regressao

1. Capturar o comportamento e o catalogo do site como baseline de paridade.
2. Criar o workspace mobile e comprovar builds locais de iOS e Android sem
   alterar o deploy web.
3. Extrair ou gerar os dados validados para o pacote compartilhado; comparar
   IDs, textos, alternativas, respostas, explicacoes, idiomas, versoes e estados
   de publicacao contra a origem do site.
4. Integrar primeiro o app ao pacote. Migrar o site para consumir o pacote
   somente em PR separado, com todos os checks e comparacao visual/conteudo.
5. Bloquear release do app se paridade, cobertura de seis materias ou gates
   editoriais falharem.

## Alternativas consideradas

- **Repositorio separado:** isola dependencias, mas cria duplicacao de conteudo,
  governanca e sincronizacao entre dois repositorios.
- **WebView/Capacitor:** pode reduzir o primeiro esforco, mas nao entrega a
  experiencia nativa escolhida e pode ser insuficiente como app infantil; o
  Google Play proibe app infantil que seja apenas WebView de um site.
- **Reescrever o site junto com o app:** amplia o escopo e combina risco de
  producao com validacao mobile; nao atende ao requisito de independencia.

## Consequencias e controles

- O monorepo simplifica a fonte de conteudo, mas aumenta complexidade de CI e
  resolucao de dependencias; manter comandos e checks por workspace.
- Workspaces podem afetar lockfile e instalacao raiz; verificar `npm ci`, os
  checks web e builds mobile antes de cada PR de fundacao.
- Vercel nao pode publicar `apps/mobile` nem fontes compartilhados privados.
  O preview deve validar que o deploy contem apenas os arquivos web esperados.
- Credenciais de Apple, Google e Expo permanecem fora do Git, em armazenamento
  de secrets apropriado, com acesso minimo e rotacao documentada.
- Reverter a fundacao deve ser possivel por PR sem alterar conteudo publicado,
  historico local do site ou configuracao de producao.

## Referencias tecnicas

- [Expo: workspaces e monorepos](https://docs.expo.dev/guides/monorepos/)
- [Expo: EAS Build em monorepos](https://docs.expo.dev/build-reference/build-with-monorepos/)
- [Google Play: politica para familias](https://support.google.com/googleplay/android-developer/answer/9893335?hl=pt-BR)
