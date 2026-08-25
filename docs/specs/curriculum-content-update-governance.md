# Spec: Governanca para Atualizacao de Conteudo Curricular

## Contexto

A escola forneceu material curricular local para orientar novas provas. O quiz atende criancas e, por isso, a atualizacao precisa prevenir erro ortografico, resposta ambigua, explicacao confusa e desvio do objetivo pedagogico.

## Escopo

- definir agentes especializados em curadoria e qualidade pedagogica
- definir gates para tema, linguagem, ambiguidade e aprovacao humana
- preparar a validacao automatica estrutural do banco de questoes
- preservar o material-fonte fora do repositorio ate haver autorizacao de versionamento

## Nao objetivos

- nao importar ou alterar questoes nesta etapa
- nao publicar o material-fonte da escola
- nao substituir revisao humana por automacao
- nao mudar o fluxo do quiz para o aluno

## Requisitos

- cada lote deve ter ano, trimestre, serie, materia, tema, habilidade e versao
- cada questao deve ter uma unica resposta correta e alternativas nao ambiguas
- enunciado, alternativas e explicacoes devem passar por revisao linguistica e pedagogica
- cada lote deve ter aprovacao humana pedagogica antes da implementacao
- um validador automatizado futuro deve rejeitar inconsistencias estruturais

## Spec obrigatoria de cobertura curricular

Toda atualizacao de conteudo, para qualquer ano letivo ou trimestre, deve criar
uma spec de cobertura antes da curadoria. A spec e o contrato de completude do
acervo e deve registrar:

- ano, trimestre, serie e `contentSetId` pretendido;
- cada tema curricular autorizado para a materia;
- objetivo de aprendizagem verificavel para cada tema;
- meta de **20 questoes originais por tema**;
- lotes planejados e quantidade acumulada por tema;
- criterio de publicacao e plano de rollback.

O intake deve usar `docs/specs/curriculum-intake-template.md`. O manifesto nasce
como `awaiting-source`, passa por `under-review` durante a extracao e somente
autoriza curadoria quando estiver `frozen` com aprovacao do Product Owner.
Mudancas posteriores seguem o controle de versao do template e reabrem os gates
dos temas afetados.

Paginas de apostila nao fazem parte do contrato de cobertura. Um tema pode ser
curado sem material escolar local quando for possivel criar conteudo original,
factualmente verificavel e adequado a serie. A falta de uma pagina nao e motivo
isolado para bloquear o trabalho; ambiguidades do proprio tema continuam sendo
avaliadas pelo gate pedagogico.

A meta de 20 e aplicada por tema, nao por materia. O total da disciplina e a
soma dos seus temas e pode ser maior ou menor que 150.

Um acervo novo so pode mudar para `published` quando todos os temas declarados
na sua spec tiverem exatamente 20 questoes aprovadas. Lotes parciais podem ser
mantidos em `draft`, mas nao podem ser apresentados ao aluno como trimestre
completo.

## Criterios de aceite

- existem agentes documentados para curadoria e qualidade pedagogica
- existe politica de gates de conteudo no harness
- existe fluxo claro da fonte ate a publicacao
- o material em `SchoolContent/` esta protegido contra commit acidental
- a proxima alteracao de conteudo pode nascer de uma spec rastreavel
- existe uma spec de cobertura para todo novo ano ou trimestre
- existe template de intake com estados, checklist e controle de mudanca

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
