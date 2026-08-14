# Guardrails Operacionais dos Agentes

## Objetivo

Consolidar os erros operacionais encontrados nas execucoes dos agentes em regras praticas para reduzir retrabalho, falhas evitaveis e interrupcoes no fluxo.

## Problemas observados

- nome de branch fora da politica de governance
- label inexistente no repositorio
- parametros incompletos ao atualizar o Project
- uso de endpoint errado para ajustes temporarios de branch protection
- ausencia de preflight antes de criar ou mover itens
- novo arquivo de teste sem declaracao de globals exigida pelo lint do repositorio
- uso de flags incorretas em comandos do GitHub CLI
- divergencia entre os campos `Status` e `Workflow` do Project
- merge bloqueado por regra de aprovacao sem segundo revisor disponivel

## Guardrails

### 1. Validar politica de branch antes de criar PR

- verificar se o nome da branch respeita o workflow existente
- usar apenas prefixos aceitos pelo repositório
- evitar criar branches sem referencia ao tipo de trabalho

### 2. Validar taxonomia antes de criar issue

- listar labels existentes antes de definir a classificacao
- nao assumir nomes novos sem confirmar padrao do projeto
- reutilizar labels ja aprovadas sempre que possivel

### 3. Validar board antes de mover item

- localizar o item no Project antes de editar
- confirmar os campos e opcoes existentes
- registrar o estado real do item sem inventar workflow ou status

### 4. Validar protecao de branch antes de ajuste temporario

- usar o endpoint correto do GitHub
- alterar o minimo necessario
- restaurar a protecao imediatamente apos o merge

### 5. Exigir preflight do agente

Antes de qualquer acao de escrita, o agente deve confirmar:

- qual e a branch alvo
- quais labels existem
- qual issue ou PR e a fonte da verdade
- qual item do Project sera atualizado
- qual validacao precisa ser executada

### 6. Validar o contrato de lint de arquivos novos

- todo novo teste que use globals do browser ou do app deve declarar esses nomes explicitamente ou seguir a configuracao de lint do projeto
- o agente deve rodar lint local antes de abrir PR quando adicionar ou alterar testes
- falha de lint em arquivo novo nunca deve ser tratada como detalhe menor

### 7. Validar sintaxe exata das ferramentas

- confirmar a sintaxe do subcomando antes de escrever comentario, issue, PR ou acao de board
- usar `--help` ou a documentacao oficial do comando quando houver duvida
- preferir arquivos Markdown reais para corpos longos e evitar strings com escapes que quebram a formatacao

### 8. Validar paridade do board e da governanca de merge

- quando o Project usar mais de um campo de estado, atualizar todos os campos relevantes de forma coerente
- antes do merge, revisar a regra real de aprovacao e last push approval da branch alvo
- se for necessario ajuste temporario de branch protection, reduzir apenas o minimo necessario e restaurar imediatamente apos o merge

### 9. Controlar descoberta de produto assistida

- iniciar pesquisa somente com pergunta, publico e decisao delimitados
- pesquisar novamente qualquer informacao que possa ter mudado
- registrar fonte e data de consulta para cada fato relevante
- separar fato, inferencia, hipotese e recomendacao
- bloquear contextos que contenham dados identificaveis de criancas
- nao copiar conteudo ou propriedade intelectual de alternativas analisadas
- exigir decisao do Product Owner antes de criar ou priorizar backlog

## Regra de operacao

Se qualquer uma dessas verificacoes falhar, o agente deve parar e pedir esclarecimento ou buscar a informacao correta antes de seguir.

## Resultado esperado

- menos falhas de setup
- menos PRs bloqueados por detalhes operacionais
- board mais consistente
- menos intervencoes manuais para corrigir erro repetido
