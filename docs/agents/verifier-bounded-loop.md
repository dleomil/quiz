# Loop limitado do Verifier

O `verifier:loop` executa tarefas de verificacao baseadas em ficha `agent-work-v1` com `role=verifier` e sem caminhos de escrita. Esta ferramenta analisa a ficha, os contratos aceitos e as evidencias fornecidas; nao executa os comandos da ficha nem altera o checkout.

## Limites e conclusao

- Uma resposta `conclusive` sem perguntas abertas encerra a tarefa em uma execucao.
- Se o Verifier marcar `needs_review`, o runner faz uma segunda passagem com a resposta anterior e pede uma revisao critica.
- Duas respostas so convergem quando a segunda e `conclusive` e ambas concordam na decisao e nos IDs/severidades dos achados.
- Se nao houver convergencia, o runner pausa. Um aceite explicito, vinculado ao hash da ficha, libera uma unica extensao de ate duas execucoes. O teto absoluto e quatro.
- Depois da extensao, falta de convergencia ou falha tecnica encerra como inconclusivo. Nao existe nova autorizacao para a mesma tarefa.
- Uma invocacao reservada conta mesmo se a CLI falhar ou for interrompida. O runner pausa; qualquer nova invocacao exige a autorizacao humana do bloco extra. Falhas de preflight ocorrem antes da reserva e permitem repetir o preflight na mesma ficha.

Contradicao entre fonte, requisito e resultado do harness implica `blocked`. Falha da implementacao comprovada e corrigivel dentro do escopo implica `adjustments_required`. O runner nunca transforma desacordo persistente em decisao automatica.

## Uso

Use um perfil dedicado autenticado e uma ficha com contratos versionados e evidencias suficientes:

```sh
npm run verifier:loop -- run --work /caminho/ficha.json --auth-home "$HOME/.codex-quiz-auth"
npm run verifier:loop -- report --task-id <id> --auth-home "$HOME/.codex-quiz-auth"
```

Se o estado for `awaiting_authorization`, o relatorio informa o hash que deve ser aprovado. A autorizacao precisa declarar o mesmo hash e liberar ate duas execucoes:

```sh
npm run verifier:loop -- authorize --task-id <id> --work-sha256 <sha256> --statement "Autorizo ate 2 execucoes adicionais para a ficha SHA-256 <sha256>." --auth-home "$HOME/.codex-quiz-auth"
npm run verifier:loop -- resume --task-id <id> --auth-home "$HOME/.codex-quiz-auth"
```

Ledgers, respostas, recibos e capturas ficam no perfil dedicado, fora do repositorio. A autorizacao local registra a declaracao e o hash, mas nao constitui assinatura criptografica da identidade humana. O runner nao publica resultados, abre PR, altera board, faz merge ou deploy. Esta ferramenta e separada das campanhas de benchmark, que mantem suas regras de tentativa e ausencia de retry.
