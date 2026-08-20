# Spec: Descoberta de Produto Assistida

## Objetivo

Definir como o Product Discovery Agent transforma sinais de mercado e feedback
seguro em oportunidades rastreaveis, sem assumir a autoridade do Product Owner
nem criar trabalho no backlog por conta propria.

## Problema

O projeto possui governanca para construir, validar e publicar entregas, mas nao
possui um processo explicito para observar o mercado, comparar alternativas e
decidir quais problemas merecem investigacao. Sem esse contrato, tendencias
podem virar funcionalidades sem evidencia, prioridade ou alinhamento com o
produto educacional.

## Principios

1. Problemas e resultados esperados vêm antes de funcionalidades.
2. Fatos, inferencias, hipoteses e recomendacoes nunca sao apresentados como se
   fossem a mesma coisa.
3. Pesquisa de mercado informa decisoes; nao substitui validacao com usuarios.
4. Protecao infantil, qualidade pedagogica e propriedade intelectual sao gates.
5. O Product Owner continua responsavel por prioridade, investimento e entrada
   no backlog.

## Escopo

- pesquisa de mercado e de alternativas atuais;
- analise de feedback anonimizado de alunos, responsaveis e escolas;
- identificacao de problemas, sinais e oportunidades;
- elaboracao de radar de mercado, matriz comparativa e opportunity brief;
- recomendacao de descartar, observar, pesquisar ou propor ao backlog;
- definicao de hipoteses e metricas para experimentos pequenos.

## Nao objetivos

- copiar funcionalidades, conteudo ou identidade de concorrentes;
- definir estrategia comercial ou preco sem decisao humana;
- coletar ou processar dados pessoais de criancas;
- criar, priorizar ou mover cards autonomamente;
- aprovar spec, implementacao, release ou publicacao;
- substituir pesquisa pedagogica, juridica ou de seguranca especializada.

## Classificacao obrigatoria das afirmacoes

| Classe       | Definicao                            | Evidencia exigida                          |
| ------------ | ------------------------------------ | ------------------------------------------ |
| Fato         | Informacao verificavel em uma fonte  | URL, titulo, origem e data de consulta     |
| Inferencia   | Leitura derivada de um ou mais fatos | Fatos relacionados e raciocinio explicito  |
| Hipotese     | Suposicao que precisa ser validada   | Publico, problema, teste e metrica         |
| Recomendacao | Opcao sugerida para decisao          | Beneficio, risco, custo e nivel de certeza |

## Requisitos funcionais

### RF-01: Pergunta de descoberta

Toda execucao deve comecar com uma pergunta delimitada, publico afetado,
horizonte da decisao e criterio de sucesso.

### RF-02: Pesquisa rastreavel

Informacoes que possam ter mudado devem ser pesquisadas no momento da analise.
Cada fonte deve registrar origem, link, data de publicacao quando disponivel e
data de consulta. Fontes primarias e oficiais devem ser priorizadas.

### RF-03: Saidas padronizadas

O agente deve escolher a menor saida suficiente:

- radar de mercado para sinais recorrentes;
- matriz comparativa para capacidades observaveis;
- opportunity brief para uma oportunidade candidata.

### RF-04: Decisao humana

Cada oportunidade termina em uma das recomendacoes:

- `Descartar`;
- `Observar`;
- `Pesquisar`;
- `Propor ao backlog`.

Somente o Product Owner pode aprovar a criacao ou priorizacao de trabalho no
backlog.

### RF-05: Feedback seguro

Feedback deve ser agregado ou anonimizado. Nome, contato, escola, turma,
identificador, historico individual ou qualquer dado que permita identificar
uma crianca nao pode entrar no context pack ou na saida do agente.

### RF-06: Verificacao de aderencia

Toda recomendacao deve avaliar:

- valor para a aprendizagem e para o publico atendido;
- alinhamento com a visao do produto;
- confianca e qualidade das evidencias;
- risco pedagogico, de privacidade e de seguranca;
- impacto operacional e dependencia tecnica;
- menor experimento reversivel possivel.

### RF-07: Cadencia e validade

O agente nao executa monitoramento autonomo em segundo plano. A pesquisa pode
ser iniciada por uma pergunta aprovada ou por um ciclo trimestral autorizado
pelo Product Owner. Antes de reutilizar uma conclusao, informacoes mutaveis como
preco, funcionalidades, termos e posicionamento devem ser pesquisadas novamente.

### RF-08: Armazenamento

Resultados aprovados para preservacao devem ser versionados em
`docs/product/discovery/` com data e assunto no nome do arquivo. Rascunhos que
contenham dados nao aprovados ou feedback bruto nao devem ser commitados.

## Requisitos nao funcionais

- documentos devem ser versionados e reproduziveis;
- pesquisas devem informar a validade temporal das conclusoes;
- nenhuma pesquisa recorrente ocorre sem ciclo autorizado pelo Product Owner;
- ausencia de evidencia deve ser declarada, nunca preenchida por suposicao;
- comparacoes nao devem produzir ranking absoluto sem criterios explicitos;
- nenhuma execucao pode alterar o aplicativo ou producao.

## Fluxo de decisao

1. Product Owner ou issue define a pergunta.
2. Product Discovery Agent executa o preflight.
3. O agente pesquisa, classifica as afirmacoes e registra lacunas.
4. O agente entrega uma recomendacao com nivel de confianca.
5. Product Owner decide descartar, observar, aprofundar ou autorizar backlog.
6. Se autorizado, o Spec Agent transforma a oportunidade em requisito testavel.

## Criterios de aceite

- o papel consultivo e seus limites estao documentados;
- existem formatos minimos para as tres saidas previstas;
- toda pesquisa exige fontes atuais e data de consulta;
- a classificacao das afirmacoes e obrigatoria;
- privacidade infantil e propriedade intelectual sao gates bloqueantes;
- nenhuma recomendacao entra no backlog sem aprovacao do Product Owner;
- o agente esta integrado ao modelo operacional e ao harness.

## Plano de validacao

- revisar consistencia com os principios do produto;
- simular uma oportunidade sem criar card ou alterar o roadmap;
- verificar se uma conclusao sem fonte e rejeitada;
- verificar se feedback identificavel de crianca e bloqueado;
- confirmar que o fluxo termina em decisao humana.

## Implantacao

Esta spec introduz somente governanca documental. O primeiro radar de mercado
deve ser executado em uma historia separada, com pergunta e periodo definidos.
