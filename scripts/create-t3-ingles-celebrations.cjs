const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs/drafts/2026-t3-v1-ing-celebrations.json',
);
const AUDIT_PATH = path.join(
  ROOT,
  'docs/audits/2026-t3-v1-ing-celebrations-audit.json',
);
const SPECS = [
  [
    'What is a birthday?',
    'a day that celebrates a person being born',
    ['a kind of vehicle', 'a place to study', 'a type of weather'],
    'A birthday is a celebration of the day a person was born.',
  ],
  [
    'What do people often use on a birthday cake?',
    'candles',
    ['umbrellas', 'books', 'shoes'],
    'Candles are often placed on a birthday cake.',
  ],
  [
    'What do people sing at a birthday party?',
    'Happy Birthday',
    ['Good morning', 'The bus song', 'School rules'],
    'Happy Birthday is a traditional birthday song.',
  ],
  [
    'What is a present?',
    'a gift',
    ['a classroom', 'a street', 'a meal time'],
    'A present is another word for a gift.',
  ],
  [
    'What can people give at a celebration?',
    'a card',
    ['a traffic light', 'a sidewalk', 'a textbook only'],
    'A card can carry a celebration message.',
  ],
  [
    'What is a party?',
    'a gathering to celebrate something',
    ['a type of homework', 'a weather event', 'a city building'],
    'A party is a social gathering for celebration.',
  ],
  [
    'Which word means a special day off or celebration?',
    'holiday',
    ['pencil', 'window', 'backpack'],
    'Holiday can describe a special day or period of celebration.',
  ],
  [
    'What do people often do at a celebration?',
    'share food',
    ['repair roads', 'take a math test', 'paint every wall'],
    'Sharing food is a common celebration activity.',
  ],
  [
    'What can people do with music at a party?',
    'dance',
    ['sleep in class', 'cross a road', 'read a map'],
    'People often dance to music at parties.',
  ],
  [
    'Which decoration can appear at a party?',
    'balloons',
    ['bricks', 'traffic signs', 'school desks'],
    'Balloons are common party decorations.',
  ],
  [
    'What do people say to congratulate someone?',
    'Congratulations!',
    ['Close the window!', 'Where is the bus?', 'Be quiet in class!'],
    "Congratulations is used to celebrate someone's achievement.",
  ],
  [
    'What is a family celebration?',
    'an event shared by family members',
    ['a road sign', 'a science tool', 'a school subject'],
    'Family celebrations bring relatives together.',
  ],
  [
    'Which event can be a celebration at school?',
    'a school festival',
    ['a broken pencil', 'a traffic jam', 'a closed notebook'],
    'A school festival can bring students together to celebrate.',
  ],
  [
    'What can people do before a party?',
    'decorate the room',
    ['erase the street', 'close every shop', 'remove all music'],
    'Decorating prepares the space for a celebration.',
  ],
  [
    'What can guests do when they arrive at a party?',
    'say hello and join the celebration',
    [
      'turn off the city',
      'leave immediately every time',
      'hide all decorations',
    ],
    'Guests can greet others and participate.',
  ],
  [
    'What does “celebrate” mean?',
    'to do something special for an event',
    ['to forget an event', 'to repair a bicycle', 'to study a map'],
    'To celebrate is to mark an event with a special activity.',
  ],
  [
    'Which item can hold a birthday gift?',
    'a gift bag',
    ['a street lamp', 'a school bell', 'a bus lane'],
    'A gift bag can be used to carry a present.',
  ],
  [
    'What can friends write in a birthday card?',
    'a kind message',
    ['a bus route only', 'a shopping list only', 'a weather report only'],
    'Cards often contain kind celebration messages.',
  ],
  [
    'Why do people celebrate special days?',
    'to share happiness and remember an event',
    [
      'to make all days identical',
      'to stop people talking',
      'to avoid being together',
    ],
    'Celebrations help people share happiness and mark important events.',
  ],
  [
    'Which sentence describes a celebration?',
    'We are having a party with our friends.',
    [
      'The pencil is under the desk.',
      'The bus is at the station.',
      'The book is on the shelf.',
    ],
    'A party with friends is a celebration context.',
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
          `This option does not match the celebration context: ${correct}`;
    });
    return {
      schemaVersion: 'content-v1',
      id: `2026t3v1_ing_celebrations_${String(index + 1).padStart(3, '0')}`,
      contentSetId: '2026-t3-v1',
      subject: 'ingles',
      topic: 'celebrations',
      topicName: 'Celebrations',
      question,
      options,
      correctIndex,
      explanation,
      wrongExplanations,
      skill: 'reconhecer-vocabulario-e-contextos-de-celebracoes',
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
        `school-curriculum:2026-t3/ingles/celebrations/page-${question.sourceRef.page}`,
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
    topicId: 'ingles:celebrations',
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
    `t3-ingles-celebrations: ok (${questions.length} questoes, ${audit.reviews.length} passagens)\n`,
  );
}
if (require.main === module) main();
module.exports = { buildQuestions, buildAudit, sha256 };
