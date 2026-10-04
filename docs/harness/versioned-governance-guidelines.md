# Catalogo Versionado de Guidelines de Governanca

## Objetivo

Disponibilizar um indice validavel das principais policies do projeto sem
copiar, resumir ou substituir seu texto normativo.

`config/governance-guidelines.json` armazena somente metadados, versoes,
aplicabilidade, classificacao de enforcement, evidencias e hashes SHA-256. Cada
`sourcePath` continua sendo a fonte de verdade.

## Fontes autorizadas

O catalogo aceita documentos Markdown versionados sob:

- `docs/harness/`;
- `docs/specs/`;
- `docs/agents/`;
- `docs/github/`.

Arquivos ausentes, nao versionados, fora dessas raizes, symlinks ou documentos
com hash divergente invalidam o catalogo.

## Validacao e manutencao

Execute:

```bash
npm run validate:guidelines
```

Quando uma policy catalogada mudar, sua versao e seu hash devem ser avaliados e
atualizados no mesmo Pull Request. Uma alteracao compativel pode incrementar a
versao minor ou patch; mudanca normativa incompativel exige major nova e deve
preencher `replaces` quando substituir outra identidade ou versao.

Propriedades desconhecidas sao rejeitadas para impedir a inclusao acidental de
texto normativo no manifest.

## Bundle deterministico

Exporte um bundle novo, sem sobrescrever arquivo existente:

```bash
node scripts/governance-guidelines.cjs export --output /tmp/guideline-bundle.json
```

Valide sem escrita:

```bash
node scripts/governance-guidelines.cjs import \
  --input /tmp/guideline-bundle.json \
  --dry-run
```

Para materializar, informe um diretorio existente, externo ao repositorio,
vazio e que nao seja symlink:

```bash
node scripts/governance-guidelines.cjs import \
  --input /tmp/guideline-bundle.json \
  --output-dir /tmp/guidelines-import
```

O bundle `guideline-bundle-v1` nao possui timestamp. Catalogo, documentos e
ordem sao deterministas; cada conteudo e conferido contra o hash do manifest
antes de qualquer escrita.
