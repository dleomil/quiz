# Plano por Fases do Painel de Controle

## Objetivo

Quebrar a entrega do painel em fases pequenas, sustentaveis e com dependencias explicitas para evitar retrabalho estrutural e risco em producao.

## Situacao atual

As definicoes base ja estao concluidas:

- `#31` definiu perfis, papeis e escopos
- `#32` definiu a arquitetura funcional do painel

Isso significa que o painel ja tem forma conceitual, mas ainda nao deve ser tratado como pronto para uso comercial.

## Premissas ainda nao atendidas para producao

- autenticacao e autorizacao reais
- persistencia fora do navegador para o painel
- fonte de dados estavel para conteudo, uso e operacao
- trilha de auditoria
- separacao concreta entre cliente, professor, responsavel e dono do produto em runtime
- observabilidade e suporte minimo

## Fases sugeridas

### Fase P1: Painel base isolado

**Objetivo**

Criar uma superficie inicial do painel sem alterar o quiz existente.

**Escopo**

- rota ou subarea separada para o painel
- shell visual com navegacao principal
- visoes somente leitura ou com dados mockados
- pontos de entrada claros para perfis

**Nao objetivos**

- nao escrever dados reais
- nao expor administracao sensivel
- nao acoplar o painel ao fluxo principal do quiz

**Entrega esperada**

- painel navegavel com estrutura base
- separacao clara do app atual

### Fase P2: Identidade e acesso

**Objetivo**

Preparar o acesso por perfil sem liberar a operacao completa.

**Escopo**

- login ou identificacao de usuario
- reconhecimento de perfil
- visibilidade por papel
- bloqueio de areas nao permitidas

**Dependencias**

- autenticacao
- autorizacao
- mapeamento de perfis ja definido

**Entrega esperada**

- acesso segregado por perfil
- areas do painel protegidas por regra

### Fase P3: Dados e integracoes

**Objetivo**

Conectar o painel a dados reais sem misturar contratacao, operacao e conteudo.

**Escopo**

- leitura de dados de uso e conteudo
- leitura de historico e desempenho
- contratos de dados por area
- providers separados por dominio

**Dependencias**

- persistencia fora do navegador
- contratos tecnicos de dados
- definicao de ownership por dominio

**Entrega esperada**

- painel consumindo dados reais de forma controlada

### Fase P4: Operacao e administracao

**Objetivo**

Liberar a parte operacional e administrativa do painel com rastreabilidade.

**Escopo**

- acao administrativa por perfil
- suporte e gestao de contas
- registro de eventos e auditoria
- separacao entre operacao do cliente e administracao do produto

**Dependencias**

- trilha de auditoria
- controle de acesso maduro
- dados confiaveis

**Entrega esperada**

- superficie operacional util para clientes e para o dono do produto

### Fase P5: Hardening e publicacao

**Objetivo**

Garantir que o painel possa ser colocado em producao com risco controlado.

**Escopo**

- revisao de seguranca
- acessibilidade
- observabilidade
- testes de regressao
- estrategia de rollback

**Entrega esperada**

- painel pronto para rollout gradual
- criterios de saida e rollback claros

## Ordem recomendada

1. Base isolada
2. Identidade e acesso
3. Dados e integracoes
4. Operacao e administracao
5. Hardening e publicacao

## Regra de execucao

Nenhuma fase deve ser executada fora de ordem sem motivo de negocio explicito e sem as dependencias minimas atendidas.
