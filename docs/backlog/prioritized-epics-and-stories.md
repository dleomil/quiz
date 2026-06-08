# Backlog Priorizado: Epicos, Historias e Requisitos

## Como usar este documento

Cada epico abaixo pode virar uma issue do tipo `Epic` no GitHub. As historias associadas devem virar issues menores, vinculadas ao epico correspondente no board.

## Ordem sugerida de refinamento imediato

Para a fase atual, com producao ativa e janela de risco baixa, a sequencia recomendada e:

1. `#33` Mapear limites atuais da Vercel e gatilhos de permanencia
1. `#34` Definir criterios de migracao e plano de saida da Vercel
1. `#31` Mapear personas e escopos do painel de controle
1. `#32` Definir arquitetura funcional do painel de controle

Essa ordem prioriza definicao de infraestrutura e reduz chance de retrabalho antes de detalhar o painel.

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

**Plano de validacao**

- executar `npm run lint` em ambiente limpo
- executar `npm run format:check` em ambiente limpo
- validar que o workflow de PR falha quando uma convencao obrigatoria e quebrada

**Evidencias esperadas**

- saída verde de `npm run lint`
- saída verde de `npm run format:check`
- workflow de PR com status de qualidade visivel no GitHub

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

### Historia 5.4

**Titulo**
Ajustar modo escuro para legibilidade infantil

**Descricao**
Como crianca, queremos ler perguntas, respostas e feedback com facilidade no modo escuro para que a experiencia fique confortavel e clara em qualquer tema.

**Requisitos**

- garantir contraste adequado para perguntas, respostas e feedback
- explicitar cores de texto em componentes que hoje herdam cor padrao do navegador
- revisar tamanhos, espacamento e hierarquia visual das opcoes
- manter a interface amigavel para criancas sem perder legibilidade
- prever validacao visual em mobile e desktop antes de publicar

**Criterios de aceite**

- perguntas e respostas ficam legiveis no modo escuro
- nenhum texto principal aparece preto sobre fundo escuro
- o layout continua apropriado para criancas e nao fica visualmente pesado
- existe plano de teste de regressao visual antes do deploy

**Tarefas iniciais**

- ajustar tokens de cor e superficies do dark mode
- revisar estilos de perguntas, respostas e feedback
- validar contraste e legibilidade em mobile e desktop
- executar regressao visual antes de publicar em producao

### Historia 5.5

**Titulo**
Aprimorar feedback com explicacao de acerto e erro

**Descricao**
Como crianca, queremos entender por que uma resposta esta certa ou errada logo apos responder para transformar o quiz em aprendizado imediato.

**Requisitos**

- exibir explicacao curta apos a resposta
- explicar por que a alternativa correta esta certa
- explicar por que a alternativa escolhida esta errada quando aplicavel
- manter linguagem simples e adequada para criancas
- preservar clareza visual no modo claro e no modo escuro

**Criterios de aceite**

- toda resposta mostra feedback pedagogico apos a interacao
- o motivo do acerto e do erro fica claro para a crianca
- o feedback nao interrompe o fluxo do quiz
- a leitura continua adequada em mobile e desktop

**Tarefas iniciais**

- definir padrao de texto para acerto, erro e explicacao
- ajustar renderizacao do feedback por resposta
- validar compreensao do feedback com leitura simples
- testar o comportamento em modo claro e escuro

### Historia 5.6

**Titulo**
Reforcar higiene de arquivos sensiveis e configuracoes locais

**Descricao**
Como time de engenharia, queremos reduzir a chance de vazamento acidental de segredos, arquivos temporarios e configuracoes locais para manter o repositório seguro e previsivel.

**Requisitos**

- revisar a lista de arquivos ignorados
- cobrir arquivos de ambiente e configuracoes locais
- evitar o versionamento acidental de artefatos sensiveis

**Criterios de aceite**

- o repositorio ignora arquivos sensiveis comuns e artefatos locais relevantes
- existe um padrão claro para arquivos de ambiente nao versionados
- a revisao nao expõe nenhum segredo real no backlog

### Historia 5.7

**Titulo**
Endurecer superficie de renderizacao e confiabilidade de terceiros

**Descricao**
Como arquitetura, queremos reduzir vetores de risco relacionados a renderizacao dinamica, dependencias externas e headers de seguranca para proteger a aplicacao em producao.

**Requisitos**

- revisar pontos de renderizacao dinamica
- avaliar a necessidade de headers adicionais
- revisar dependencias externas e a forma de carregamento

**Criterios de aceite**

- existe um plano para reduzir a superficie insegura de renderizacao
- existe uma recomendacao objetiva para dependencias e carregamento externo
- a proposta preserva a experiencia atual sem expor detalhes sensiveis

### Historia 5.8

**Titulo**
Adicionar varredura automatica de segredos no fluxo de PR

**Descricao**
Como time de engenharia, queremos um mecanismo automatizado para detectar possiveis segredos antes do merge, reduzindo o risco de exposicao acidental no repositório.

**Requisitos**

- definir uma verificacao automatica de segredos no CI
- integrar a verificacao ao fluxo de PR
- evitar falsos positivos excessivos sem perder cobertura util

**Criterios de aceite**

- o fluxo de PR possui uma checagem automatica de segredos
- o resultado da checagem e visivel antes do merge
- a verificacao nao exige expor dados sensiveis nos cards

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

## Epic 7: Painel de controle e operacao

### Objetivo

Entregar um painel central para clientes gerenciarem a propria operacao e para os donos do produto acompanharem, controlarem e administrarem tudo o que esta sendo executado pelos clientes.

### Contexto

