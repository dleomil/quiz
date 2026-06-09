# Avaliacao de Limites da Vercel

## Objetivo

Registrar ate onde a Vercel gratuita sustenta o projeto atual e quais sinais exigem reavaliacao antes de evoluir para um produto comercial.

## Data da avaliacao

2026-06-08

## Fontes

- Vercel Limits: https://vercel.com/docs/limits
- Vercel Hobby Plan: https://vercel.com/docs/plans/hobby
- Vercel Account Plans: https://vercel.com/docs/plans
- Vercel Pricing: https://vercel.com/pricing
- Vercel Functions Limits: https://vercel.com/docs/functions/limitations

## Estado atual do projeto

O app atual e uma aplicacao web estatica com HTML, CSS e JavaScript no navegador.

Hoje nao ha:

- backend proprio
- API routes
- Vercel Functions
- middleware
- Image Optimization
- Web Analytics configurado no codigo
- Speed Insights configurado no codigo

## Decisao executiva

**Decisao:** manter na Vercel gratuita por enquanto.

**Motivo:** para o formato atual, estatico e sem backend, os limites mais relevantes sao deploy, build, tamanho de upload e transferencia. O projeto ainda esta muito distante desses limites.

**Condicao:** antes de uso comercial, painel administrativo, contas de usuario, analytics ou backend, a decisao deve ser reavaliada. O plano Hobby e descrito pela Vercel como voltado a projetos pessoais, desenvolvedores e aplicacoes pequenas.

## Tabela de limites relevantes

| Limite                                         | Fonte                   | Impacto no projeto atual                                   | Risco atual         | Decisao                            |
| ---------------------------------------------- | ----------------------- | ---------------------------------------------------------- | ------------------- | ---------------------------------- |
| 100 deployments por dia no Hobby               | Vercel Limits           | Afeta apenas volume muito alto de deploys                  | Baixo               | Monitorar                          |
| 32 builds por hora no Hobby                    | Vercel Limits           | Afeta ciclos intensos de CI/deploy                         | Baixo               | Monitorar                          |
| 1 build concorrente no Hobby                   | Vercel Limits           | Pode gerar fila se houver muitos PRs simultaneos           | Baixo               | Aceitar por enquanto               |
| 45 minutos de build por deployment             | Vercel Limits           | O app atual nao tem build pesado                           | Baixo               | Manter                             |
| 100 MB de upload estatico via CLI no Hobby     | Vercel Limits           | Pode importar se o conteudo crescer com muitos assets      | Baixo               | Monitorar                          |
| 15.000 arquivos de origem em deploy CLI        | Vercel Limits           | Pode importar se o banco de conteudo virar muitos arquivos | Baixo               | Monitorar                          |
| 100 GB/mes de Fast Data Transfer no Hobby      | Vercel Plans/Pricing    | Afeta trafego real de alunos e assets                      | Medio futuro        | Criar gatilho                      |
| Runtime logs por 1 hora no Hobby               | Vercel Plans/Limits     | Baixa observabilidade para incidente em producao           | Medio futuro        | Reavaliar com produto comercial    |
| 50.000 eventos de Web Analytics no Hobby       | Vercel Hobby Plan       | So importa se Web Analytics for ativado                    | Baixo agora         | Reavaliar antes de analytics       |
| 10.000 pontos de Speed Insights no Hobby       | Vercel Hobby Plan       | So importa se Speed Insights for ativado                   | Baixo agora         | Reavaliar antes de observabilidade |
| 1.000.000 invocacoes de Functions no Hobby     | Vercel Hobby Plan       | Nao se aplica hoje, mas importa com backend                | Nao aplicavel agora | Reavaliar antes de API             |
| 4 CPU-horas e 360 GB-horas de memoria no Hobby | Vercel Hobby Plan       | Nao se aplica hoje, mas importa com backend                | Nao aplicavel agora | Reavaliar antes de API             |
| 2 GB de memoria maxima para Functions no Hobby | Vercel Functions Limits | Nao se aplica hoje                                         | Nao aplicavel agora | Reavaliar antes de API             |

## Gatilhos de reavaliacao

Reavaliar Vercel gratuita quando qualquer item abaixo acontecer:

- inicio de uso comercial com clientes pagantes
- necessidade de painel administrativo
- necessidade de login, usuarios, turmas ou perfis
- necessidade de backend, API ou persistencia remota
- necessidade de analytics, auditoria ou observabilidade continua
- trafego aproximando 70% de 100 GB/mes
- deploys recorrentes aproximando 70% de 100 por dia
- crescimento relevante de assets ou conteudo estatico
- necessidade de logs por mais de 1 hora para suporte

## Recomendacao

Para o produto atual, a Vercel gratuita continua suficiente.

Para produto comercial, o primeiro passo provavel nao e sair da Vercel, mas reavaliar o plano e os componentes: manter frontend na Vercel, avaliar Pro para operacao comercial e decidir backend/persistencia separadamente quando essas capacidades forem desenhadas.

## Evidencia de nao impacto

Esta avaliacao nao exige alteracao de codigo, deploy, infraestrutura ou configuracao da Vercel.
