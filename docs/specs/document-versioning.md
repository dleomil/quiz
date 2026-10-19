# Versionamento documental

## Objetivo e alcance

Todos os Markdown versionados, incluindo README, AGENTS e documentos historicos,
integram `config/document-catalog.json`. Dados curriculares, recibos de execucao
e auditorias JSON conservam seus contratos proprios. Anexos documentais futuros
exigem ampliacao explicita do cadastro antes de serem usados como requisitos.

O Git preserva o conteudo, a autoria e as datas. O catalogo identifica caminho,
ID estavel, tipo, responsavel, revisao, versao, estado e SHA-256. Caminhos
permanecem estaveis; uma renomeacao intencional preserva o ID. Nenhuma versao
aprovada e descoberta por uma referencia movel como `latest`.

## Estados e baseline inicial

`baseline-pending` identifica normas candidatas ao aceite inicial. O inventario
usa referencias explicitas do modelo de agentes e da governanca; nao deduz
vigencia pelo nome, trimestre ou data do arquivo. Documentos nao classificados
permanecem `unclassified`; README e indices podem ser `informative`. Registros
em `docs/audits` sao `historical`, preservados e nunca promovidos a normas.

`draft`, `approved` e `superseded` descrevem a evolucao normativa. Um estado
`approved` no catalogo, sozinho, nao comprova aceite humano. O consumidor deve
conferir um recibo ligado ao baseline exato e ao comentario humano consultado
no GitHub. O aceite inicial reconhece documentos operacionais, sem aprovar
retroativamente questoes, traducoes ou auditorias antigas.

O baseline e exportado somente de um commit existente, com a lista normativa,
seus metadados, conteudo recuperavel no Git e hash do conjunto. O responsavel
examina essa lista antes de registrar numa issue deste repositorio:

```text
Aprovo o baseline documental hash <sha256>
```

`verify-approval` consulta o comentario, confere URL, autor autorizado, tipo
User e a linha exata. O recibo registra a referencia e a data; ele comprova a
declaracao da conta autorizada, sem autenticar criptograficamente a pessoa.
Uma autorizacao generica de implementacao ou merge nao substitui esse aceite.

## Atualizacao e fonte unica

```sh
npm run documents:sync
npm run validate:documents -- --base-ref origin/develop
npm run documents:changes -- --base-ref origin/develop
npm run documents:baseline -- --ref HEAD
npm run documents:verify-approval -- --baseline <baseline.json> --evidence <comentario>
```

`sync` e a unica operacao de escrita: cadastra novos Markdown, atualiza hashes e
incrementa uma revisao por alteracao de conteudo. Cada norma alterada recebe
incremento patch por padrao e volta a `draft`; extensoes compativeis exigem
minor e alteracoes normativas incompativeis exigem major, avaliadas no PR.
Sincronizar novamente o mesmo conteudo nao altera a revisao.

O catalogo documental e a fonte dos metadados compartilhados. `sync` projeta
versao, hash e responsavel no catalogo de governanca existente; os campos de
aplicabilidade e enforcement continuam definidos exclusivamente na governanca.
Os contratos e bundles de governanca v1 permanecem compativeis. Uma divergencia
entre os dois cadastros bloqueia a validacao.

O gate compara a mudanca com a base do PR: conteudo alterado exige proxima
revisao, versao normativa maior e nova aprovacao antes de uso operacional.
Excluir normas ou alterar registros historicos exige revisar o escopo, sem
apagar o historico do Git. Uma renomeacao explicita nao cria uma nova identidade.

## Consumo e limites

Pacotes de trabalho registram ID, versao, commit e hash de cada requisito.
Rascunhos e documentos nao classificados nao sao fontes normativas aprovadas.
Uma mudanca no requisito invalida o reaproveitamento silencioso de revisoes.
Tags fixas `docs-baseline/AAAA-MM-DD` podem identificar marcos aprovados depois
da protecao adequada; este trabalho nao cria tags moveis, tags de release ou
altera configuracao de protecao do GitHub.

O inventario nao copia fontes escolares nem modifica questoes. O rollback e
um PR de reversao das ferramentas e catalogos, preservando recibos e registros.
