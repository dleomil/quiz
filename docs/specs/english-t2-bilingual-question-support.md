# Apoio Bilingue nos Enunciados de Ingles - 2026 T2

## Contexto

Alunos do terceiro ano relataram dificuldade para compreender instrucoes exibidas
somente em ingles. O segundo trimestre possui 80 questoes ja auditadas, distribuidas
em quatro temas, mas nao possui contrato de apoio em portugues.

## Objetivo

Manter o enunciado principal em ingles e exibir uma instrucao equivalente em
portugues, sem traduzir o elemento que esta sendo avaliado nem revelar a resposta.

## Escopo

- acervo `2026-t2-v1`
- materia `ingles`
- 80 IDs `ING-T2-*`
- quiz e gabarito detalhado
- contrato e validacao automatica de conteudo
- desktop, mobile e modo escuro

O primeiro trimestre pertence a issue #289 e nao pode ser alterado nesta entrega.

## Contrato

Toda questao `content-v1` de Ingles deve possuir `questionPt` como texto nao vazio.

- `question`: enunciado principal em ingles
- `questionPt`: instrucao de apoio em portugues

O apoio deve complementar o enunciado e esclarecer em portugues qual acao o aluno
deve executar. Ele nao deve apenas repetir o mesmo conteudo nem apresentar uma
traducao quando essa traducao for a resposta esperada.

## Regras Pedagogicas

- usar linguagem curta e adequada ao terceiro ano
- traduzir a instrucao, nao a resposta
- preservar palavras entre aspas, lacunas e frases-alvo quando forem avaliadas
- usar somente construcoes gramaticais e naturais tambem nas alternativas erradas
- diferenciar distratores pelo significado, sem fabricar frases malformadas
- garantir que contexto, alternativas e polissemia nao criem uma segunda resposta defensavel
- manter IDs, alternativas, `correctIndex`, habilidade e objetivo curricular
- mostrar claramente qual texto esta em ingles e qual e o apoio em portugues
- exigir revisao humana das 80 correspondencias antes do release

## Criterios de Aceite

- 80 de 80 questoes T2 possuem `questionPt`
- o validador rejeita questao `content-v1` de Ingles sem `questionPt`
- quiz e gabarito exibem os dois textos
- materias diferentes de Ingles nao exibem o bloco bilingue
- nenhum apoio entrega diretamente a resposta correta
- regressao de conteudo e interface passa nos dois trimestres
- desktop, mobile e modo escuro permanecem legiveis

## Validacao

- teste negativo do contrato de conteudo
- verificacao automatica de cobertura 80/80
- amostras dos quatro temas no Playwright
- resposta correta e incorreta
- resultado detalhado com apoio em portugues
- suite completa, lint e formatacao
- preview Vercel antes de promocao para `main`

## Rollout e Rollback

A entrega entra primeiro em `develop`. A promocao para `main` exige aprovacao
humana das evidencias pedagogicas e visuais. O rollback consiste em reverter o PR;
nao existe migracao de historico.
