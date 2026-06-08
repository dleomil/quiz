# Roadmap de Evolucao por Fases

## Objetivo

Definir a sequencia recomendada de evolucao para transformar o projeto em um produto robusto e comercializavel, com entregas pequenas e sustentaveis.

## Criterios de priorizacao

- reduzir risco estrutural primeiro
- criar trilhos de engenharia antes de expandir funcionalidade
- separar conteudo, regra de negocio e persistencia cedo
- adiar complexidade comercial ate existir base operacional confiavel

## Ordem imediata sugerida

No ciclo atual, com o app em producao e sem margem para impacto funcional, a prioridade pratica e:

1. Fase 8: mapear limites da Vercel e definir criterios de migracao
1. Fase 7: refinar personas e escopo do painel de controle

Essa ordem evita decidir produto sem antes entender a permanencia da infraestrutura atual.

## Fase 1: Fundamentos de engenharia

### Resultado esperado

Criar o baseline de desenvolvimento, qualidade e governanca tecnica.

### Entregas esperadas

- padronizacao de ambiente e scripts
- lint, formatacao e convencoes de contribuicao
- testes automatizados iniciais
- pipeline de CI para validacao obrigatoria
- estrutura de documentacao viva
- status checks obrigatorios para PRs
- feedback rapido de qualidade em cada alteracao

### Riscos mitigados

- regressao silenciosa
- dependencia excessiva de conhecimento tacito
- baixa previsibilidade de entrega

## Fase 2: Modularizacao do frontend

### Resultado esperado

Separar fluxo, estado, regras e apresentacao sem alterar o comportamento de negocio.

### Entregas esperadas

- casos de uso explicitos
- store previsivel
- modulos com fronteiras claras
- remocao progressiva de dependencias globais

### Riscos mitigados

- acoplamento alto
- dificuldade de teste
- refactor custoso

## Fase 3: Governanca de conteudo

### Resultado esperado

Transformar o banco de questoes em ativo operavel com validacao e rastreabilidade.

### Entregas esperadas

- schema de conteudo
- validacao automatica de questoes
- padrao editorial
- metadados pedagogicos e de revisao

### Riscos mitigados

- inconsistencias no conteudo
- erro humano em expansao curricular
- baixa auditabilidade

## Fase 4: Persistencia e dados de produto

### Resultado esperado

Preparar a aplicacao para historico confiavel, analytics e backend futuro.

### Entregas esperadas

- repositorios abstratos
- schema versionado de sessao e historico
- estrategia de migracao de dados
- eventos de produto padronizados

### Riscos mitigados

- perda de dados
- retrabalho na entrada de backend
- incapacidade de medir uso e valor

## Fase 5: Seguranca, acessibilidade e operacao

### Resultado esperado

Estabelecer padrao minimo para uso real e crescimento sustentavel.

### Entregas esperadas

- revisao de seguranca frontend
- higiene de arquivos sensiveis e configuracoes locais
- endurecimento da superficie de renderizacao
- revisao de dependencias externas e headers
- varredura automatica de segredos no fluxo de PR
- baseline de acessibilidade
- ajuste de legibilidade do modo escuro
- monitoramento e rastreamento de erros
- checklist de release

### Riscos mitigados

- incidente em producao
- baixa inclusao
- operacao fragil

## Fase 6: Prontidao comercial

### Resultado esperado

Preparar a base para usuarios, contas, perfis e monetizacao.

### Entregas esperadas

- desenho de identidade e papeis
- suporte a multiusuario
- preparacao para multi-tenant
- controle de acesso por feature
- fundacao para planos e cobranca

### Riscos mitigados

- bloqueio de crescimento comercial
- arquitetura inadequada para SaaS
- custo alto de pivote estrutural

## Fase 7: Painel de controle e operacao

### Resultado esperado

Entregar um painel central para clientes gerenciarem a operacao da propria conta e para os donos do produto acompanharem e administrarem tudo o que esta sendo executado pelos clientes.

### Entregas esperadas

- painel administrativo unificado
- visao de clientes, uso, conteudo e operacao
- acoes de gerenciamento por perfil e permissao
- trilha inicial para supervisao do produto e dos clientes

### Riscos mitigados

- falta de controle operacional
- baixa visibilidade para clientes contratantes
- dificuldade de administracao em escala

## Fase 8: Estrategia de infraestrutura e migracao

### Resultado esperado

Definir ate onde a Vercel gratuita sustenta o produto e quais limites, custos e necessidades operacionais exigem migracao parcial ou total de infraestrutura.

### Entregas esperadas

- mapa de limites e gatilhos de crescimento
- criterios objetivos para permanencia ou saida da Vercel
- plano de migracao por camada, se necessario
- avaliacao de custo, risco e operacao

### Riscos mitigados

- surpresa com limites de plataforma
- crescimento sem planejamento de infraestrutura
- migracao tardia e cara

## Regra de execucao

Nenhuma fase deve ser tratada como reescrita completa. A execucao ideal e por historias pequenas, independentes quando possivel, e sempre com criterio claro de pronto.
