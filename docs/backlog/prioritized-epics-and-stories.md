# Backlog Priorizado: Epicos, Historias e Requisitos

## Como usar este documento

Cada epico abaixo pode virar uma issue do tipo `Epic` no GitHub. As historias associadas devem virar issues menores, vinculadas ao epico correspondente no board.

## Epic 1: Fundacao de engenharia

### Objetivo

Criar os trilhos minimos de qualidade e previsibilidade para evolucao do produto.

### Historia 1.1

**Titulo**
Definir padrao de ambiente de desenvolvimento e comandos oficiais do projeto

**Descricao**
Como time de engenharia, queremos um ambiente padrao de desenvolvimento para que qualquer contribuinte consiga instalar, executar, validar e evoluir o projeto sem depender de conhecimento tacito.

**Requisitos**

- definir runtime e gerenciador de pacotes oficiais
- expor comandos padrao para desenvolvimento, build e teste
- documentar setup local

**Criterios de aceite**

- existe um fluxo unico e documentado para subir o projeto localmente
- os comandos oficiais funcionam em ambiente limpo
- o repositorio deixa clara a stack operacional adotada

### Historia 1.2

**Titulo**
Adicionar validacao automatica de estilo e qualidade

**Descricao**
Como time de engenharia, queremos automacao de convencoes para reduzir divergencia manual, facilitar revisao e manter o codigo consistente.

**Requisitos**

- lint automatizado
- formatacao padronizada
- regras minimas de qualidade no CI
- governanca minima de Pull Requests em `develop` e `main`

**Criterios de aceite**

- alteracoes fora do padrao sao identificadas automaticamente
- o pipeline falha quando convencoes obrigatorias sao quebradas

### Historia 1.4

**Titulo**
Definir e aplicar estrategia inicial de branching e protecao de branches

**Descricao**
Como time de engenharia, queremos uma estrategia simples de branching com protecao nas branches principais para evoluir o produto com menor risco e maior controle operacional.

**Requisitos**

- definir `main` como branch de producao
- definir `develop` como branch de integracao
- padronizar nomes de branches temporarias
- exigir aprovacao manual em Pull Requests para `main` e `develop`

**Criterios de aceite**

- a estrategia de branching esta documentada no repositorio
- `main` e `develop` nao aceitam evolucao direta sem revisao
- existe validacao automatica minima sobre a politica de branches

### Historia 1.3

**Titulo**
Criar suite inicial de testes para regras criticas

**Descricao**
Como arquitetura, queremos proteger as regras centrais do quiz com testes automatizados para reduzir regressao durante modularizacao.

**Requisitos**

- cobrir calculo de nota
- cobrir selecao de questoes
- cobrir fluxo de resposta e encerramento

**Criterios de aceite**

- existe suite automatizada executavel localmente e no CI
- regras de dominio prioritarias possuem cobertura inicial

## Epic 2: Modularizacao arquitetural

### Objetivo

Separar responsabilidades hoje concentradas em arquivos globais e views.

### Historia 2.1

**Titulo**
Extrair casos de uso do quiz para camada de aplicacao

**Descricao**
Como engenharia, queremos centralizar regras de negocio em casos de uso para que a interface nao precise decidir comportamento critico.

**Requisitos**

- criar casos de uso para iniciar, responder e finalizar quiz
- impedir que views alterem regras de negocio diretamente

**Criterios de aceite**

- a interface apenas dispara acoes e renderiza estado
- regras centrais podem ser testadas sem DOM

### Historia 2.2

**Titulo**
Substituir estado global implicito por store previsivel

**Descricao**
Como arquitetura, queremos uma gestao de estado rastreavel para tornar comportamento e depuracao previsiveis.

**Requisitos**

- definir modelo de estado
- registrar transicoes por acoes explicitas
- remover mutacoes acidentais de estruturas compartilhadas

**Criterios de aceite**

- toda mudanca relevante de estado passa por ponto conhecido
- o fluxo de sessao pode ser reproduzido em testes

### Historia 2.3

**Titulo**
Remover dependencia de ordem manual de scripts

**Descricao**
Como engenharia, queremos um mecanismo de modulos ou build que torne dependencias explicitas e elimine fragilidade de bootstrap.

**Requisitos**

- definir estrategia oficial de modularizacao
- garantir inicializacao deterministica

**Criterios de aceite**

- a aplicacao nao depende mais de ordem fragil em HTML para funcionar

## Epic 3: Governanca de conteudo

### Objetivo

Transformar o conteudo em um ativo escalavel e auditavel.

### Historia 3.1

**Titulo**
Definir schema formal para questoes e metadados

**Descricao**
Como operacao editorial, queremos um contrato de conteudo para impedir inconsistencias e permitir automacao.

**Requisitos**

- schema obrigatorio para questoes
- schema para materias e topicos
- identificadores unicos

**Criterios de aceite**

