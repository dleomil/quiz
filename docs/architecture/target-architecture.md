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
- ausencia de toolchain formal, testes automatizados e CI

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
