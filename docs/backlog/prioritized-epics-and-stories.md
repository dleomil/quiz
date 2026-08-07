# Backlog Priorizado: Epicos, Historias e Requisitos

## Como usar este documento

Cada epico abaixo pode virar uma issue do tipo `Epic` no GitHub. As historias associadas devem virar issues menores, vinculadas ao epico correspondente no board.

## Ordem sugerida de refinamento imediato

Para a fase atual, com producao ativa e janela de risco baixa, a sequencia recomendada e:

1. `#33` Mapear limites atuais da Vercel e gatilhos de permanencia
1. `#34` Definir criterios de migracao e plano de saida da Vercel
1. `#31` Mapear personas e escopos do painel de controle
1. `#32` Definir arquitetura funcional do painel de controle

## Epic 9: Especificacao e Harness de Agentes

### Objetivo

Criar a camada de especificacao e o harness operacional para que o uso de agentes no projeto aconteca com criterio, rastreabilidade e validacao.

### Historia 9.1

**Titulo**
Definir template oficial de spec para entregas relevantes

**Descricao**
Como time, queremos um template oficial de spec para que toda entrega relevante comece com contexto, escopo, criterios de aceite e plano de validacao.

**Requisitos**

- definir formato padrao de spec
- incluir contexto, escopo, nao objetivos, requisitos, aceite, validacao e evidencia
- documentar quando a spec e obrigatoria

**Criterios de aceite**

- existe um template oficial versionado no repositorio
- o template pode ser reutilizado em issues e docs
- o texto deixa claro quando a spec e obrigatoria

### Historia 9.2

**Titulo**
Definir harness operacional para uso de agentes

**Descricao**
Como engenharia, queremos um harness operacional para limitar entradas, saidas e validacoes dos agentes antes de qualquer execucao assistida.

**Requisitos**

- definir context pack minimo
- definir limites de permissao por papel
- definir gates obrigatorios de validacao
- definir formato esperado de saida

**Criterios de aceite**

- existe um documento com regras operacionais do harness
- o documento deixa claro o que os agentes podem e nao podem fazer
- existe uma trilha minima de validacao e evidencia

### Historia 9.3

**Titulo**
Definir papeis e limites dos agentes do projeto

**Descricao**
Como time, queremos agentes com papeis complementares e limites claros para evitar autonomia excessiva e ambiguidade de responsabilidade.

**Requisitos**

- definir `Spec Agent`
- definir `Architect Agent`
- definir `Implementer Agent`
- definir `Verifier Agent`
- definir `Release and Board Agent`

**Criterios de aceite**

- cada agente tem entrada, saida e limite documentado
- o fluxo entre agentes esta descrito
- o modelo evita sobreposicao desnecessaria de responsabilidade

### Historia 9.4

**Titulo**
Conectar spec, harness e board ao fluxo de entrega

**Descricao**
Como operacao, queremos que a spec, o harness e o board trabalhem juntos para que cada entrega tenha rastreabilidade de ponta a ponta.

**Requisitos**

- conectar specs com issues
- conectar validacoes com PRs
- conectar evidencias com cards
- explicitar quando um item pode ir para review ou done

**Criterios de aceite**

- existe uma forma documentada de transformar spec em issue
- existe uma forma documentada de registrar validacao e evidencia
- o board reflete o estado real do fluxo

### Historia 9.5

**Titulo**
Pilotar fluxo spec -> harness em item de baixo risco

**Descricao**
Como time, queremos validar o fluxo de especificacao, validacao e board em um item pequeno antes de expandir o uso de agentes no projeto.

**Requisitos**

- escolher um item de baixo risco
- escrever a spec antes da implementacao
- executar validacao com evidencia
- registrar o resultado no board

**Criterios de aceite**

- existe um piloto concluido sem impacto em producao
- a spec ficou clara o suficiente para guiar a execucao
- o board refletiu o estado real do trabalho

### Historia 9.6

**Titulo**
Definir agente revisor de PRs com limites de aprovacao

**Descricao**
Como operacao, queremos um agente revisor que leia PRs, confronte com a spec e com as evidencias e devolva um parecer objetivo antes do merge, sem assumir aprovacao automatica.

**Requisitos**

