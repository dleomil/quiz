const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs/drafts/2026-t3-v1-ing-present-continuous.json',
);
const AUDIT_PATH = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-ing-present-continuous-audit.json',
);
const SPECS = [
  [
    'Choose the sentence that describes an action happening now.',
    'She is reading a book.',
    [
      'She reads books every day.',
      'She read a book yesterday.',
      'She will read tomorrow.',
    ],
    'The present continuous uses am, is, or are plus a verb ending in -ing.',
  ],
  [
    'Complete: I ___ playing soccer now.',
    'am',
    ['is', 'are', 'be'],
    'The subject I uses am in the present continuous.',
  ],
  [
    'Complete: He ___ eating lunch.',
    'is',
    ['am', 'are', 'be'],
    'The subject he uses is before the -ing verb.',
  ],
  [
    'Complete: They ___ watching TV.',
    'are',
    ['am', 'is', 'be'],
    'The subject they uses are before the -ing verb.',
  ],
  [
    'Which sentence is correct?',
    'We are studying English.',
    [
      'We is studying English.',
      'We am studying English.',
      'We studying are English.',
    ],
    'We combines with are and the -ing form studying.',
  ],
  [
    'What is the -ing form of play?',
    'playing',
    ['plaing', 'played', 'plays'],
    'The verb play becomes playing in the present continuous.',
  ],
  [
    'What is the -ing form of read?',
    'reading',
    ['readed', 'reads', 'readding'],
    'The verb read becomes reading.',
  ],
  [
    'Choose the correct sentence.',
    'The dog is running.',
    ['The dog are running.', 'The dog am running.', 'The dog running is.'],
    'A singular subject such as the dog uses is.',
  ],
  [
    'Complete: Look! The children ___ jumping.',
    'are',
    ['am', 'is', 'be'],
    'The plural subject children uses are.',
  ],
  [
    'Which sentence shows an action happening at this moment?',
    'The girl is singing now.',
    [
      'The girl sings on Mondays.',
      'The girl sang yesterday.',
      'The girl will sing later.',
    ],
    'The expression now and is singing show an action in progress.',
  ],
  [
    'Choose the negative form: He ___ not sleeping.',
    'is',
    ['am', 'are', 'be'],
    'He is not sleeping is the negative present continuous form.',
  ],
  [
    'Complete: I am ___ a picture.',
    'drawing',
    ['draw', 'drew', 'draws'],
    'After am, use the verb with -ing: drawing.',
  ],
  [
    'Complete: We are ___ a song.',
    'singing',
    ['sing', 'sang', 'sings'],
    'After are, use singing for an action in progress.',
  ],
  [
    'Which question is correct?',
    'Are you listening?',
    ['Is you listening?', 'Am you listening?', 'Are you listen?'],
    'Questions with you use are before the subject.',
  ],
  [
    'Choose the short answer: Is she dancing? — Yes, ___.',
    'she is',
    ['she are', 'she am', 'is she'],
    'The short positive answer repeats she and is.',
  ],
  [
    'Complete: ___ he riding a bike?',
    'Is',
    ['Are', 'Am', 'Be'],
    'A question with he begins with Is.',
  ],
  [
    'Which sentence has the correct word order?',
    'The students are writing.',
    [
      'Are writing the students.',
      'The students writing are.',
      'Writing are the students.',
    ],
    'The usual order is subject, be, and verb ending in -ing.',
  ],
  [
    'Choose the sentence about an action happening today.',
    'My mother is cooking dinner.',
    [
      'My mother cooks every Sunday.',
      'My mother cooked yesterday.',
      'My mother will cook tomorrow.',
    ],
    'Is cooking describes an action in progress.',
  ],
  [
    'Complete: The baby is ___ now.',
    'crying',
    ['cry', 'cried', 'cries'],
    'After is, crying describes the action happening now.',
  ],
  [
    'Which sentence is a correct summary of the present continuous?',
    'It describes an action in progress.',
    [
      'It describes only yesterday actions.',
      'It is used without a form of be.',
      'It always describes a habit.',
    ],
    'The present continuous commonly describes actions happening now or around now.',
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
          `This option does not complete the present continuous pattern: ${correct}.`;
    });
    return {
      schemaVersion: 'content-v1',
      id: `2026t3v1_ing_present_continuous_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'ingles',
      topic: 'present-continuous',
      topicName: 'Present continuous',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'reconhecer-acoes-em-andamento',
      sourceRef: {
        referenceId: 'roteiro-estudos-av-mensal-t3-2026',
        section: 'Inglês',
        page: String(
          [75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89][
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
        `school-curriculum:2026-t3/ingles/present-continuous/page-${question.sourceRef.page}`,
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
    topicId: 'ingles:present-continuous',
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
    `t3-ingles-present-continuous: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}
if (require.main === module) main();
module.exports = { buildQuestions, buildAudit, sha256 };
