# Matriz de Decisao do Reviewer Agent

## Objetivo

Padronizar como o Reviewer Agent classifica um PR depois de verificar spec, validacao, evidencias e risco.

## Entradas consideradas

- existe spec associada
- os criterios de aceite estao claros
- os testes e validacoes foram executados
- as evidencias estao anexadas
- a politica de branch e revisao foi respeitada

## Decisoes

### Aprovado para merge

Use quando:

- o PR bate com a spec
- as evidencias estao completas
- o risco de merge e baixo
- nao ha pendencias tecnicas ou documentais

### Ajustes necessarios

Use quando:

- falta evidencia
- falta cobertura de criterio de aceite
- ha desalinhamento parcial com a spec
- existe ajuste pequeno antes de seguir

### Bloqueado

Use quando:

- nao existe spec valida
- nao existe validacao minima
- o PR introduz risco alto ou escopo novo
- a governanca do repositorio impede o passo atual

## Regras de aplicacao

- o Reviewer Agent nao transforma bloqueio em aprovacao por conveniencia
- o parecer deve sempre citar o motivo principal da decisao
- a decisao deve ser curta, objetiva e rastreavel

## Saida padrao

```text
Conclusao:
Categoria:
Motivo principal:
Pendencias:
Evidencias verificadas:
Proxima acao:
```

## Exemplo de leitura

- `Aprovado para merge` significa pronto para seguir a governanca normal do repositorio.
- `Ajustes necessarios` significa que o PR pode voltar para o autor com escopo pequeno.
- `Bloqueado` significa que o PR nao deve avançar ate a causa raiz ser resolvida.
