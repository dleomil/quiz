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

## Uso esperado

Este documento nao substitui `agent-operational-guardrails.md` nem o modelo operacional dos agentes. Ele existe para manter os erros reais visiveis e para orientar ajustes futuros no harness.
