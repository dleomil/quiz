# História T3: correção de idioma, versão 2

Incidente: [#389](https://github.com/dleomil/quiz/issues/389).
Tema: `imigrantes-portugueses-espanhois`; público: 3º ano do Ensino Fundamental.

## Estado da revisão

Revisão do autor realizada na sessão principal, em duas passagens separadas:
factual/pedagógica e linguística. Não é parecer de um agente independente nem
aprovação humana. O aceite editorial humano do pacote corrigido permanece
pendente antes da publicação.

A auditoria `2026-t3-v1-his-imigrantes-ibericos-audit.json` foi preservada sem
alterações como evidência histórica. Seus 40 registros `clear` foram criados
pelo gerador da versão 1 e não comprovam uma revisão efetiva. Não aprovam a
versão 2. O gerador corrigido grava somente o rascunho e não emite pareceres.

## Passagem factual e pedagógica

Foram examinados enunciado, resposta, três distratores, explicação e os três
feedbacks de cada questão. Os IDs e objetivos existentes foram preservados;
as questões corrigidas têm versão 2 e feedbacks específicos por alternativa.
Não houve ampliação de temas nem inclusão de datas ou fatos novos sobre grupos
de imigrantes. As referências curriculares são as já existentes; a fonte escolar
não foi publicada nem transcrita nesta revisão.

| Final do ID | Verificação e ajuste                                                                                                                                                  |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 001         | Imigração distingue chegada a outro país para morar de turismo e mudança de bairro. A definição anterior era ampla demais.                                            |
| 002         | Nacionalidades correspondem a Portugal e Espanha; cada par incorreto contém ao menos um país incompatível.                                                            |
| 003         | A busca por trabalho é apresentada como motivo de parte dos imigrantes, sem generalizar para todos.                                                                   |
| 004         | Distingue práticas e conhecimentos compartilhados de objetos transportados na bagagem.                                                                                |
| 005         | A origem em comum não implica trajetórias iguais.                                                                                                                     |
| 006         | O compartilhamento de uma receita exemplifica a contribuição cultural; as outras situações tratam de medidas e planejamento.                                          |
| 007         | O conjunto correto reúne práticas culturais; os demais reúnem medidas, condições do tempo ou dados de passagens.                                                      |
| 008         | A nacionalidade não determina uma única profissão.                                                                                                                    |
| 009         | Um relato familiar não permite conclusões sobre todas as pessoas da mesma nacionalidade.                                                                              |
| 010         | A convivência pode envolver trocas e conflitos, sem pressupor harmonia automática ou participação unilateral.                                                         |
| 011         | Uma comunidade não exige sobrenome, nacionalidade ou profissão iguais.                                                                                                |
| 012         | Registros e relatos preservam memórias. O distrator sobre fotografias passou a tratar da remoção de nomes e datas, evitando condenar o simples ato de guardar fotos.  |
| 013         | Fontes documentais e relatos são distintos de palpites e invenções. Foi removido um distrator sobre aparência da casa, que também poderia oferecer pistas históricas. |
| 014         | Sobrenome é uma pista a investigar; não prova sozinho a trajetória familiar ou a imutabilidade dos nomes.                                                             |
| 015         | Integração admite participação social e manutenção da identidade cultural, sem exigir apagamento cultural.                                                            |
| 016         | Ouvir e reconhecer diferenças evita estereótipos e humilhação por sotaque.                                                                                            |
| 017         | Receitas podem transmitir memórias e mudar com trocas culturais; não revelam sozinhas toda uma viagem.                                                                |
| 018         | Explica por que não se deve generalizar nem selecionar apenas relatos iguais.                                                                                         |
| 019         | A presença histórica envolve diferentes pessoas e experiências, antes e depois da chegada.                                                                            |
| 020         | A síntese reconhece experiências e contribuições diversas.                                                                                                            |

## Passagem linguística

Os 20 enunciados, as 80 alternativas, as 20 explicações e os 60 feedbacks foram
relidos em português brasileiro. Foram examinados acentuação, concordância,
naturalidade, clareza dos referentes e adequação ao 3º ano. As instruções não
exigem conhecimento de inglês; termos como imigração, integração e contribuição
cultural recebem explicação no próprio lote. Foram substituídos distratores
absurdos e feedbacks genéricos por textos ligados à alternativa escolhida.

## Evidência técnica e limites

- SHA-256 das questões corrigidas do rascunho, com a serialização estável do
  gerador: `de2f3f93b46913be29dfb69f4c3c7ceca0dabfc9080f110e9afeca766582e0bb`.
- `npm run verify:local` concluído com sucesso: suíte integral, lint, formatação
  e integridade do diff. Os testes de navegador foram executados fora do sandbox
  para permitir o servidor local e o Chromium.
- O arquivo público anterior foi comparado com `main` e contém as 20 questões
  em inglês; SHA-256 do arquivo: `efa6c346744adaadb4372ad72c1414f208de3cefc9f432a98b0d4e2b0c9b538c`.
- A nova validação rejeita as 20 questões desse arquivo anterior. O teste inclui
  uma questão original como fixture e injeta inglês isoladamente em cada campo
  visível, inclusive cada alternativa e cada feedback.
- A verificação automatizada detecta padrões ingleses deste incidente em
  História T2/T3; não é um detector universal de idiomas e não substitui revisão.
- A suíte do lote compara gerador, rascunho e runtime, valida 20 IDs, versão 2,
  distribuição 5/5/5/5 e três feedbacks distintos. Executa o gerador em diretório
  temporário e comprova que nenhuma auditoria é produzida.
- O teste de navegador percorre as 20 questões e suas quatro respostas em
  desktop e celular: 160 respostas, seleção do tema, explicações, feedbacks e
  ausência de rolagem horizontal.
- T1 permanece fora do escopo. As demais questões publicadas não foram alteradas.

## Publicação e reversão

Release isolado de `main`, em modo protegido, sem promover o pacote pendente de
`develop`. Os manifestos apontam para `release/correcao-idioma-historia`.
O endereço do arquivo de runtime no HTML muda para `t3-published.js?v=2`.

Publicar somente após aceite editorial humano, validações locais, checks remotos
e preview. Depois, conferir a versão 2 no endereço público e reconciliar `main`
em `develop`. Reversão por PR revertendo o merge se houver regressão bloqueante;
essa reversão restaura o problema de idioma e exige nova contenção.
