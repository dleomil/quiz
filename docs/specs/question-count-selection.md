# Spec: Selecao de Quantidade de Questoes

## Problema

A aplicacao usa o valor fixo de 30 ao montar qualquer rodada. Quando uma materia
ou assunto possui mais questoes, o aluno nao consegue escolher uma rodada maior.
Historia do segundo trimestre possui 80 questoes, mas `Todos os Assuntos` inicia
somente 30.

## Objetivo

Permitir que o aluno escolha qualquer quantidade inteira entre 2 e o total
disponivel no trimestre, materia e assunto selecionados.

## Regras funcionais

### RF-01: Momento da escolha

Ao selecionar um card de assunto, a aplicacao deve abrir um painel de quantidade
antes de montar a rodada.

### RF-02: Intervalo

- minimo: 2 questoes quando existirem pelo menos 2;
- maximo: total disponivel para acervo, materia e assunto;
- valor sugerido: o menor valor entre 30 e o total disponivel;
- somente numeros inteiros sao aceitos.

### RF-03: Controles

O painel deve oferecer:

- campo numerico com minimo e maximo explicitos;
- botoes para diminuir e aumentar uma questao;
- atalhos para 2, 10, 20 quando couberem no intervalo;
- atalho `Todas` com o total disponivel;
- botao explicito para iniciar a rodada.

Atalhos duplicados devem ser omitidos. Em um assunto com 20 questoes, por
exemplo, o atalho final deve ser `Todas (20)` em vez de outro botao `20`.

### RF-04: Validacao

Valor vazio, fracionario ou fora do intervalo deve:

- apresentar orientacao curta e adequada para criancas;
- manter o botao de inicio desabilitado;
- nunca montar uma rodada parcial ou silenciosamente corrigida.

A camada `App` deve repetir a validacao antes de consultar o banco de questoes.

### RF-05: Montagem da rodada

A rodada deve conter exatamente a quantidade escolhida, sem IDs duplicados e
somente com questoes do acervo, materia e assunto selecionados.

### RF-06: Confirmacao

A introducao do quiz e o contador das perguntas devem refletir o total escolhido.

## Requisitos de experiencia

- linguagem curta e direta;
- alvo de toque adequado para criancas;
- foco movido para o painel depois da escolha do assunto;
- card selecionado identificado visualmente e por `aria-pressed`;
- controles acessiveis por teclado;
- layout funcional em desktop e mobile;
- contraste preservado nos temas claro e escuro.

## Compatibilidade

- `App.startQuiz` continua aceitando chamada sem quantidade para compatibilidade
  interna e usa a sugestao segura de ate 30;
- tema ou materia sem questoes continua exibindo o aviso atual;
- historico, temporizador, resultado e conteudo curricular nao mudam.

## Criterios de aceite

- Historia T2 permite 2 ate 80 em `Todos os Assuntos`;
- `Todas (80)` cria 80 questoes unicas de Historia T2;
- escolher 2 cria exatamente 2 questoes;
- um assunto de Historia limita a selecao a 20;
- um valor intermediario valido cria exatamente o total solicitado;
- valores invalidos nao iniciam o quiz;
- desktop, mobile, teclado e modo escuro permanecem utilizaveis;
- a suite completa e o teste Playwright dedicado passam.

## Validacao e evidencias

- evidencia da reproducao anterior: 80 disponiveis e 30 selecionadas;
- teste automatizado dos limites 2, intermediario, 20 e 80;
- verificacao de unicidade e metadados das questoes;
- screenshots desktop e mobile do painel;
- `npm run format:check`;
- `npm run lint`;
- `npm test`;
- preview da Vercel antes da promocao para producao.

## Rollout

1. Implementar e validar localmente.
2. Abrir PR para `develop`.
3. Validar checks e preview sem alterar `main`.
4. Promover em PR separado somente apos aprovacao humana.
5. Executar smoke test em producao depois do deploy.

## Rollback

Reverter o PR funcional. Nao ha migracao de dados, alteracao de schema ou
reescrita do historico.