- definir o que o revisor deve verificar em cada PR
- limitar o papel a revisao e recomendacao
- deixar claro quando o parecer pode ser usado e quando ainda exige revisao humana
- documentar os artefatos que alimentam a analise

**Criterios de aceite**

- existe uma definicao objetiva do papel do revisor
- o agente nao tem autonomia para aprovar ou mergear por conta propria
- o fluxo de revisao fica claro para PRs futuros
- o papel respeita a politica de branch e revisao do repositorio

**Plano de validacao**

- revisar o comportamento esperado do agente contra PRs reais
- validar que o papel nao entra em conflito com a governanca atual
- confirmar que a saida do agente e um parecer, nao um merge

**Evidencias esperadas**

- documento com escopo, limites e saida esperada
- alinhamento com a politica de aprovacao do repositorio
- exemplo de parecer padronizado para PRs

### Historia 9.7

**Titulo**
Definir matriz de decisao do Reviewer Agent

**Descricao**
Como operacao, queremos uma matriz simples para padronizar quando o Reviewer Agent devolve aprovacao, ajuste necessario ou bloqueio, sempre com base em spec, validacao, evidencia e risco.

**Requisitos**

- definir categorias de decisao
- definir sinais que levam a cada categoria
- definir formato padrao do parecer
- manter o papel sem autonomia de merge

**Criterios de aceite**

- existe uma matriz de decisao objetiva e reutilizavel
- o parecer do revisor fica curto e rastreavel
- a matriz respeita a governanca do repositorio

**Plano de validacao**

- testar a matriz contra exemplos de PR reais e hipoteticos
- verificar se a saida permanece objetiva e util
- confirmar que a matriz nao conflita com a revisao humana

**Evidencias esperadas**

- tabela de decisao por categoria
- modelo de comentario do Reviewer Agent
- referencia do fluxo operacional do revisor

### Historia 9.8

**Titulo**
Padronizar template de comentario do Reviewer Agent

**Descricao**
Como operacao, queremos um template reutilizavel para o comentario do Reviewer Agent para que o parecer seja curto, consistente e facil de registrar no PR e no board.

**Requisitos**

- definir formato curto e consistente do comentario
- manter conclusao, risco, pendencias, evidencias e proxima acao
- evitar duplicacao entre workflow e exemplo

**Criterios de aceite**

- existe um template unico e reutilizavel para parecer
- o formato facilita leitura e registro no PR
- o template permanece alinhado ao workflow do Reviewer Agent

**Plano de validacao**

- revisar consistencia entre template, workflow e decision matrix
- aplicar o template em pelo menos um PR real pequeno
- confirmar que o formato permanece curto e objetivo

**Evidencias esperadas**

- documento de template do comentario
- referencia de uso no workflow do Reviewer Agent
- comentario real em PR seguindo o template

### Historia 9.9

**Titulo**
Padronizar checklist de preflight dos agentes

**Descricao**
Como operacao, queremos um checklist de preflight unico para os agentes do projeto para que nenhuma acao de escrita, revisao ou publicacao comece sem confirmar contexto, permissao e destino corretos.

**Requisitos**

- definir checklist minimo antes de acao de escrita
- incluir fonte da verdade, taxonomia, branch, validacao e reversao
- tornar o checklist referencia obrigatoria para os agentes principais

**Criterios de aceite**

- existe um checklist unico e reutilizavel de preflight
- os agentes consultam o checklist antes de agir
- o checklist reduz erros operacionais repetidos

**Plano de validacao**

- revisar se o checklist cobre branch, labels, Project e restauracao de protecao
- validar se os agentes documentados apontam para o checklist
- aplicar o checklist em uma tarefa real pequena

**Evidencias esperadas**

- documento do checklist de preflight
- referencia do checklist nos documentos dos agentes
- uso do checklist em pelo menos um fluxo real pequeno

### Historia 9.10

**Titulo**
Definir ordem de execucao dos agentes

**Descricao**
Como operacao, queremos uma ordem de execucao explicita para os agentes do projeto para que o fluxo fique previsivel e nao dependa de interpretacao individual.

**Requisitos**

- definir quando cada agente deve ser usado
- explicitar a sequencia recomendada entre spec, arquitetura, implementacao, validacao, board e revisao
- evitar que agentes sejam acionados fora de ordem sem necessidade real

**Criterios de aceite**

