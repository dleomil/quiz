const { validateGeneratedQuestions } = require('./content-delivery.cjs');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { validateQuestion } = require('./validate-content.cjs');
const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs/drafts/2026-t3-v1-ing-present-continuous.json',
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
    'Escolha a frase em inglês que descreve uma ação que está acontecendo agora.',
  ],
  [
    'Complete: I ___ playing soccer now.',
    'am',
    ['is', 'are', 'be'],
    'The subject I uses am in the present continuous.',
    'Complete a frase em inglês: I ___ playing soccer now.',
  ],
  [
    'Complete: He ___ eating lunch.',
    'is',
    ['am', 'are', 'be'],
    'The subject he uses is before the -ing verb.',
    'Complete a frase em inglês: He ___ eating lunch.',
  ],
  [
    'Complete: They ___ watching TV.',
    'are',
    ['am', 'is', 'be'],
    'The subject they uses are before the -ing verb.',
    'Complete a frase em inglês: They ___ watching TV.',
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
    'Qual frase em inglês está correta?',
  ],
  [
    'What is the -ing form of play?',
    'playing',
    ['plaing', 'played', 'plays'],
    'The verb play becomes playing in the present continuous.',
    'Qual é a forma do verbo “play” com a terminação -ing?',
  ],
  [
    'What is the -ing form of read?',
    'reading',
    ['readed', 'reads', 'readding'],
    'The verb read becomes reading.',
    'Qual é a forma do verbo “read” com a terminação -ing?',
  ],
  [
    'Choose the correct sentence.',
    'The dog is running.',
    ['The dog are running.', 'The dog am running.', 'The dog running is.'],
    'A singular subject such as the dog uses is.',
    'Escolha a frase em inglês que está correta.',
  ],
  [
    'Complete: Look! The children ___ jumping.',
    'are',
    ['am', 'is', 'be'],
    'The plural subject children uses are.',
    'Complete a frase em inglês: Look! The children ___ jumping.',
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
    'Qual frase em inglês mostra uma ação acontecendo neste momento?',
  ],
  [
    'Choose the negative form: He ___ not sleeping.',
    'is',
    ['am', 'are', 'be'],
    'He is not sleeping is the negative present continuous form.',
    'Complete a frase negativa em inglês: He ___ not sleeping.',
  ],
  [
    'Complete: I am ___ a picture.',
    'drawing',
    ['draw', 'drew', 'draws'],
    'After am, use the verb with -ing: drawing.',
    'Complete a frase em inglês: I am ___ a picture.',
  ],
  [
    'Complete: We are ___ a song.',
    'singing',
    ['sing', 'sang', 'sings'],
    'After are, use singing for an action in progress.',
    'Complete a frase em inglês: We are ___ a song.',
  ],
  [
    'Which question is correct?',
    'Are you listening?',
    ['Is you listening?', 'Am you listening?', 'Are you listen?'],
    'Questions with you use are before the subject.',
    'Qual pergunta está escrita corretamente em inglês?',
  ],
  [
    'Choose the short answer: Is she dancing? — Yes, ___.',
    'she is',
    ['she are', 'she am', 'is she'],
    'The short positive answer repeats she and is.',
    'Complete a resposta curta em inglês: Is she dancing? — Yes, ___.',
  ],
  [
    'Complete: ___ he riding a bike?',
    'Is',
    ['Are', 'Am', 'Be'],
    'A question with he begins with Is.',
    'Complete a pergunta em inglês: ___ he riding a bike?',
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
    'Qual frase em inglês apresenta a ordem correta das palavras?',
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
    'Escolha a frase em inglês que apresenta uma ação acontecendo hoje.',
  ],
  [
    'Complete: The baby is ___ now.',
    'crying',
    ['cry', 'cried', 'cries'],
    'After is, crying describes the action happening now.',
    'Complete a frase em inglês: The baby is ___ now.',
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
    'Qual alternativa resume corretamente o uso do present continuous?',
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
function buildQuestionsUnchecked() {
  const questions = SPECS.map(
    ([question, correct, wrong, explanation, questionPt], index) => {
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
        questionPt,
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
        version: 2,
      };
    },
  );
  const errors = questions.flatMap((question) =>
    validateQuestion(question, 'ingles'),
  );
  if (errors.length) throw new Error(errors.join('\n'));
  return questions;
}
function buildQuestions(...args) {
  return validateGeneratedQuestions(buildQuestionsUnchecked(...args));
}

function main() {
  const questions = buildQuestions();
  fs.mkdirSync(path.dirname(DRAFT_PATH), { recursive: true });
  fs.writeFileSync(
    DRAFT_PATH,
    `${JSON.stringify({ schemaVersion: 'content-draft-v1', contentSetId: '2026-t3-v1', questions }, null, 2)}\n`,
  );
  process.stdout.write(
    `t3-ingles-present-continuous: ok (${questions.length} questoes com apoio em portugues; revisao deve ser registrada separadamente)\n`,
  );
}
if (require.main === module) main();
module.exports = { buildQuestions, sha256 };
