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

## Mapa preliminar de perfis

| Perfil          | Objetivo principal                      | Pode ver                                                  | Pode alterar                                             |
| --------------- | --------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------- |
| Cliente         | Gerir a propria operacao contratada     | dados da propria conta, uso e resultados consolidados     | configuracoes permitidas pelo contrato                   |
| Professor       | Acompanhar desempenho e orientar estudo | progresso, desempenho e historico educacional relacionado | comentarios ou ajustes permitidos no fluxo educacional   |
| Responsavel     | Acompanhar evolucao do aluno            | progresso, frequencia e relatorios simplificados          | preferencialmente sem alteracoes operacionais no produto |
| Dono do produto | Operar o produto e suportar clientes    | tudo que impacta operacao, uso, conteudo e administracao  | configuracoes, conteudo, operacao e suporte interno      |

## Nao objetivos

- nao desenhar a implementacao das telas ainda
- nao definir stack de backend ou persistencia
- nao alterar o comportamento atual do app

## Requisitos

- o painel deve ter perfis nomeados e compreensiveis
- o cliente nao deve ver dados que pertencem a administracao interna do produto
- o dono do produto precisa enxergar operacao, uso e administracao sem misturar dominios
- cada perfil precisa ter limite explicito de leitura e acao
- o mapa de perfis deve caber em uma tabela simples e reutilizavel
- a separacao entre cliente e dono do produto deve ser inequívoca

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
