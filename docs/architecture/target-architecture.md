# Arquitetura Alvo e Definicoes Tecnicas

## Objetivo arquitetural

Definir a arquitetura de referencia para que o projeto evolua de MVP estatico para produto comercializavel, preservando entregas incrementais e reduzindo risco de retrabalho estrutural.

## Diagnostico tecnico atual

O projeto atual possui as seguintes caracteristicas:

- carregamento manual de scripts e dependencia de ordem de execucao
- estado global mutavel compartilhado
- logica de negocio misturada com renderizacao e eventos de interface
- conteudo acoplado ao codigo fonte
- persistencia restrita a `localStorage`
- toolchain incremental com npm, lint, formatter, testes automatizados e CI,
  ainda sem build empacotado ou separacao completa de camadas

## Arquitetura alvo

O sistema deve evoluir para cinco camadas explicitas:

1. `domain`
   Responsavel pelas entidades, regras de negocio e invariantes do quiz.

2. `application`
   Responsavel pelos casos de uso, orquestracao de fluxo e contratos entre UI e dominio.

3. `infra`
   Responsavel por persistencia, analytics, integracoes externas, carregamento de conteudo e adaptadores.

4. `ui`
   Responsavel por renderizacao, eventos, navegacao e apresentacao.

5. `content`
   Responsavel por armazenar e versionar o banco de questoes e seus metadados sob schema validado.

## Fronteiras obrigatorias

### Dominio

Deve conter regras como:

- composicao de sessao de quiz
- validacao de resposta
- calculo de nota
- regras de tempo por questao
- consolidacao de historico

O dominio nao deve depender de DOM, browser APIs ou componentes visuais.

### Aplicacao

Deve expor casos de uso como:

- iniciar quiz
- responder pergunta
- avancar sessao
- finalizar quiz
- registrar historico
- exportar resultado

### Infraestrutura

Deve permitir substituicao progressiva de implementacoes:

- `LocalHistoryRepository`
- `RemoteHistoryRepository`
- `StaticContentProvider`
- `ApiContentProvider`
- `AnalyticsAdapter`

### UI

Deve apenas consumir estado e emitir acoes. Nenhuma regra critica de negocio deve ficar acoplada a templates HTML ou listeners.

## Contratos tecnicos esperados

### Contrato de questao

O contrato operacional, incluindo catalogo trimestral, compatibilidade do acervo legado e sessoes versionadas, esta definido em `docs/specs/content-schema-v1.md`.

Cada questao deve possuir no minimo:

- `id`
- `subject`
- `topic`
- `question`
- `options`
- `correctIndex`
- `explanation`

Campos futuros previstos:

- `difficulty`
- `grade`
- `skills`
- `source`
- `reviewStatus`
- `version`
- `tags`

### Contrato de sessao de quiz

Cada sessao deve possuir no minimo:

- `sessionId`
- `startedAt`
- `finishedAt`
- `subject`
- `topic`
- `questionIds`
- `answers`
- `score`
- `durationSec`

### Contrato de historico

O historico deve ser versionado e migravel. Nenhum formato persistido deve depender implicitamente de labels de interface.

Sessoes novas devem referenciar `contentSetId`, versao do acervo e `questionIds`. Sessoes existentes sem essa evidencia permanecem como acervo legado, sem trimestre inferido.

## Requisitos nao funcionais

### Confiabilidade

- fluxos criticos cobertos por testes automatizados
- build reprodutivel
- rollback simples

### Seguranca

- politica de dependencias definida
- superficie de `innerHTML` reduzida ou sanitizada
- CSP planejada
- protecao de dados pessoais prevista desde o design

### Observabilidade

- eventos de uso padronizados
- rastreamento de erros em producao
- metricas de conversao e engajamento

### Manutenibilidade

- modulos pequenos e com responsabilidade unica
- convencoes automatizadas por lint e formatter
- decisoes arquiteturais registradas

## Decisoes estrategicas

1. Nao reescrever tudo agora.
   Priorizar modularizacao incremental sobre migracao ampla de stack.

2. Separar conteudo de regra de negocio o quanto antes.
   Esse ponto reduz o principal risco de escala operacional.

3. Desacoplar persistencia antes de introduzir backend.
   Isso evita reescrever o fluxo funcional quando a camada remota surgir.

4. Fazer do board um reflexo da arquitetura.
   As issues do GitHub devem nascer a partir de epicos e historias alinhados a essas fronteiras.

## Superficies de produto e monorepo mobile

A trilha mobile proposta adiciona iOS e Android sem substituir nem reescrever o
site estatico. O app fica em `apps/mobile` com React Native/Expo; um pacote
`packages/quiz-content` so passa a ser fonte compartilhada depois de uma
extracao testada contra o conteudo publicado atual. A decisao detalhada e os
controles estao em `docs/architecture/mobile-app-monorepo-adr.md`.

O workspace pode compartilhar conteudo validado e regras puras, mas nao UI,
APIs do navegador, persistencia local ou cobranca. Web e mobile conservam
adaptadores e pipelines de release distintos. A configuracao Vercel deve
continuar publicando somente o site; o preview deve provar que fontes e builds
moveis nao entram no artefato web.

O MVP mobile usa persistencia local e compra por loja sem identidade remota.
Sincronizacao, contas familiares e dados escolares exigem uma decisao posterior
de identidade, backend, privacidade e retencao; nao sao pressupostos desta
arquitetura.
