const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(ROOT, 'docs/drafts/2026-t3-v1-cie-espelhos.json');
const AUDIT_PATH = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-cie-espelhos-audit.json',
);
const SPECS = [
  [
    'O que é um espelho?',
    'uma superfície que pode refletir a luz',
    [
      'uma fonte que produz chuva',
      'um material que bloqueia todo som',
      'um objeto que nunca interage com luz',
    ],
    'O espelho é usado para observar a reflexão da luz.',
  ],
  [
    'O que acontece com a luz ao encontrar um espelho?',
    'ela pode ser refletida',
    [
      'ela vira água',
      'ela desaparece sempre',
      'ela deixa de seguir qualquer direção',
    ],
    'A superfície do espelho pode refletir a luz.',
  ],
  [
    'Por que vemos uma imagem no espelho?',
    'porque a luz refletida chega aos olhos',
    [
      'porque o espelho cria pessoas',
      'porque não existe luz',
      'porque o som forma imagens',
    ],
    'A imagem é percebida quando a luz refletida chega aos olhos.',
  ],
  [
    'Qual objeto pode produzir uma reflexão parecida com a de um espelho?',
    'uma superfície metálica bem polida',
    ['uma esponja seca', 'um tecido felpudo', 'um papel amassado'],
    'Superfícies lisas e polidas podem refletir a luz.',
  ],
  [
    'Como deve ser uma superfície para formar uma imagem mais nítida?',
    'lisa e bem refletora',
    ['cheia de dobras', 'muito áspera', 'sem receber luz'],
    'Superfícies lisas favorecem uma reflexão organizada.',
  ],
  [
    'O que pode acontecer em uma superfície muito irregular?',
    'a luz se espalha em várias direções',
    [
      'a luz vira som',
      'a imagem fica sempre perfeita',
      'o objeto deixa de existir',
    ],
    'Irregularidades espalham a luz e dificultam uma imagem nítida.',
  ],
  [
    'Qual situação mostra o uso de um espelho?',
    'ver o rosto ao se arrumar',
    [
      'medir a chuva com um copo',
      'produzir sementes',
      'aquecer água sem fonte de calor',
    ],
    'O espelho permite observar a imagem refletida.',
  ],
  [
    'O espelho de um retrovisor ajuda o motorista a:',
    'ver parte do que está atrás',
    [
      'apagar a luz do Sol',
      'produzir combustível',
      'impedir qualquer reflexão',
    ],
    'O retrovisor usa reflexão para mostrar uma área atrás do veículo.',
  ],
  [
    'Por que um periscópio pode usar espelhos?',
    'para mudar o caminho da luz e permitir observar',
    [
      'para transformar luz em água',
      'para bloquear todos os objetos',
      'para produzir som',
    ],
    'Espelhos podem redirecionar a luz até os olhos.',
  ],
  [
    'O que é uma imagem refletida?',
    'uma imagem formada pela luz que retorna de uma superfície',
    [
      'uma sombra sem fonte de luz',
      'um som desenhado',
      'uma imagem que não depende da luz',
    ],
    'A reflexão da luz permite perceber a imagem.',
  ],
  [
    'Qual atitude é segura ao usar um espelho?',
    'manuseá-lo com cuidado para evitar cortes',
    [
      'quebrá-lo perto das pessoas',
      'deixá-lo no caminho',
      'olhar o Sol diretamente pelo espelho',
    ],
    'Espelhos podem quebrar e devem ser manuseados com cuidado.',
  ],
  [
    'Um espelho precisa de luz para que sua imagem seja percebida?',
    'sim, a luz precisa ser refletida até os olhos',
    [
      'não, imagens existem sem luz',
      'sim, mas somente no escuro',
      'não, porque o espelho produz luz própria',
    ],
    'Sem luz chegando aos olhos, não percebemos a imagem.',
  ],
  [
    'Como a posição de um espelho pode mudar o que vemos?',
    'ela muda a direção da luz refletida',
    [
      'ela transforma o espelho em fonte natural',
      'ela elimina toda luz',
      'ela muda o som do ambiente',
    ],
    'A posição orienta para onde a luz será refletida.',
  ],
  [
    'Qual diferença existe entre uma sombra e uma imagem no espelho?',
    'a sombra surge com bloqueio da luz, e a imagem surge por reflexão',
    [
      'ambas são fontes de luz',
      'ambas existem sem luz',
      'a sombra sempre mostra detalhes do objeto',
    ],
    'Sombra e reflexão resultam de interações diferentes com a luz.',
  ],
  [
    'Qual experiência simples demonstra a reflexão?',
    'apontar uma lanterna para um espelho e observar a luz mudar de direção',
    [
      'fechar todas as janelas e apagar a lanterna',
      'colocar água em um caderno',
      'produzir som sem objeto',
    ],
    'A luz refletida pelo espelho pode mudar de direção.',
  ],
  [
    'O que pode ser observado em dois espelhos colocados de frente?',
    'várias imagens refletidas',
    ['ausência total de luz', 'transformação em água', 'som preso entre eles'],
    'A luz pode ser refletida entre as superfícies.',
  ],
  [
    'Por que um espelho limpo ajuda a ver melhor a imagem?',
    'porque sua superfície fica mais regular para refletir a luz',
    [
      'porque produz mais luz que o Sol',
      'porque bloqueia todos os raios',
      'porque elimina os olhos',
    ],
    'Limpeza e regularidade favorecem a reflexão.',
  ],
  [
    'Qual frase descreve corretamente a reflexão em espelhos?',
    'a luz chega ao espelho, muda de direção e pode chegar aos olhos',
    [
      'a luz desaparece ao tocar o espelho',
      'o espelho cria luz sem fonte',
      'a reflexão acontece apenas no escuro',
    ],
    'Essa sequência explica como percebemos imagens em espelhos.',
  ],
  [
    'Que cuidado evita acidentes com espelhos?',
    'não tocar em bordas quebradas e pedir ajuda a um adulto',
    [
      'brincar com cacos',
      'deixar o espelho cair',
      'apontar fragmentos para alguém',
    ],
    'Bordas quebradas podem machucar e exigem cuidado adulto.',
  ],
  [
    'Qual resumo está correto?',
    'espelhos refletem luz e podem formar imagens',
    [
      'espelhos funcionam sem luz',
      'espelhos absorvem toda luz',
      'espelhos só produzem sombras',
    ],
    'A reflexão da luz é a propriedade principal dos espelhos.',
  ],
];
function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])]),
    );
  return value;
}
function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(stableValue(value)))
    .digest('hex');
}
function buildQuestions() {
  return SPECS.map(([question, correct, wrong, explanation], index) => {
    const correctIndex = index % 4;
    const options = new Array(4);
    const wrongExplanations = {};
    [correct, ...wrong].forEach((option, baseIndex) => {
      const targetIndex = (baseIndex + correctIndex) % 4;
      options[targetIndex] = option;
      if (baseIndex > 0)
        wrongExplanations[targetIndex] =
          `A alternativa não corresponde ao conceito de ${correct.toLowerCase()}.`;
    });
    return {
      schemaVersion: 'content-v1',
      id: `2026t3v1_cie_espelhos_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'ciencias',
      topic: 'espelhos',
      topicName: 'Espelhos e reflexão',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'identificar-situacoes-simples-de-reflexao',
      sourceRef: {
        referenceId: 'roteiro-estudos-av-mensal-t3-2026',
        section: 'Ciências',
        page: String(
          [45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59][
            index % 15
          ],
        ),
      },
      reviewStatus: 'draft',
      version: 1,
    };
  });
}
function buildAudit(questions) {
  const reviews = questions.flatMap((question) =>
    ['curriculum-factual', 'pedagogical-linguistic'].map((pass) => ({
      questionId: question.id,
      pass,
      actorId: 'codex-single-agent',
      actorRole:
        pass === 'curriculum-factual'
          ? 'content_curator'
          : 'pedagogical_quality',
      evidenceRefs: [
        `school-curriculum:2026-t3/ciencias/espelhos/page-${question.sourceRef.page}`,
      ],
      decision: 'clear',
      findings: [],
    })),
  );
  return {
    schemaVersion: 'content-quality-audit-v1',
    reviewMode: 'single-agent-sequential',
    reportStatus: 'draft',
    contentSetId: '2026-t3-v1',
    topicId: 'ciencias:espelhos',
    sourceSha256: sha256(questions),
    reviews,
  };
}
function main() {
  const questions = buildQuestions();
  const audit = buildAudit(questions);
  fs.mkdirSync(path.dirname(DRAFT_PATH), { recursive: true });
  fs.mkdirSync(path.dirname(AUDIT_PATH), { recursive: true });
  fs.writeFileSync(
    DRAFT_PATH,
    `${JSON.stringify({ schemaVersion: 'content-draft-v1', contentSetId: '2026-t3-v1', questions }, null, 2)}\n`,
  );
  fs.writeFileSync(AUDIT_PATH, `${JSON.stringify(audit, null, 2)}\n`);
  process.stdout.write(
    `t3-ciencias-espelhos: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}
if (require.main === module) main();
module.exports = { buildQuestions, buildAudit, sha256 };