- existe um documento curto com a ordem de execucao dos agentes
- o modelo operacional referencia esse documento
- a ordem reduz ambiguidade entre os papes

**Plano de validacao**

- revisar se a ordem cobre o fluxo completo de ponta a ponta
- confirmar se o documento nao contradiz o modelo operacional ou o checklist de preflight
- aplicar a ordem em um fluxo pequeno real

**Evidencias esperadas**

- documento com a ordem de execucao dos agentes
- referencia no modelo operacional
- aplicacao em um fluxo real pequeno

### Historia 9.11

**Titulo**
Consolidar manual operacional dos agentes

**Descricao**
Como operacao, queremos um manual unico de entrada para os agentes do projeto para que onboarding e consulta rapida fiquem simples sem substituir os documentos detalhados existentes.

**Requisitos**

- consolidar os pontos principais em um unico manual
- apontar para os documentos detalhados como fonte de verdade
- simplificar a navegacao entre spec, harness, preflight e revisao

**Criterios de aceite**

- existe um manual consolidado de entrada
- o manual nao substitui os documentos detalhados
- a leitura inicial do fluxo dos agentes fica mais simples

**Plano de validacao**

- revisar se o manual referencia todos os documentos relevantes
- confirmar se a consolidacao nao remove detalhes importantes
- aplicar o manual como ponto de entrada em um fluxo real pequeno

**Evidencias esperadas**

- documento consolidado do manual operacional
- referencia para os documentos detalhados
- uso do manual em um fluxo real pequeno

### Historia 9.12

**Titulo**
Consolidar aprendizados operacionais da ultima execucao

**Descricao**
Como operacao, queremos transformar os erros reais observados na ultima execucao em guardrails permanentes para que o fluxo dos agentes fique mais robusto e previsivel.

**Requisitos**

- reforcar o contrato de lint para arquivos novos de teste
- reforcar a verificacao da sintaxe dos comandos do GitHub CLI
- reforcar a coerencia entre `Status` e `Workflow` no Project
- reforcar a leitura da governanca de merge antes de tentar publicar

**Criterios de aceite**

- os erros concretos viram regras documentadas no harness
- o modelo operacional dos agentes referencia essas regras
- o fluxo futuro fica menos sujeito a repeticao dos mesmos bloqueios

**Plano de validacao**

- revisar se os novos guardrails cobrem os erros observados
- confirmar se o modelo dos agentes aponta para as regras novas
- aplicar as regras em um fluxo pequeno futuro para confirmar utilidade

**Evidencias esperadas**

- documento de lições operacionais publicado no harness
- referencias atualizadas nos docs dos agentes e do harness
- comprovacao de que os bloqueios aprendidos viraram regra

### Historia 9.12

**Titulo**
Consolidar aprendizados operacionais da ultima execucao

**Descricao**
Como operacao, queremos transformar os erros reais observados na ultima execucao em guardrails permanentes para que o fluxo dos agentes fique mais robusto e previsivel.

**Requisitos**

- reforcar o contrato de lint para arquivos novos de teste
- reforcar a verificacao da sintaxe dos comandos do GitHub CLI
- reforcar a coerencia entre `Status` e `Workflow` no Project
- reforcar a leitura da governanca de merge antes de tentar publicar

**Criterios de aceite**

- os erros concretos viram regras documentadas no harness
- o modelo operacional dos agentes referencia essas regras
- o fluxo futuro fica menos sujeito a repeticao dos mesmos bloqueios

**Plano de validacao**

- revisar se os novos guardrails cobrem os erros observados
- confirmar se o modelo dos agentes aponta para as regras novas
- aplicar as regras em um fluxo pequeno futuro para confirmar utilidade

**Evidencias esperadas**

- documento de lições operacionais publicado no harness
- referencias atualizadas nos docs dos agentes e do harness
- comprovacao de que os bloqueios aprendidos viraram regra

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

### Historia 3.4

**Titulo**
Definir governanca editorial para atualizacao curricular

**Descricao**
Como produto educacional, queremos um fluxo de curadoria e revisao pedagogica para atualizar o conteudo com rastreabilidade, linguagem correta e uma resposta inequivoca para cada questao.

**Requisitos**

- definir agentes de curadoria e qualidade pedagogica
- proteger o material-fonte da escola contra versionamento ou publicacao acidental
- exigir referencia de fonte, objetivo curricular, serie, materia, topico e versao por lote
- bloquear implementacao sem parecer pedagogico e aprovacao humana registrada

