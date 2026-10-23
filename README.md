# Quiz Etapa

Aplicacao web de quiz educativo para criancas do 3º ano do Ensino Fundamental. O projeto oferece pratica por materia e assunto, feedback imediato, explicacoes e historico local de desempenho.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-F59E0B)
![HTML](https://img.shields.io/badge/HTML5-estrutura-E34F26)
![CSS](https://img.shields.io/badge/CSS3-estilo-1572B6)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E)
![Deploy](https://img.shields.io/badge/deploy-vercel-000000)

## Produto

O quiz contem seis materias: **Portugues, Matematica, Ciencias, Geografia, Historia e Ingles**. O estudante escolhe um acervo publicado por ano e trimestre, depois seleciona uma materia e um assunto. O catalogo do codigo marca 2026 T3 como acervo atual; o que esta em producao depende do conteudo promovido a `main`. A disponibilidade de temas varia conforme o acervo.

Em Ingles, os conjuntos com apoio bilingue mostram uma traducao em portugues do enunciado para ajudar a crianca a compreender a pergunta. O estudante tambem pode:

- personalizar a quantidade ate o total disponivel no tema; quando ha duas ou mais questoes, o intervalo comeca em 2 e a sugestao inicial e ate 30;
- usar os atalhos de 2, 10, 20 questoes ou todas as disponiveis, quando couberem;
- alternar entre os temas claro e escuro;
- acompanhar o progresso, receber feedback, revisar o gabarito e consultar historico salvo no navegador.

Os dados da aplicacao ficam no navegador usando `localStorage`; o produto nao possui backend de usuarios ou banco de dados remoto.

## Tecnologias e estrutura

O produto usa HTML, CSS e JavaScript sem framework, Chart.js, Node.js e Vercel. Os principais arquivos estao organizados assim:

```text
.
├── .github/workflows/   # Validacoes de PR e promocao
├── config/              # Catalogos e politicas versionados
├── css/                 # Estilos, temas e layout responsivo
├── docs/                # Especificacoes, governanca e operacao
├── js/
│   ├── app.js           # Inicializacao e coordenacao da interface
│   ├── data/            # Catalogo e dados das seis materias
│   └── views/           # Telas de materia, quiz, resultado e historico
├── scripts/             # Servidor local, validadores e ferramentas editoriais
├── tests/               # Testes de conteudo, governanca e interface
├── index.html
├── package.json
└── vercel.json
```

## Desenvolvimento local

Use Node.js 24, a mesma versao configurada nos workflows do projeto, com npm. Na raiz do repositorio:

```bash
npm ci
npm run dev
```

Abra `http://127.0.0.1:3000`. `npm start` e um alias para `npm run dev`.

O pacote Playwright esta nas dependencias. Para validar os testes de interface com o Google Chrome ja instalado no computador, execute:

```bash
PLAYWRIGHT_BROWSER_CHANNEL=chrome npm run verify:local
```

Sem essa variavel, os testes usam o navegador padrao do Playwright. No CI, o workflow roda em `ubuntu-24.04` e usa o Google Chrome preinstalado na imagem; nao baixa ou instala um navegador durante a validacao.

## Testes e validacoes

`npm run verify:local` executa `npm test`, ESLint, Prettier e `git diff --check`. A suite abrange validacao de conteudo e cobertura, regressao pedagogica, contratos dos agentes, seguranca de renderizacao e testes Playwright para as experiencias de interface.

Comandos uteis:

| Comando                     | Uso                                                  |
| --------------------------- | ---------------------------------------------------- |
| `npm test`                  | Executa os testes e validadores locais do projeto    |
| `npm run verify:local`      | Executa a suite completa, lint, formato e diff check |
| `npm run lint`              | Verifica JavaScript com ESLint                       |
| `npm run format:check`      | Verifica a formatacao com Prettier                   |
| `npm run validate:content`  | Valida os dados de questoes                          |
| `npm run validate:delivery` | Verifica o contrato de entrega editorial             |
| `npm run validate:agents`   | Verifica a configuracao e capacidades dos agentes    |

Os testes usam fixtures e nao fazem chamadas reais a modelos. Execucoes reais dos agentes e publicacao editorial seguem autorizacoes e gates separados.

## Agentes e governanca editorial

Os papeis, permissoes e separacoes entre autoria e revisao ficam em `config/agent-capabilities.json` e `docs/specs/agent-capability-model.md`. Os runners protegidos ficam em `scripts/run-editorial-agent.cjs` e `scripts/run-writer-agent.cjs`; suas instrucoes, contexto, recibos e limites estao documentados em `docs/agents/` e `docs/harness/`.

Geradores e validadores ajudam a controlar o formato e as evidencias, mas nao substituem revisao pedagogica e linguistica independente, aprovacao humana aplicavel ou autorizacao de release.

## Branches e publicacao

`develop` e a branch de integracao e validacao; seu conteudo nao representa por si so uma publicacao em producao. `main` e a branch de producao. Mudancas chegam a `main` por PR separado, com os checks exigidos e autorizacao explicita de release. O deploy configurado usa Vercel; um preview de PR nao e a promocao para producao.

Consulte a [estrategia de branching e entrega](docs/github/branching-and-delivery-strategy.md) e a [avaliacao de limites da Vercel](docs/platform/vercel-limits-assessment.md).

## Documentacao e licenca

O [indice da documentacao](docs/README.md) organiza escopo do produto, especificacoes, operacao dos agentes e entrega. Documentos Markdown e seus hashes estao inventariados em `config/document-catalog.json`; para manter o catalogo, use `npm run documents:sync` e `npm run validate:documents`.

O pacote declara a licenca MIT, conforme os termos existentes em [LICENSE](LICENSE).
