# Spec: Personas e Escopo do Painel de Controle

## Objetivo

Definir com clareza quem usa o painel de controle, qual papel cada perfil tem e qual parte do painel pertence ao cliente ou ao dono do produto.

## Contexto

O painel precisa nascer sem ambiguidade entre operacao do cliente, acompanhamento de perfis educacionais e administracao do produto.

## Escopo

- identificar perfis principais do painel
- separar visao do cliente, do professor, do responsavel e do dono do produto
- listar permissoes de leitura e acao por perfil
- registrar quais dados cada perfil pode visualizar ou alterar

## Nao objetivos

- nao desenhar a implementacao das telas ainda
- nao definir stack de backend ou persistencia
- nao alterar o comportamento atual do app

## Requisitos

- o painel deve ter perfis nomeados e compreensiveis
- o cliente nao deve ver dados que pertencem a administracao interna do produto
- o dono do produto precisa enxergar operacao, uso e administracao sem misturar dominios
- cada perfil precisa ter limite explicito de leitura e acao

## Criterios de aceite

- existe um mapa funcional de perfis e responsabilidades
- o escopo do painel nao mistura operacao do cliente com administracao do produto
- cada perfil tem limite claro de leitura e acao

## Plano de validacao

- revisar os perfis propostos e confirmar que nao ha sobreposicao indevida
- validar se o mapa de responsabilidades separa uso operacional de administracao do produto

## Evidencias esperadas

- tabela simples de perfis, responsabilidades e acessos
- decisao clara sobre o que pertence ao cliente e o que pertence ao dono do produto
