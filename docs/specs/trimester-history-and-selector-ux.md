# Histórico por Trimestre e Seletor Infantil

## Contexto

Alunos relataram que o Histórico exibe resultados do 1º e do 2º trimestre
juntos. O seletor atual também usa um controle pequeno e pouco evidente para
crianças. A mudança deve corrigir a leitura do progresso sem alterar ou apagar
sessões já salvas no navegador.

Issues relacionadas: `#260` e `#261`.

## Escopo

- apresentar os trimestres publicados como opções grandes na tela inicial;
- destacar de forma inequívoca o trimestre ativo;
- abrir o Histórico filtrado pelo trimestre ativo;
- permitir a consulta explícita de todos os trimestres;
- mostrar o trimestre em cada sessão do Histórico;
- preservar sessões `session-v2` e sessões legadas sem reclassificação.

## Não objetivos

- mudar o conteúdo ou a quantidade de questões;
- modificar o schema ou os dados persistidos no `localStorage`;
- sincronizar histórico entre navegadores ou dispositivos;
- criar perfis de aluno, autenticação ou backend.

## Requisitos funcionais

1. A tela inicial deve exibir uma opção por trimestre publicado.
2. A opção ativa deve ter texto e estado visual, sem depender apenas de cor.
3. A troca deve atualizar as matérias disponíveis usando o fluxo existente.
4. O Histórico deve usar `Store.selectedContentSet` como filtro inicial.
5. A opção `Todos os trimestres` deve ser uma escolha explícita do usuário.
6. Estatísticas, gráfico e lista devem considerar o mesmo conjunto filtrado.
7. Cada sessão visível deve identificar seu trimestre ou `Acervo anterior`.
8. Dados legados devem permanecer acessíveis somente pela visão consolidada.

## Requisitos de experiência e acessibilidade

- área de toque mínima de 44 px;
- estado selecionado exposto por `aria-pressed`;
- foco visível por teclado;
- leitura clara em tema claro e escuro;
- layout sem rolagem horizontal em telas de 375 px;
- linguagem direta e adequada a crianças do 3º ano.

## Critérios de aceite

- o 2º trimestre continua sendo a seleção inicial do produto;
- ao selecionar o 1º trimestre, matérias e Histórico passam a usar o T1;
- ao selecionar o 2º trimestre, matérias e Histórico passam a usar o T2;
- a visão consolidada mostra T1, T2 e legado com identificação individual;
- nenhuma leitura da tela altera o conteúdo persistido;
- a suíte completa e o teste Playwright dedicado passam;
- evidências visuais são geradas em desktop e mobile.

## Plano de validação

- criar fixtures locais com uma sessão T1, uma T2 e uma legada;
- validar o trimestre ativo e a troca das opções na tela inicial;
- validar o filtro inicial do Histórico para T1 e T2;
- validar a opção consolidada, os rótulos e as contagens;
- comparar o `localStorage` antes e depois da navegação;
- executar `npm test`, lint e verificação de formatação;
- gerar screenshots em 1280 px e 375 px.

## Riscos e rollback

O risco é restrito à renderização e aos filtros. O código não migra nem grava o
histórico durante a consulta. Em caso de regressão, a mudança pode ser revertida
sem tratamento de dados, porque o contrato persistido permanece intacto.
