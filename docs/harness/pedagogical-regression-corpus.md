# Corpus de Regressao Pedagogica e Linguistica

## Objetivo

Registrar exemplos pequenos e sinteticos de falhas editoriais para impedir a
reincidencia de problemas conhecidos sem copiar material escolar protegido.
O corpus apoia validacao automatica, mas nao substitui revisao humana,
avaliacao de fonte ou aprovacao pedagogica.

## Estrutura

O corpus versionado fica em
`config/pedagogical-regression-corpus.json`. Cada caso possui identificador
sintetico, categoria, resultado esperado, regras esperadas e uma questao
minima no formato `content-v1`.

As categorias obrigatorias sao:

- ortografia;
- concordancia;
- alternativa antinatural;
- explicacao insuficiente;
- ambiguidade;
- caso limpo aceito.

## Regras

`npm run test:pedagogical-regression` valida a estrutura do corpus, executa as
regras deterministicas e faz uma leitura somente de diagnostico do T2
publicado. A varredura do T2 nao altera arquivos, nao muda o catalogo e nao
promove nenhum conteudo.

Falhas estruturais sao bloqueantes quando detectadas no corpus ou no validador
de conteudo. Regras linguisticas sinteticas sao sinais de risco e devem ser
interpretadas com contexto. Ambiguidade semantica retorna
`not_evaluable`, exigindo revisao humana.

As regras deterministicas cobrem:

- todas as ocorrencias dos erros ortograficos comuns cadastrados, mesmo quando
  uma forma correta aparece antes ou depois do erro;
- concordancia nominal nos pares sinteticos `as crianca` e `a criancas`;
- concordancia entre `a crianca`/`as criancas` e uma lista conservadora de
  verbos frequentes usada pelo corpus;
- repeticao adjacente de palavras, inclusive com caracteres acentuados;
- explicacoes ausentes, muito curtas ou meramente circulares.

Cada campo textual e avaliado isoladamente: enunciado, traducao do enunciado,
alternativas, explicacao e explicacoes das alternativas. Assim, a ultima
palavra de um campo nunca e comparada com a primeira palavra do campo seguinte.

## Relatorio do T2

O scan retorna um objeto `t2-diagnostic-v1` com `blocking: false` e uma lista
`candidates`. Cada candidato contem somente os dados necessarios para revisao:

- `questionId`: identificador da questao publicada;
- `field`: campo de origem, como `question` ou `options[1]`;
- `rule`: regra deterministica acionada;
- `evidence`: trecho minimo normalizado, limitado a 80 caracteres.

A existencia de candidatos nao altera o codigo de saida, nao bloqueia CI e nao
autoriza correcao ou publicacao automatica. O resultado serve exclusivamente
para triagem humana rastreavel.

## Limites

- regex nao comprova naturalidade geral, adequacao etaria ou resposta unica;
- a concordancia sujeito-verbo cobre apenas construcoes e verbos explicitamente
  cadastrados para evitar sinalizacoes amplas sem contexto;
- ausencia de achado nao prova qualidade pedagogica;
- o T1 permanece fora do escopo;
- o T2 e somente medido, nunca corrigido por este check;
- novos casos devem ser sinteticos e nao conter trechos da fonte escolar.

## Evidencia

Registrar no card e no PR o resultado dos testes, as contagens da varredura e
as limitacoes observadas. Nao anexar texto escolar, dados de alunos ou
credenciais.