**Criterios de aceite**

- existem papeis, limites e saidas documentados para curadoria e revisao pedagogica
- existe uma politica de gates bloqueantes no harness
- nenhum fluxo permite publicar questao baseada apenas em inferencia automatizada
- a proxima atualizacao curricular pode ser especificada e auditada sem expor a fonte

**Plano de validacao**

- verificar a consistencia entre agentes, harness e fluxo de entrega
- confirmar que o diretorio de material-fonte e ignorado pelo Git
- revisar que a aprovacao humana e obrigatoria antes da implementacao

**Evidencias esperadas**

- spec de governanca curricular
- documentos dos agentes especializados
- politica de gates de qualidade
- registro de validacao de protecao do material-fonte

### Historia 3.5

**Titulo**
Implementar validador automatizado de conteudo

**Descricao**
Como engenharia, queremos validar a estrutura das questoes antes do merge para impedir que erros mecanicos cheguem ao quiz em producao.

**Requisitos**

- validar IDs unicos, campos obrigatorios, alternativas e `correctIndex`
- validar metadados de origem, revisao e versao definidos no schema formal
- bloquear opcoes vazias ou duplicadas apos normalizacao
- executar a verificacao localmente e no CI

**Criterios de aceite**

- um lote estruturalmente invalido falha antes do merge
- a validacao informa qual regra e qual questao falharam
- o validador nao substitui a aprovacao pedagogica humana

**Plano de validacao**

- criar fixtures validas e invalidas para cada regra bloqueante
- executar o validador no CI e localmente
- executar regressao do quiz com um lote valido

**Evidencias esperadas**

- teste automatizado do schema de conteudo
- resultado verde no CI para lote valido
- resultado bloqueante demonstravel para lote invalido

### Historia 3.6

**Titulo**
Pilotar atualizacao curricular com revisao humana

**Descricao**
Como produto, queremos testar o fluxo completo em um lote pequeno e aprovado pela escola para confirmar que a nova governanca protege o aprendizado sem afetar o quiz em producao.

**Requisitos**

- selecionar um objetivo curricular autorizado e um lote pequeno
- criar spec, mapa de rastreabilidade e parecer pedagogico
- registrar aprovacao humana antes da implementacao
- executar validacao estrutural e regressao visual e funcional

**Criterios de aceite**

- cada questao do piloto tem fonte, objetivo e aprovacao rastreaveis
- nao ha erro ortografico, ambiguidade conhecida ou explicacao contraditoria
- o lote entra por PR pequeno com plano de rollback

**Plano de validacao**

- aplicar todos os gates de qualidade curricular
- executar a suite automatizada e teste manual do fluxo do quiz
- revisar o conteudo exibido em modo claro e escuro, mobile e desktop

**Evidencias esperadas**

- mapa de rastreabilidade sem reproduzir a fonte protegida
- parecer e aprovacao humana registrados
- resultados da validacao automatica e regressao do quiz

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

### Historia 5.9

**Titulo**
Planejar atualizacao futura das actions para suporte a Node.js mais recente

**Descricao**
Como time de engenharia, queremos mapear a depreciação das actions atuais para preparar uma atualização futura sem alterar a estabilidade do fluxo de PR neste momento.

**Requisitos**

- registrar a deprecacao observada nas actions
- definir quando a atualizacao deve ser priorizada
- manter o fluxo atual enquanto o aviso nao for bloqueante

**Criterios de aceite**

- existe um registro claro da necessidade de atualizar as actions no futuro
- a atualizacao nao e tratada como urgente enquanto nao houver impacto funcional
- o item permanece como divida tecnica de baixo risco no backlog

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

**Versao pronta para issue**
Como produto, queremos definir com clareza quais pessoas usam o painel, quais perfis existem e quais limites cada perfil precisa respeitar para evitar ambiguidade futura.

**Descricao**
Como produto, queremos definir com clareza quais pessoas usam o painel e quais permissões cada perfil precisa ter para evitar ambiguidade futura.

**Requisitos**

- identificar perfis principais do painel
- separar visao do cliente e visao do dono do produto
- listar permissoes de leitura e acao por perfil
- consolidar a decisao em uma spec documentada