Esta capacidade eh critica para a comercializacao futura porque precisa existir uma forma clara de administrar contas, usos, conteudos, acessos e evolucao por cliente.

### Escopo inicial

- visao consolidada de operacao por cliente
- gestao de acessos e perfis administrativos
- visibilidade de conteudo, uso e progresso
- pontos de controle para administracao do produto

### Critérios de aceite

- existe um desenho funcional claro para o painel
- o escopo separa o que eh visao do cliente e o que eh visao do dono do produto
- o painel pode evoluir em historias pequenas sem reescrita estrutural

### Historia 7.1

**Titulo**
Mapear personas e escopos do painel de controle

**Descricao**
Como produto, queremos definir com clareza quais pessoas usam o painel e quais permissões cada perfil precisa ter para evitar ambiguidade futura.

**Requisitos**

- identificar perfis principais do painel
- separar visao do cliente e visao do dono do produto
- listar permissoes de leitura e acao por perfil

**Criterios de aceite**

- existe um mapa funcional de perfis e responsabilidades
- o escopo do painel nao mistura operacao do cliente com administracao do produto

### Historia 7.2

**Titulo**
Definir arquitetura funcional do painel de controle

**Descricao**
Como produto, queremos desenhar a estrutura de telas, secoes e fluxos do painel antes de qualquer implementacao para minimizar retrabalho.

**Requisitos**

- definir secoes principais do painel
- definir fluxos de navegacao essenciais
- listar dados visiveis por area do painel

**Criterios de aceite**

- existe um desenho funcional do painel que pode ser executado em historias pequenas
- nao existe dependencia de implementacao para validar o escopo

## Epic 8: Estrategia de infraestrutura e migracao

### Objetivo

Mapear ate onde a Vercel gratuita sustenta o produto e quais limites, custos e necessidades operacionais exigem migracao parcial ou total da infraestrutura.

### Contexto

Hoje o app esta hospedado na Vercel no plano gratuito. Isso deve continuar no curto prazo, mas precisa existir um plano claro de saida quando o produto crescer em uso, complexidade ou exigencias comerciais.

### Escopo inicial

- limites da Vercel relevantes para o produto
- gatilhos objetivos de migracao
- diferenca entre sustentar na Vercel e sair dela
- mapa de componentes que podem permanecer ou mudar

### Critérios de aceite

- existe uma lista objetiva de limites e sinais de alerta
- existe uma definicao clara de quando a Vercel continua suficiente
- existe um criterio claro de quando a infraestrutura precisa mudar

### Historia 8.1

**Titulo**
Mapear limites atuais da Vercel e gatilhos de permanencia

**Versao pronta para issue**
Como plataforma, queremos mapear os limites atuais da Vercel gratuita e definir quais sinais indicam que o produto ainda pode permanecer nela com seguranca operacional.

**Descricao**
Como plataforma, queremos documentar ate onde a Vercel gratuita sustenta o produto e quais sinais indicam que ainda podemos permanecer nela sem risco relevante.

**Requisitos**

- listar limites relevantes da conta gratuita
- relacionar limites com o uso esperado do produto
- separar limites tecnicos, operacionais e comerciais
- indicar quais limites sao criticos e quais sao apenas de acompanhamento
- registrar a fonte de cada limite considerado
- definir qual sinal exige reavaliacao imediata da plataforma

**Criterios de aceite**

- existe uma tabela com limite, impacto, risco e decisao recomendada
- existe uma conclusao objetiva sobre quando a Vercel ainda e suficiente
- a definicao pode ser revisada sem alterar o app em producao
- a recomendacao final cabe em uma decisao: manter, monitorar ou reavaliar migracao

**Plano de validacao**

- revisar a lista de limites oficiais da Vercel para o plano atual
- confrontar cada limite com o uso real esperado do produto
- validar se a conclusao nao exige alteracao de codigo

**Evidencias esperadas**

- tabela consolidada com limite, fonte, impacto, risco e decisao
- resumo executivo com a recomendacao final
- registro de que o trabalho foi concluido sem impacto em producao

### Historia 8.2

**Titulo**
Definir criterios de migracao e plano de saida da Vercel

**Versao pronta para issue**
Como plataforma, queremos definir quando a infraestrutura precisa sair da Vercel e qual seria a ordem de migracao de menor impacto para o produto.

**Descricao**
Como plataforma, queremos deixar claro quando a infraestrutura precisa mudar e qual ordem de migracao faz menos impacto no produto.

**Requisitos**

- definir gatilhos objetivos de migracao
- definir o que permanece e o que migra primeiro
- definir sequencia de migracao por camadas ou componentes
- apontar o que pode permanecer na Vercel por mais tempo
- indicar o que seria migrado primeiro caso a saida aconteca
- registrar os riscos de uma migracao parcial e de uma migracao total
- estabelecer criterios de decisao para mudar ou nao mudar

**Criterios de aceite**

- existe um criterio de saida da Vercel documentado
- existe uma ordem preliminar de migracao por camada ou componente
- existe uma recomendacao de estrategia: permanecer, migrar parcialmente ou sair totalmente
- existe uma sequencia de decisao que preserva producao durante a transicao
- a proposta nao depende de implementacao imediata para existir
- o resultado final pode ser usado como base de decisao executiva

**Plano de validacao**

- simular diferentes cenarios de crescimento para identificar gatilhos de saida
- revisar a ordem de migracao buscando menor impacto operacional
- validar se a proposta consegue ser usada antes de qualquer mudanca tecnica

**Evidencias esperadas**

- roteiro de migracao por camada ou componente
- matriz de risco para migracao parcial e total
- decisao clara sobre permanencia, migracao parcial ou saida