- conteudo invalido e rejeitado automaticamente
- o contrato e versionado e documentado

### Historia 3.2

**Titulo**
Separar conteudo de implementacao de interface

**Descricao**
Como produto, queremos evoluir o banco de questoes sem aumentar acoplamento ao frontend.

**Requisitos**

- reorganizar estrutura de armazenamento de conteudo
- permitir carregamento por provider

**Criterios de aceite**

- adicionar novas questoes exige menor contato com codigo de interface

### Historia 3.3

**Titulo**
Adicionar metadados pedagogicos e operacionais

**Descricao**
Como negocio, queremos qualificar o conteudo por dificuldade, habilidade e estado de revisao para suportar curadoria e analytics.

**Requisitos**

- dificuldade
- habilidade
- status de revisao
- versao

**Criterios de aceite**

- o conteudo pode ser filtrado e auditado por metadados

## Epic 4: Persistencia e analytics

### Objetivo

Preparar a plataforma para dados confiaveis e backend futuro.

### Historia 4.1

**Titulo**
Criar contrato de repositorio para historico e configuracoes

**Descricao**
Como arquitetura, queremos desacoplar regras de persistencia da implementacao atual em navegador.

**Requisitos**

- interface de repositorio
- implementacao local inicial
- compatibilidade com provider remoto futuro

**Criterios de aceite**

- o fluxo funcional nao depende diretamente de `localStorage`

### Historia 4.2

**Titulo**
Versionar schema de historico e sessao

**Descricao**
Como produto, queremos permitir evolucao de dados sem quebrar usuarios existentes.

**Requisitos**

- campo de versao
- estrategia de migracao
- comportamento seguro para dados legados

**Criterios de aceite**

- mudancas de schema nao invalidam historico sem tratamento controlado

### Historia 4.3

**Titulo**
Definir mapa de eventos de produto

**Descricao**
Como negocio, queremos medir funil de uso, retenção e qualidade do conteudo de forma consistente.

**Requisitos**

- eventos de inicio, resposta, finalizacao e abandono
- nomenclatura padronizada
- estrategia de privacidade

**Criterios de aceite**

- os eventos possuem contrato tecnico e objetivo de negocio claro

## Epic 5: Seguranca e acessibilidade

### Objetivo

Elevar a aplicacao ao patamar minimo de uso responsavel.

### Historia 5.1

**Titulo**
Reduzir superficie de renderizacao insegura

**Descricao**
Como arquitetura, queremos controlar pontos de injecao HTML para viabilizar crescimento seguro do conteudo.

**Requisitos**

- mapear usos de `innerHTML`
- definir estrategia de sanitizacao ou substituicao

**Criterios de aceite**

- pontos criticos de renderizacao possuem tratamento definido

### Historia 5.2

**Titulo**
Estabelecer baseline de acessibilidade

**Descricao**
Como produto educacional, queremos experiencia acessivel para ampliar uso real e reduzir risco de exclusao.

**Requisitos**

- navegacao por teclado
- foco visivel
- semantica e leitura assistiva
- contraste auditado

**Criterios de aceite**

- fluxos principais podem ser executados sem mouse
- existe checklist minimo de acessibilidade

### Historia 5.3

**Titulo**
Preparar monitoramento de erros e operacao

**Descricao**
Como operacao, queremos visibilidade sobre falhas em producao para responder rapidamente a incidentes.

**Requisitos**

- rastreamento de erro
- identificacao de versao publicada
- checklist de release

**Criterios de aceite**

- falhas relevantes sao detectaveis apos deploy

## Epic 6: Prontidao comercial

### Objetivo

Preparar a base para comercializacao sem antecipar implementacoes complexas desnecessariamente.

### Historia 6.1

**Titulo**
Desenhar modelo de usuarios, perfis e permissoes

**Descricao**
Como negocio, queremos suportar aluno, responsavel, professor e administrador sem ambiguidade de acesso.

**Requisitos**

- papeis definidos
- escopo de acesso por papel
- dados visiveis por contexto

**Criterios de aceite**

- existe definicao tecnica e funcional do modelo de autorizacao

### Historia 6.2

**Titulo**
Definir estrategia para multi-tenant e branding

**Descricao**
Como negocio, queremos vender o produto para diferentes contextos sem replicar codigo.

**Requisitos**

- separar identidade visual, conteudo e configuracao por tenant
- prever isolamento logico

**Criterios de aceite**

- existe desenho tecnico que suporta variacao comercial sem fork

### Historia 6.3

**Titulo**
Definir fundacao de monetizacao e controle de features

**Descricao**
Como produto, queremos preparar planos e restricoes de acesso futuras sem acoplamento prematuro.

**Requisitos**

- definir modulos gratuitos e pagos
- prever feature flags ou entitlement model

**Criterios de aceite**

- o desenho tecnico permite evolucao para planos sem reestruturar o produto inteiro
