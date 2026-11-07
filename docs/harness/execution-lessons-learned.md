# Lições Operacionais da Execução

## Objetivo

Registrar os erros concretos observados na execucao recente e transformar cada um deles em regra reutilizavel do harness.

## Lições aprendidas

### 1. Testes novos tambem obedecem o contrato de lint

- arquivos novos de teste que usam globals do browser ou do app precisam declarar esses nomes explicitamente ou seguir a configuracao de lint do projeto
- falha de `no-undef` em teste novo e erro de qualidade, nao detalhe operacional
- o Verifier Agent deve rodar lint antes de considerar a entrega pronta

### 2. O GitHub CLI deve ser usado com sintaxe verificada

- cada subcomando pode ter flags proprias e incompatibilidades
- quando houver duvida, o agente deve consultar `--help` ou a documentacao oficial antes de escrever comentario, issue ou PR
- para corpos longos, o caminho seguro e usar arquivo Markdown real em vez de string com escapes

### 3. O board precisa de consistencia entre campos

- em Project com mais de um campo de progresso, `Status` e `Workflow` devem refletir o mesmo momento do trabalho
- o agente deve localizar o item e confirmar os campos antes de mover
- apos a edicao, o estado do board precisa ser verificado novamente

### 4. O merge segue a regra real da branch

- antes de tentar merge, o agente deve ler as protecoes reais da branch alvo
- se `require_last_push_approval` ou aprovacao minima bloquear o merge e nao houver segundo revisor, o ajuste temporario deve ser minimo e revertido imediatamente depois
- a excecao precisa ficar registrada no comentario do PR ou da issue

### 5. Comentarios e evidencias devem usar Markdown real

- nunca registrar comentario com `\n` literal como se fosse Markdown
- comentarios longos devem ir por `--body-file` ou equivalente
- o formato final deve ser legivel no GitHub sem dependencias de escape

### 6. Crases Markdown nao podem atravessar o shell em corpo inline

- crases usadas para codigo inline podem ser interpretadas como substituicao de
  comando pelo shell e remover trechos do requisito
- todo corpo multilinha ou com crases deve ser enviado por `--body-file`
- apos criar ou editar issue, PR ou comentario, o agente deve reler o texto
  publicado antes de executar a proxima acao

### 7. Falha de preflight nao e medida de qualidade do modelo

- na revisao de #404, oito tentativas nao produziram propostas porque o host
  de Code Mode estava desativado; classifica-las como baixa qualidade do modelo
  mistura defeito de ambiente com defeito de saida
- controles validos bloqueados sem evento de ferramenta devem ser comparados
  com as provas de preflight e captura; preservar os resultados originais e
  registrar a reclassificacao humana sem recalcular o benchmark
- validar capacidades do host antes de consumir tentativas e manter o limite
  aprovado; falha nao autoriza repeticao nem aumento automatico do orcamento

### 8. Mudanca normativa invalida contexto e aprovacao anteriores

- o executor deve receber o texto completo dos contratos fixados, nao apenas
  seus caminhos ou um resumo
- se o hash de um contrato mudar, bloquear antes da chamada ao modelo e exigir
  novo vinculo e aceite; a revisao nao pode ser inferida do estado anterior
- apos alterar documento catalogado, executar `npm run documents:sync` e
  `npm run validate:documents` antes da suite completa e da abertura do PR

### 9. O board so conclui trabalho integrado

- validacao e parecer favoravel permitem aguardar o merge, mas nao significam
  que a entrega ja foi integrada
- registrar `Ready` ou `In Review` antes do merge e marcar `Done` somente depois
  da integracao confirmada, mantendo `Status` e `Workflow` alinhados

## Uso esperado

Este documento nao substitui `agent-operational-guardrails.md` nem o modelo operacional dos agentes. Ele existe para manter os erros reais visiveis e para orientar ajustes futuros no harness.
