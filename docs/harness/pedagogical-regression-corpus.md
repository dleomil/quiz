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

## Limites

- regex nao comprova naturalidade geral, adequacao etaria ou resposta unica;
- ausencia de achado nao prova qualidade pedagogica;
- o T1 permanece fora do escopo;
- o T2 e somente medido, nunca corrigido por este check;
- novos casos devem ser sinteticos e nao conter trechos da fonte escolar.

## Evidencia

Registrar no card e no PR o resultado dos testes, as contagens da varredura e
as limitacoes observadas. Nao anexar texto escolar, dados de alunos ou
credenciais.
