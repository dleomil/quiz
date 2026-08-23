# Gates de Qualidade para Atualizacao Curricular

## Objetivo

Definir os controles obrigatorios para atualizar conteudo escolar sem introduzir erro, ambiguidade ou material sem origem verificavel no quiz.

## Escopo ativo de manutencao

- o acervo do primeiro trimestre e legado congelado e permanece disponivel
  somente para consulta historica;
- T1 nao recebe correcoes, auditorias, migracoes, novos requisitos ou cards;
- os gates deste documento se aplicam ao segundo trimestre e aos acervos futuros;
- nenhuma entrega ativa pode ampliar o escopo para T1 ou ser bloqueada por divida
  conhecida nesse acervo;
- uma mudanca dessa decisao exige nova definicao explicita de produto antes de
  qualquer refinamento ou implementacao.

## Protecao da fonte

- material recebido da escola permanece local por padrao
- o arquivo-fonte nao deve ser commitado, publicado ou anexado a issue sem autorizacao explicita do titular
- a rastreabilidade registra ano, trimestre, materia, tema e objetivo curricular
- pagina de apostila nao e requisito, metadado obrigatorio nem motivo isolado
  para bloquear uma curadoria
- conteudo derivado deve respeitar direitos autorais e restricoes da escola

## Gates bloqueantes

O lote nao pode seguir para implementacao se qualquer ponto abaixo falhar:

- ano, trimestre, materia, tema ou objetivo curricular nao estao registrados
- serie, materia e topico nao estao definidos
- a questao nao possui uma unica resposta correta defensavel
- existem alternativas vazias, duplicadas ou equivalentes no contexto da pergunta
- `correctIndex` esta fora do intervalo de alternativas
- explicacao da resposta correta esta ausente ou contradiz a fonte
- feedback para respostas erradas esta ausente quando o formato da questao o exigir
- identificador da questao e versao nao estao definidos
- nao existe aprovacao humana pedagogica registrada para o lote

## Gate de cobertura curricular

Antes de publicar um novo `contentSetId`, o Verifier Agent deve confirmar a
spec de cobertura curricular e bloquear a publicacao quando qualquer regra
abaixo falhar:

- algum tema de `Objetos de Conhecimento` nao esta declarado na spec;
- um tema declarado possui menos ou mais de 20 questoes aprovadas;
- uma questao nao pertence a um tema declarado para o acervo;
- o total por materia foi usado como substituto da cobertura por tema.

Este gate vale para todos os anos e trimestres futuros. A validacao automatica
le `config/content-coverage-manifest.json` e bloqueia tema ausente, excedente ou
nao declarado. Todo acervo `content-v1` publicado deve possuir uma entrada no
manifesto; acervos `draft` podem permanecer abaixo da meta durante a curadoria.

## Revisao editorial e pedagogica

Cada questao deve ser verificada para:

- ortografia, acentuacao, concordancia e pontuacao
- linguagem clara e adequada ao terceiro ano
- enunciado sem dupla interpretacao, pegadinha ou informacao insuficiente
- alternativas plausiveis, mas nao concorrentes com a resposta correta
- objetivo de aprendizagem coerente com o programa curricular
- explicacao curta, respeitosa e orientada ao aprendizado

## Pacote pedagogico completo

Uma spec so pode seguir para PR de revisao quando cada uma das 20 propostas
contiver enunciado, quatro alternativas, `correctIndex`, explicacao correta e
tres justificativas das alternativas incorretas. A revisao valida esse pacote;
ela nao deve completar informacoes ausentes.

## Capacidade paralela

O trabalho curricular pode ocorrer em trilhas independentes, sem pular gates:

- Pipeline editorial: no maximo dez temas somados entre curadoria e revisao
  pedagogica.
- Implementacao: no maximo um tema aprovado pedagogicamente.
- Verificacao e release: no maximo um PR aguardando evidencias e merge.

O WIP editorial e contado por tema curricular, mesmo quando um tema possui mais
de um documento ou card auxiliar. Um tema bloqueado continua consumindo
capacidade enquanto permanecer em `In Progress`; para liberar a vaga, o card
deve voltar para `Todo`/`Backlog` e manter a label `blocked` com o impedimento
registrado.

Cada tema usa card e branch proprios. Curadoria e revisao podem avancar em
paralelo, mas implementacao, verificacao e release permanecem serializados em
suas respectivas trilhas. Um tema so avanca quando satisfaz os criterios da
trilha anterior; o acervo continua `draft` ate a decisao de publicacao
controlada.

## Validacao automatica prevista

O validador de conteudo deve bloquear, no minimo:

- IDs duplicados
- campos obrigatorios ausentes
- quantidade invalida de alternativas
- opcoes duplicadas apos normalizacao de espacos e caixa
- `correctIndex` invalido
- ausencia de explicacao e metadados obrigatorios
- referencia de tema, status de revisao ou versao ausentes

Automacao estrutural nao substitui revisao de linguagem, ambiguidade ou adequacao pedagogica.

## Fluxo de publicacao

1. Criar spec do lote e registrar a fonte autorizada.
2. Content Curator Agent prepara o mapa e as propostas.
3. Pedagogical Quality Agent emite parecer por lote.
4. Revisor humano pedagogico aprova ou devolve ajustes.
5. Implementer Agent aplica somente itens aprovados.
6. Verifier Agent executa validador de conteudo e regressao do quiz.
7. Reviewer Agent confere evidencias antes do merge.

## Evidencias minimas

- mapa entre objetivo curricular e questoes
- resultado do validador automatizado
- parecer do Pedagogical Quality Agent
- confirmacao de aprovacao humana pedagogica
- teste de regressao do quiz

## Regra de seguranca

Nenhum agente pode publicar um lote curricular com base apenas em inferencia automatizada ou sem aprovacao humana registrada.