**Criterios de aceite**

- existe um mapa funcional de perfis e responsabilidades
- o escopo do painel nao mistura operacao do cliente com administracao do produto
- existe uma spec documentada que pode ser usada como base da execucao

**Plano de validacao**

- revisar os perfis propostos e confirmar que nao ha sobreposicao indevida
- validar se o mapa de responsabilidades separa uso operacional de administracao do produto

**Evidencias esperadas**

- tabela simples de perfis, responsabilidades e acessos
- decisao clara sobre o que pertence ao cliente e o que pertence ao dono do produto
- link da spec usada como base

### Historia 7.2

**Titulo**
Definir arquitetura funcional do painel de controle

**Descricao**
Como produto, queremos desenhar a estrutura de telas, secoes e fluxos do painel antes de qualquer implementacao para minimizar retrabalho.

**Versao pronta para issue**
Como produto, queremos desenhar a estrutura funcional do painel em secoes, fluxos e areas de dados antes de qualquer implementacao.

**Requisitos**

- definir secoes principais do painel
- definir fluxos de navegacao essenciais
- listar dados visiveis por area do painel
- organizar o painel em areas que possam virar historias pequenas
- separar visoes de administracao, acompanhamento e uso operacional

**Criterios de aceite**

- existe um mapa funcional de secoes do painel
- existe um fluxo basico de navegacao entre visoes principais
- existe uma lista de dados visiveis por area do painel
- o desenho funcional pode ser usado como base para historias pequenas

**Plano de validacao**

- revisar se as secoes cobrem a necessidade do produto
- validar se os fluxos essenciais ficam claros sem implementar telas
- conferir se a separacao entre administracao e operacao e coerente com a spec de perfis

**Evidencias esperadas**

- mapa funcional das secoes do painel
- fluxo basico de navegacao entre visoes principais
- lista de dados visiveis por area do painel
- link da spec `docs/specs/panel-control-functional-architecture.md`

### Historia 7.3

**Titulo**
Criar a base isolada do painel de controle

**Issue**

- #102

**Descricao**
Como produto, queremos criar uma superficie inicial do painel separada do quiz atual para validar a experiencia base sem impacto no fluxo principal.

**Versao pronta para issue**
Como produto, queremos criar uma superficie inicial do painel separada do quiz atual para validar a experiencia base sem impacto no fluxo principal.

**Requisitos**

- criar uma rota ou area isolada para o painel
- manter o quiz atual intocado
- expor apenas uma estrutura base navegavel
- evitar dependencia de dados reais nesta etapa

**Criterios de aceite**

- o painel existe como superficie separada do quiz
- nao ha impacto no fluxo principal do aluno
- a base inicial pode ser navegada sem expor administracao sensivel

**Plano de validacao**

- abrir a superficie do painel sem afetar o quiz atual
- confirmar que o fluxo principal continua operando normalmente
- verificar que a pagina base do painel carrega de forma isolada

**Evidencias esperadas**

- screenshot ou registro da superficie inicial do painel
- confirmacao de que o quiz continua funcionando sem alteracao
- link da rota ou area isolada usada como base

### Historia 7.4

**Titulo**
Definir a navegacao e os estados iniciais da P1 do painel

**Issue**

- #103

**Descricao**
Como produto, queremos definir a navegacao minima e os estados vazios da base do painel para que a experiencia inicial fique clara e expansivel.

**Versao pronta para issue**
Como produto, queremos definir a navegacao minima e os estados vazios da base do painel para que a experiencia inicial fique clara e expansivel.

**Requisitos**

- definir a navegacao minima da base do painel
- criar estados vazios ou demonstrativos para as secoes iniciais
- manter a estrutura preparada para evoluir sem reescrita
- nao introduzir dados reais nesta etapa

**Criterios de aceite**

- a base do painel tem navegacao minima clara
- os estados iniciais ajudam a entender a estrutura do painel
- a experiencia inicial nao depende de backend real

**Plano de validacao**

- revisar a navegacao minima e os estados vazios
- confirmar que a base do painel continua isolada
- validar que a estrutura pode receber novas secoes sem refatoracao grande

**Evidencias esperadas**

- mapa simples da navegacao minima
- registro dos estados vazios ou demonstrativos
- confirmacao de que nao houve impacto no quiz atual

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
