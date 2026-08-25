# Retrospectiva do Ciclo de Conteudo T2

## Objetivo

Transformar os erros observados na atualizacao do segundo trimestre em controles
reutilizaveis para o T3. Esta retrospectiva avalia processo, agentes,
especificacoes, validadores e release. Ela nao reabre a manutencao do T1 e nao
altera o quiz em producao.

## Resultado do ciclo

O acervo `2026-t2-v1` foi concluido e publicado com 20 questoes por tema. O
ciclo, porem, exigiu correcoes reativas de cobertura, separacao trimestral,
ortografia, clareza pedagogica e suporte bilingue. A entrega final funcionou,
mas o custo de retrabalho e a exposicao de falhas aos alunos foram maiores do
que o aceitavel para um processo repetivel.

## Achados priorizados

### P0 - O contrato curricular foi estabilizado depois do inicio da producao

**Evidencia:** o trabalho comecou com uma meta por materia e passou a adotar 20
questoes por `Objeto de Conhecimento` durante a execucao. O epic `#132`, as
stories `#130`, `#137`, `#206`, `#228`, `#230` e `#231`, e o gate automatizado
`#232` foram criados quando varios lotes ja estavam em andamento.

**Causa sistemica:** nao havia um artefato de intake curricular aprovado e
congelado antes da curadoria.

**Acao preventiva:** nenhum lote T3 pode ser produzido antes da aprovacao do
manifesto curricular completo, com materias, temas, objetivos e meta por tema.

### P0 - A revisao pedagogica nao evitou erros linguisticos e semanticos

**Evidencia:** as issues `#276`, `#287` e `#293` registraram erros ortograficos,
falta de apoio em portugues e construcoes inadequadas em Ingles depois da
implementacao ou publicacao.

**Causa sistemica:** uma unica revisao tentava conferir simultaneamente
corretude factual, ortografia, adequacao infantil, ambiguidade, alternativas e
explicacoes. O validador estrutural passava mesmo quando o texto era pouco
natural ou pedagogicamente fraco.

**Acao preventiva:** separar a avaliacao em duas passagens independentes:
corretude pedagogica e qualidade linguistica/adequacao infantil. Automacao
continua complementar e nunca substitui aprovacao humana.

### P0 - Integridade trimestral e completude foram verificadas tarde

**Evidencia:** `#133` precisou ocultar acervo incompleto; `#140` separou topicos
por trimestre; `#261` corrigiu historico misturado entre trimestres.

**Causa sistemica:** cobertura, visibilidade do catalogo e isolamento de sessao
nao formavam um unico gate de publicacao antes do T2.

**Acao preventiva:** todo acervo novo nasce `draft`, permanece invisivel e deve
passar por testes de cobertura, catalogo, seletor, sessao e historico antes de
ser elegivel para `published`.

### P1 - O piloto validou estrutura, mas nao validou o processo completo

**Evidencia:** `#118`, `#119`, `#123` e `#125` executaram o piloto de sistema
monetario, mas controles importantes foram adicionados posteriormente.

**Causa sistemica:** o piloto nao possuia criterios de saida que cobrissem toda
a jornada, da fonte curricular ao uso no navegador e ao rollback.

**Acao preventiva:** o piloto T3 deve conter 20 questoes de um unico tema e
executar todos os gates finais. A producao paralela so comeca depois de uma
decisao explicita de `go`.

### P1 - A decomposicao gerou coordenacao excessiva

**Evidencia:** o T2 produziu cards separados para curadoria, implementacao e
correcoes pontuais de muitos temas, chegando a exigir ampliacao do WIP em
`#158` e `#168`.

**Causa sistemica:** o board representou microetapas editoriais, nao unidades
de valor verificaveis. Isso aumentou movimentacoes, comentarios e handoffs.

**Acao preventiva:** usar um card por tema como unidade editorial e subtarefas
em checklist. Criar card separado apenas quando houver mudanca de codigo,
dependencia, risco ou release independente.

### P1 - Os agentes de conteudo ainda nao sao executaveis

**Evidencia:** Content Curator e Pedagogical Quality Agent estao documentados,
mas nao possuem configuracao em `.codex/agents/`. Reviewer e Verifier ja possuem
configuracoes executaveis.

**Causa sistemica:** a automacao dos papeis tecnicos foi priorizada antes do
fluxo editorial.

**Acao preventiva:** tornar os dois agentes executaveis em modo restrito,
incluindo entradas, formato de saida, preflight e proibicao de publicar ou
aprovar pedagogicamente sem humano.

### P2 - Testes de regressao linguistica ficaram acoplados a erros conhecidos

**Evidencia:** os testes atuais possuem listas e assercoes especificas para
erros encontrados em Geografia e Ingles. Eles evitam reincidencia exata, mas
nao demonstram qualidade geral de uma nova materia.

**Causa sistemica:** faltava um corpus de exemplos ruins e regras editoriais
reutilizaveis por idioma e tipo de questao.

**Acao preventiva:** criar um corpus pequeno de regressao pedagogica e separar
regras genericas de testes especificos do acervo T2.

## O que deve ser preservado

- schema `content-v1` com metadados, explicacoes e status de revisao;
- manifesto de cobertura com meta por tema;
- acervo novo em `draft` ate publicacao controlada;
- WIP editorial paralelo e implementacao/release serializados;
- evidencias no card e no PR;
- revisao humana pedagogica como gate bloqueante;
- congelamento do T1 e ausencia de referencias obrigatorias a paginas.

## Decisoes para o T3

1. Preparar o pipeline antes de receber ou criar questoes.
2. Congelar o contrato curricular antes da curadoria.
3. Validar um tema completo antes de escalar.
4. Revisar pedagogia e linguagem em passagens independentes.
5. Manter um card por tema, evitando cards para cada correcao ortografica.
6. Medir aprovacao na primeira passagem, retrabalho e defeitos escapados.
7. Manter o T3 invisivel enquanto qualquer gate de publicacao estiver aberto.

## Riscos residuais

Nenhum validador deterministico garante sozinho que uma pergunta seja boa para
uma crianca. O risco residual deve ser tratado com amostragem independente,
aprovacao humana, lote piloto e possibilidade de retirar o acervo sem afetar os
trimestres publicados.
