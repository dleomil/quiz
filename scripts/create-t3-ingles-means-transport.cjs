const { validateGeneratedQuestions } = require('./content-delivery.cjs');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { validateQuestion } = require('./validate-content.cjs');
const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs/drafts/2026-t3-v1-ing-means-transport.json',
);
const SPECS = [
  [
    'Which vehicle travels on rails?',
    'A train.',
    ['A bicycle.', 'A boat.', 'An airplane.'],
    'A train travels on railway tracks.',
    'Qual veículo se desloca sobre trilhos?',
  ],
  [
    'Which vehicle flies in the sky?',
    'An airplane.',
    ['A bus.', 'A ship.', 'A bicycle.'],
    'An airplane flies through the air.',
    'Qual veículo voa no céu?',
  ],
  [
    'Which vehicle travels on water?',
    'A boat.',
    ['A train.', 'A taxi.', 'A motorcycle.'],
    'A boat travels on water.',
    'Qual veículo se desloca na água?',
  ],
  [
    'Which vehicle has two wheels and pedals?',
    'A bicycle.',
    ['A bus.', 'A ship.', 'An airplane.'],
    'A bicycle has two wheels and pedals.',
    'Qual veículo tem duas rodas e pedais?',
  ],
  [
    'Which vehicle carries many passengers in a city?',
    'A bus.',
    ['A skateboard.', 'A canoe.', 'A bicycle.'],
    'A bus can carry many passengers on city roads.',
    'Qual veículo transporta muitos passageiros em uma cidade?',
  ],
  [
    'Which vehicle can take one passenger by road?',
    'A taxi.',
    ['A train station.', 'A boat.', 'An airport.'],
    'A taxi is a car service for passengers.',
    'Qual veículo pode levar um passageiro por uma estrada?',
  ],
  [
    'Which vehicle has two wheels and an engine?',
    'A motorcycle.',
    ['A train.', 'A ship.', 'A bus stop.'],
    'A motorcycle has two wheels and an engine.',
    'Qual veículo tem duas rodas e motor?',
  ],
  [
    'Where do people board an airplane?',
    'At the airport.',
    ['At the bakery.', 'At the library.', 'At the playground.'],
    'Passengers board airplanes at an airport.',
    'Em que lugar as pessoas embarcam em um avião?',
  ],
  [
    'Where do people wait for a bus?',
    'At the bus stop.',
    ['At the museum.', 'At the cinema.', 'At the pharmacy.'],
    'A bus stop is where passengers wait for a bus.',
    'Em que lugar as pessoas esperam um ônibus?',
  ],
  [
    'Where do people board a train?',
    'At the train station.',
    ['At the restaurant.', 'At the park.', 'At the hospital.'],
    'Passengers board trains at a train station.',
    'Em que lugar as pessoas embarcam em um trem?',
  ],
  [
    'What does a driver do?',
    'drives a vehicle',
    ['flies a kite', 'cooks a meal', 'writes a book'],
    'A driver controls a vehicle on the road.',
    'O que faz um “driver”?',
  ],
  [
    'What does a passenger do?',
    'travels in a vehicle',
    [
      'repairs every road',
      'flies an airplane alone every time',
      'builds a station',
    ],
    'A passenger travels in a vehicle.',
    'O que faz um “passenger”?',
  ],
  [
    'Which transport is good for a short trip without an engine?',
    'A bicycle.',
    ['A ship.', 'An airplane.', 'A train.'],
    'A bicycle can be used for short trips and has no engine.',
    'Qual meio de transporte é adequado para um trajeto curto sem motor?',
  ],
  [
    'Which transport can carry people across the sea?',
    'A ship.',
    ['A bus.', 'A bicycle.', 'A taxi.'],
    'A ship can carry people across the sea.',
    'Qual meio de transporte pode levar pessoas pelo mar?',
  ],
  [
    'Which word means a place where airplanes arrive and leave?',
    'airport',
    ['sidewalk', 'bakery', 'library'],
    'An airport serves airplanes and passengers.',
    'Qual palavra em inglês indica o lugar onde aviões chegam e partem?',
  ],
  [
    'Which word means a place where trains arrive and leave?',
    'station',
    ['playground', 'pharmacy', 'cinema'],
    'A station is a place where trains can arrive and leave.',
    'Qual palavra em inglês indica o lugar onde trens chegam e partem?',
  ],
  [
    'What should people do before crossing a street?',
    'look for traffic and cross safely',
    ['run without looking', 'close their eyes', 'stand in the road'],
    'Checking traffic helps people cross safely.',
    'O que as pessoas devem fazer antes de atravessar uma rua?',
  ],
  [
    'Which transport helps people walk safely beside a road?',
    'the sidewalk',
    ['the airplane', 'the train', 'the ship'],
    'People use a sidewalk to walk beside a road.',
    'Qual opção ajuda as pessoas a caminhar com segurança ao lado de uma rua?',
  ],
  [
    'Which sentence is correct?',
    'The bus is on the road.',
    [
      'The bus is in the sky.',
      'The bus is under the sea.',
      'The bus is on the rails.',
    ],
    'A bus normally travels on a road.',
    'Qual frase em inglês está correta?',
  ],
  [
    'What does “means of transport” mean?',
    'ways or vehicles used to travel',
    ['only city buildings', 'types of food', 'school subjects'],
    'The phrase refers to vehicles and ways people travel.',
    'Qual é o significado da expressão “means of transport”?',
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
            `This option is not the transport or place described: ${correct}`;
      });
      return {
        schemaVersion: 'content-v1',
        id: `2026t3v1_ing_means_transport_${String(index + 1).padStart(3, '0')}`,
        contentSetId: '2026-t3-v1',
        subject: 'ingles',
        topic: 'means-transport',
        topicName: 'Means of transport',
        question,
        questionPt,
        options,
        correctIndex,
        explanation,
        wrongExplanations,
        skill: 'reconhecer-meios-de-transporte',
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
    `t3-ingles-means-transport: ok (${questions.length} questoes com apoio em portugues; revisao deve ser registrada separadamente)\n`,
  );
}
if (require.main === module) main();
module.exports = { buildQuestions, sha256 };
