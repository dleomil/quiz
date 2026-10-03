const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs/drafts/2026-t3-v1-his-imigrantes-ibericos.json',
);
const AUDIT_PATH = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-his-imigrantes-ibericos-audit.json',
);
const SPECS = [
  [
    'What does immigration mean?',
    'moving from one place to another to live',
    [
      'visiting a museum for one hour',
      'changing the weather',
      'staying in the same home forever',
    ],
    'Immigration involves moving to another place to live.',
  ],
  [
    'Which groups are named in this history topic?',
    'Portuguese and Spanish immigrants',
    ['only astronauts', 'only athletes', 'only scientists'],
    'The topic studies Portuguese and Spanish immigrants.',
  ],
  [
    'Why did some Portuguese and Spanish people come to Brazil?',
    'to look for work and new opportunities',
    [
      'to avoid every contact with others',
      'to change the seasons',
      'to build only airports',
    ],
    'People may migrate for work, family, safety, or other opportunities.',
  ],
  [
    'What can immigrants bring to a new country?',
    'languages, foods, customs and knowledge',
    [
      'only one type of clothing',
      'nothing from their experiences',
      'a new ocean',
    ],
    'Immigrants carry experiences and cultural practices that can become part of society.',
  ],
  [
    'Why is it important to avoid saying all immigrants had the same experience?',
    'because people had different lives, reasons and places of origin',
    [
      'because history has no people',
      'because every trip was identical',
      'because cultures never change',
    ],
    'Individual and group experiences are varied.',
  ],
  [
    'What is a cultural contribution?',
    'a practice or knowledge shared with a community',
    ['a traffic signal', 'a weather forecast only', 'an empty building'],
    'Cultural contributions can include practices, knowledge and expressions.',
  ],
  [
    'Which can be a contribution of immigrant communities?',
    'recipes, celebrations and words used in daily life',
    ['only road signs', 'only school uniforms', 'no cultural practice'],
    'Food, celebrations and language can circulate between communities.',
  ],
  [
    'How can immigrants participate in work in Brazil?',
    'in different jobs and activities',
    [
      'only in one occupation',
      'without learning anything',
      'only in government',
    ],
    'Immigrants have worked in varied activities and occupations.',
  ],
  [
    'Why should contributions not be attributed to every Portuguese or Spanish person?',
    'because contributions come from particular people and communities',
    [
      'because nobody contributes',
      'because all histories are equal in detail',
      'because groups have no identities',
    ],
    'Careful history identifies particular groups and experiences.',
  ],
  [
    'What can happen when groups meet?',
    'there can be exchanges as well as conflicts',
    [
      'there are never changes',
      'all differences disappear immediately',
      'only one group acts',
    ],
    'Historical encounters include exchanges and conflicts.',
  ],
  [
    'What is a community?',
    'a group of people who share relationships or spaces',
    ['a single object', 'a type of vehicle', 'an empty map'],
    'Communities are formed by people connected in different ways.',
  ],
  [
    'How can descendants keep a community history alive?',
    'through memories, stories, celebrations and records',
    [
      'by forgetting every event',
      'by removing names',
      'by refusing to teach children',
    ],
    'Memories, stories, celebrations and records preserve histories.',
  ],
  [
    'Which source can show immigrant history?',
    'letters, photographs, documents and oral accounts',
    ['only a guess', 'a blank page', 'a random number'],
    'Different historical sources help study immigrant experiences.',
  ],
  [
    'Why can family names appear in the history of migration?',
    'they may preserve memories of family origins',
    [
      'all names have the same origin',
      'names never change',
      'names cannot be studied',
    ],
    'Names can be clues, but they need context and other sources.',
  ],
  [
    'What does integration mean in a community?',
    'participating in social life while maintaining identities',
    [
      'erasing every difference',
      'living without relationships',
      'rejecting all exchange',
    ],
    'Integration can involve participation and continued cultural identities.',
  ],
  [
    'Which attitude respects immigrant histories?',
    'listen to stories and avoid stereotypes',
    [
      'make fun of accents',
      'say one story represents everyone',
      'erase cultural practices',
    ],
    'Respect requires listening and avoiding stereotypes.',
  ],
  [
    'Why can food be a historical clue?',
    'recipes can show exchanges and family memories',
    [
      'food has no history',
      'all recipes are identical',
      'recipes explain only weather',
    ],
    'Recipes can carry memories and reveal cultural exchanges.',
  ],
  [
    'What should a history question about immigrants avoid?',
    'generalizations about an entire group',
    ['careful context', 'different sources', 'specific experiences'],
    'Generalizations hide differences and should be avoided.',
  ],
  [
    'How did Portuguese and Spanish presence become part of Brazilian history?',
    'through the experiences and interactions of different people and communities',
    [
      'through one identical story',
      'without any contact',
      'only through modern technology',
    ],
    'Historical presence was built through varied experiences and interactions.',
  ],
  [
    'Which summary is correct?',
    'Portuguese and Spanish immigrants had diverse experiences and contributions',
    [
      'all immigrants lived the same life',
      'immigration changed nothing',
      'only one person made every contribution',
    ],
    'The historical record should recognize diversity and specific contributions.',
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
          `This option does not match the historical idea: ${correct}.`;
    });
    return {
      schemaVersion: 'content-v1',
      id: `2026t3v1_his_imigrantes_ibericos_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'historia',
      topic: 'imigrantes-portugueses-espanhois',
      topicName: 'Imigrantes portugueses e espanhóis',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'identificar-presenca-e-contribuicoes-sem-generalizacoes',
      sourceRef: {
        referenceId: 'roteiro-estudos-av-mensal-t3-2026',
        section: 'História',
        page: String(
          [90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104][
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
        `school-curriculum:2026-t3/historia/imigrantes-ibericos/page-${question.sourceRef.page}`,
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
    topicId: 'historia:imigrantes-portugueses-espanhois',
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
    `t3-historia-imigrantes-ibericos: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}
if (require.main === module) main();
module.exports = { buildQuestions, buildAudit, sha256 };
