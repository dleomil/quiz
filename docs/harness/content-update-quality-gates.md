# Gates de Qualidade para Atualizacao Curricular

## Objetivo

Definir os controles obrigatorios para atualizar conteudo escolar sem introduzir erro, ambiguidade ou material sem origem verificavel no quiz.

## Protecao da fonte

- material recebido da escola permanece local por padrao
- o arquivo-fonte nao deve ser commitado, publicado ou anexado a issue sem autorizacao explicita do titular
- a rastreabilidade registra titulo, pagina ou secao e objetivo curricular; nao precisa reproduzir o documento inteiro
- conteudo derivado deve respeitar direitos autorais e restricoes da escola

## Gates bloqueantes

O lote nao pode seguir para implementacao se qualquer ponto abaixo falhar:

- fonte, pagina ou secao e objetivo curricular nao estao registrados
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
deve evoluir para ler um manifesto de cobertura versionado; ate isso existir, a
evidencia de contagem por tema e obrigatoria no PR.

## Revisao editorial e pedagogica

Cada questao deve ser verificada para:

- ortografia, acentuacao, concordancia e pontuacao
- linguagem clara e adequada ao terceiro ano
- enunciado sem dupla interpretacao, pegadinha ou informacao insuficiente
- alternativas plausiveis, mas nao concorrentes com a resposta correta
- objetivo de aprendizagem coerente com o programa curricular
- explicacao curta, respeitosa e orientada ao aprendizado

## Validacao automatica prevista

O validador de conteudo deve bloquear, no minimo:

- IDs duplicados
- campos obrigatorios ausentes
- quantidade invalida de alternativas
- opcoes duplicadas apos normalizacao de espacos e caixa
- `correctIndex` invalido
- ausencia de explicacao e metadados obrigatorios
- referencia de fonte, status de revisao ou versao ausentes

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
