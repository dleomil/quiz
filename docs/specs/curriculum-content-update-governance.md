# Spec: Governanca para Atualizacao de Conteudo Curricular

## Contexto

A escola forneceu material curricular local para orientar novas provas. O quiz atende criancas e, por isso, a atualizacao precisa prevenir erro ortografico, resposta ambigua, explicacao confusa e desvio do objetivo pedagogico.

## Escopo

- definir agentes especializados em curadoria e qualidade pedagogica
- definir gates para fonte, linguagem, ambiguidade e aprovacao humana
- preparar a validacao automatica estrutural do banco de questoes
- preservar o material-fonte fora do repositorio ate haver autorizacao de versionamento

## Nao objetivos

- nao importar ou alterar questoes nesta etapa
- nao publicar o material-fonte da escola
- nao substituir revisao humana por automacao
- nao mudar o fluxo do quiz para o aluno

## Requisitos

- cada lote deve ter serie, materia, topico, habilidade, versao e referencia de fonte
- cada questao deve ter uma unica resposta correta e alternativas nao ambiguas
- enunciado, alternativas e explicacoes devem passar por revisao linguistica e pedagogica
- cada lote deve ter aprovacao humana pedagogica antes da implementacao
- um validador automatizado futuro deve rejeitar inconsistencias estruturais

## Criterios de aceite

- existem agentes documentados para curadoria e qualidade pedagogica
- existe politica de gates de conteudo no harness
- existe fluxo claro da fonte ate a publicacao
- o material em `SchoolContent/` esta protegido contra commit acidental
- a proxima alteracao de conteudo pode nascer de uma spec rastreavel

## Plano de validacao

- revisar se cada papel tem entrada, saida e limite claros
- confirmar que nenhum passo permite publicacao sem revisao humana
- confirmar que os gates distinguem falha estrutural de revisao pedagogica
- validar que o material-fonte nao aparece como arquivo rastreado pelo Git

## Evidencias esperadas

- documentos dos dois agentes especializados
- politica de gates de atualizacao curricular
- `git status` sem material-fonte rastreado
- referencias no backlog e no roadmap

## Riscos e rollback

O principal risco e transformar interpretacao automatizada em verdade pedagogica. O rollback consiste em manter cada lote separado, reverter o PR do lote e restaurar o conteudo anterior sem tocar na fonte local.
