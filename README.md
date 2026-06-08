# Quiz Etapa

> Aplicacao web de quiz educativo para criancas do 3o ano do Ensino Fundamental, com foco em pratica, revisao e acompanhamento de desempenho.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-F59E0B)
![HTML](https://img.shields.io/badge/HTML5-estrutura-E34F26)
![CSS](https://img.shields.io/badge/CSS3-estilo-1572B6)
![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E)
![Deploy](https://img.shields.io/badge/deploy-vercel-000000)

## Sobre o projeto

O **Quiz Etapa** e uma aplicacao web estatica criada para tornar a revisao escolar mais leve, visual e interativa. O aluno escolhe uma materia, seleciona um assunto e responde a uma sequencia de perguntas com feedback imediato, explicacoes e historico de desempenho salvo no navegador.

O projeto foi estruturado para funcionar sem backend, o que facilita uso, manutencao e deploy.

## Destaques

- Interface simples e amigavel para estudo infantil
- Quiz com progresso visual por pergunta
- Feedback imediato apos cada resposta
- Gabarito comentado no fim da sessao
- Historico de desempenho salvo localmente
- Grafico de evolucao com `Chart.js`
- Exportacao do resultado em HTML

## Funcionalidades

- Escolha de materia na tela inicial
- Selecao de assunto especifico ou modo `Todos os Assuntos`
- Sorteio de perguntas a partir de um banco local
- Exibicao de trechos de texto quando a questao exige interpretacao
- Contador de progresso e acertos durante o quiz
- Tela final com percentual de aproveitamento
- Revisao detalhada das respostas certas e erradas
- Historico das tentativas com media, melhor nota e grafico
- Limpeza manual do historico quando desejado

## Materias e conteudos

Atualmente, o projeto possui foco principal em **Portugues**, com perguntas organizadas por temas. A estrutura tambem ja esta preparada para expansao, permitindo adicionar novas materias e novos conjuntos de questoes com relativa facilidade.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript Vanilla
- Chart.js
- `localStorage`
- Vercel

## Estrutura do projeto

```text
Quiz/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── store.js
│   ├── data/
│   │   ├── questions.js
│   │   └── subjects/
│   │       ├── portugues.js
│   │       ├── matematica.js
│   │       ├── ciencias.js
│   │       ├── geografia.js
│   │       ├── historia.js
│   │       └── ingles.js
│   └── views/
│       ├── home.js
│       ├── subject.js
│       ├── quiz.js
│       ├── results.js
│       └── history.js
└── vercel.json
```

## Fluxo da aplicacao

1. O usuario escolhe uma materia.
2. Seleciona um assunto especifico ou todos os assuntos disponiveis.
3. O sistema monta uma sessao com perguntas sorteadas do banco local.
4. Cada resposta recebe retorno imediato.
5. Ao final, o resultado e calculado e armazenado no historico.
6. O usuario pode revisar o gabarito e baixar o resultado.

## Como executar localmente

Como o projeto e estatico, voce pode abrir o arquivo `index.html` diretamente no navegador.

Se quiser rodar com um servidor local:

```bash
npm run dev
```

Ou use uma extensao como **Live Server** no VS Code.

## Comandos oficiais

- `npm run dev`: sobe um servidor local na porta `3000`
- `npm start`: alias do `npm run dev`
- `npm test`: executa a validacao automatizada do modo escuro e feedback
- `npm run test:ui:dark-mode`: executa apenas o teste de interface do modo escuro

## Persistencia de dados

O historico dos quizzes e salvo com `localStorage`, ou seja:

- os dados ficam armazenados no proprio navegador
- nao ha dependencia de banco de dados externo
- o historico permanece entre acessos no mesmo dispositivo e navegador
- limpar os dados do navegador remove esse historico

## Possiveis evolucoes

- adicionar novas materias
- criar niveis de dificuldade
- incluir temporizador por pergunta
- melhorar filtros e leitura do historico
- adicionar sons e reforcos visuais
- incluir relatorios mais detalhados por tema

## Objetivo

A proposta do projeto e transformar a revisao escolar em uma experiencia mais acessivel e motivadora, ajudando criancas a praticar com autonomia e permitindo um acompanhamento simples por responsaveis ou professores.

## Deploy

O repositorio ja possui `vercel.json`, facilitando a publicacao do projeto na Vercel.

## Licenca

Voce pode definir a licenca que fizer mais sentido para o projeto. Uma opcao comum para projetos desse tipo e a **MIT**.
