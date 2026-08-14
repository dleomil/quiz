# Aplicacao do Preflight por Agente

## Objetivo

Definir como o checklist de preflight deve ser aplicado por cada agente principal do projeto.

## Regra geral

Todo agente que executar uma acao de escrita, revisao ou publicacao deve consultar o preflight antes de agir.

## 1. Spec Agent

Antes de escrever uma spec, confirmar:

- qual issue ou epic origina a demanda
- qual e a fonte da verdade
- quais documentos de produto e arquitetura devem ser lidos
- qual item do board sera afetado

## 2. Architect Agent

Antes de revisar arquitetura, confirmar:

- qual spec esta sendo analisada
- qual o estado atual do repositorio
- quais restricoes operacionais existem
- se ha impacto em producao, board ou roadmap

## 3. Implementer Agent

Antes de implementar, confirmar:

- qual spec foi aprovada
- qual branch deve receber a mudanca
- qual validacao precisa ser executada
- como a reversao ocorrera se necessario

## 4. Verifier Agent

Antes de validar, confirmar:

- quais criterios de aceite estao em vigor
- quais testes ou verificacoes precisam rodar
- quais evidencias sao obrigatorias
- qual resultado bloqueia a entrega

## 5. Release and Board Agent

Antes de atualizar board, issue ou PR, confirmar:

- qual item sera movido
- qual estado real da entrega deve ser refletido
- quais labels, campos e comentarios precisam ser atualizados
- se o estado final corresponde ao que foi entregue

## 6. Reviewer Agent

Antes de registrar parecer, confirmar:

- qual PR esta sendo revisado
- qual spec e qual plano de validacao sustentam o PR
- quais evidencias foram verificadas
- qual a decisao operacional a ser registrada

## 7. Product Discovery Agent

Antes de pesquisar ou recomendar, confirmar:

- qual pergunta e qual decisao a descoberta deve informar
- qual publico e afetado e qual e o horizonte da analise
- quais fatos exigem fontes atuais e data de consulta
- se o contexto esta livre de dados identificaveis de criancas
- como fatos, inferencias, hipoteses e recomendacoes serao separados
- quem e o Product Owner responsavel pela decisao final

## 8. Content Curator Agent

Antes de preparar conteudo, confirmar:

- qual tema curricular foi autorizado
- qual objetivo de aprendizagem e serie estao em escopo
- se a fonte pode ser usada e como sera rastreada
- qual parecer pedagogico sera exigido antes da implementacao

## 9. Pedagogical Quality Agent

Antes de revisar uma questao, confirmar:

- qual proposta e objetivo curricular estao sendo avaliados
- qual serie e perfil de linguagem devem ser atendidos
- quais gates de clareza, ambiguidade e resposta unica se aplicam
- quem registrara a aprovacao humana pedagogica

## Resultado esperado

- menos interpretacao improvisada por agente
- menos erro repetido em tarefas operacionais
- mais consistencia entre docs, board e PR
