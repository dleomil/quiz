const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { validateQuestion } = require('./validate-content.cjs');
const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs/drafts/2026-t3-v1-ing-celebrations.json',
);
const SPECS = [
  [
    'What is a birthday?',
    'a day that celebrates a person being born',
    ['a kind of vehicle', 'a place to study', 'a type of weather'],
    'A birthday is a celebration of the day a person was born.',
    'O que significa a palavra “birthday”?',
  ],
  [
    'What do people often use on a birthday cake?',
    'candles',
    ['umbrellas', 'books', 'shoes'],
    'Candles are often placed on a birthday cake.',
    'O que as pessoas costumam usar em um bolo de aniversário?',
  ],
  [
    'What do people sing at a birthday party?',
    'Happy Birthday',
    ['Good morning', 'The bus song', 'School rules'],
    'Happy Birthday is a traditional birthday song.',
    'O que as pessoas cantam em uma festa de aniversário?',
  ],
  [
    'What is a present?',
    'a gift',
    ['a classroom', 'a street', 'a meal time'],
    'A present is another word for a gift.',
    'O que significa a palavra “present”?',
  ],
  [
    'What can people give at a celebration?',
    'a card',
    ['a traffic light', 'a sidewalk', 'a textbook only'],
    'A card can carry a celebration message.',
    'O que as pessoas podem dar em uma comemoração?',
  ],
  [
    'What is a party?',
    'a gathering to celebrate something',
    ['a type of homework', 'a weather event', 'a city building'],
    'A party is a social gathering for celebration.',
    'O que significa a palavra “party”?',
  ],
  [
    'Which word means a special day off or celebration?',
    'holiday',
    ['pencil', 'window', 'backpack'],
    'Holiday can describe a special day or period of celebration.',
    'Qual palavra em inglês significa um dia especial de folga ou comemoração?',
  ],
  [
    'What do people often do at a celebration?',
    'share food',
    ['repair roads', 'take a math test', 'paint every wall'],
    'Sharing food is a common celebration activity.',
    'O que as pessoas costumam fazer em uma comemoração?',
  ],
  [
    'What can people do with music at a party?',
    'dance',
    ['sleep in class', 'cross a road', 'read a map'],
    'People often dance to music at parties.',
    'O que as pessoas podem fazer ao som de música em uma festa?',
  ],
  [
    'Which decoration can appear at a party?',
    'balloons',
    ['bricks', 'traffic signs', 'school desks'],
    'Balloons are common party decorations.',
    'Qual enfeite pode aparecer em uma festa?',
  ],
  [
    'What do people say to congratulate someone?',
    'Congratulations!',
    ['Close the window!', 'Where is the bus?', 'Be quiet in class!'],
    "Congratulations is used to celebrate someone's achievement.",
    'O que as pessoas dizem para parabenizar alguém?',
  ],
  [
    'What is a family celebration?',
    'an event shared by family members',
    ['a road sign', 'a science tool', 'a school subject'],
    'Family celebrations bring relatives together.',
    'Qual é o significado da expressão “family celebration”?',
  ],
  [
    'Which event can be a celebration at school?',
    'a school festival',
    ['a broken pencil', 'a traffic jam', 'a closed notebook'],
    'A school festival can bring students together to celebrate.',
    'Qual evento pode ser uma comemoração na escola?',
  ],
  [
    'What can people do before a party?',
    'decorate the room',
    ['erase the street', 'close every shop', 'remove all music'],
    'Decorating prepares the space for a celebration.',
    'O que as pessoas podem fazer antes de uma festa?',
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
    'O que os convidados podem fazer quando chegam a uma festa?',
  ],
  [
    'What does “celebrate” mean?',
    'to do something special for an event',
    ['to forget an event', 'to repair a bicycle', 'to study a map'],
    'To celebrate is to mark an event with a special activity.',
    'O que significa o verbo “celebrate”?',
  ],
  [
    'Which item can hold a birthday gift?',
    'a gift bag',
    ['a street lamp', 'a school bell', 'a bus lane'],
    'A gift bag can be used to carry a present.',
    'Qual objeto pode guardar um presente de aniversário?',
  ],
  [
    'What can friends write in a birthday card?',
    'a kind message',
    ['a bus route only', 'a shopping list only', 'a weather report only'],
    'Cards often contain kind celebration messages.',
    'O que os amigos podem escrever em um cartão de aniversário?',
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
    'Por que as pessoas comemoram dias especiais?',
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
    'Qual frase em inglês descreve uma comemoração?',
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
        questionPt,
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
function main() {
  const questions = buildQuestions();
  fs.mkdirSync(path.dirname(DRAFT_PATH), { recursive: true });
  fs.writeFileSync(
    DRAFT_PATH,
    `${JSON.stringify({ schemaVersion: 'content-draft-v1', contentSetId: '2026-t3-v1', questions }, null, 2)}\n`,
  );
  process.stdout.write(
    `t3-ingles-celebrations: ok (${questions.length} questoes com apoio em portugues; revisao deve ser registrada separadamente)\n`,
  );
}
if (require.main === module) main();
module.exports = { buildQuestions, sha256 };
