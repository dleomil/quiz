# Correção de Segurança do brace-expansion

## Contexto

O Dependabot identificou uma vulnerabilidade de negação de serviço na versão
5.0.6 de `brace-expansion`. A dependência é transitiva e pertence à cadeia de
ferramentas de desenvolvimento `eslint > minimatch > brace-expansion`; ela não
é carregada pelo aplicativo entregue aos alunos.

Issue relacionada: `#121`.

## Escopo

- atualizar a resolução transitiva para a versão corrigida 5.0.9;
- manter as dependências diretas e o código da aplicação inalterados;
- validar a consistência do lockfile e a regressão completa;
- confirmar o encerramento do alerta Dependabot após o merge.

## Não objetivos

- atualizar outras dependências;
- alterar a configuração do ESLint;
- modificar conteúdo curricular, interface ou comportamento em produção;
- adicionar ferramenta externa de segurança.

## Critérios de aceite

- `npm ls brace-expansion` resolve a versão 5.0.7 ou superior corrigida;
- `npm audit` não reporta a vulnerabilidade relacionada;
- `package.json` permanece inalterado;
- lint, formatação e suíte completa passam;
- o PR contém somente lockfile, spec e evidências necessárias;
- o alerta Dependabot número 1 é encerrado após a integração.

## Validação

- executar `npm ls brace-expansion minimatch eslint --all`;
- executar `npm audit`;
- executar `npm run lint` e `npm run format:check`;
- executar `npm test`;
- revisar o diff do lockfile para confirmar a atualização mínima.

## Risco e rollback

O risco é baixo e restrito ao tooling de desenvolvimento. O rollback consiste
em reverter o commit pelo fluxo normal de PR. Não existe migração de dados nem
alteração no aplicativo publicado.
