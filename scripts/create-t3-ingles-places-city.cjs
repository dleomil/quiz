const { validateGeneratedQuestions } = require('./content-delivery.cjs');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { validateQuestion } = require('./validate-content.cjs');
const ROOT = path.resolve(__dirname, '..');
const DRAFT_PATH = path.join(
  ROOT,
  'docs/drafts/2026-t3-v1-ing-places-city.json',
);
const SPECS = [
  [
    'Where can you borrow books?',
    'At the library.',
    ['At the hospital.', 'At the bakery.', 'At the bus stop.'],
    'A library is a place where people can borrow books.',
    'Em que lugar você pode pegar livros emprestados?',
  ],
  [
    'Where can you see a doctor?',
    'At the hospital.',
    ['At the park.', 'At the cinema.', 'At the bakery.'],
    'A hospital is a place for medical care.',
    'Em que lugar você pode consultar um médico?',
  ],
  [
    'Where can you buy bread?',
    'At the bakery.',
    ['At the museum.', 'At the school.', 'At the bank.'],
    'A bakery sells bread and other baked foods.',
    'Em que lugar você pode comprar pão?',
  ],
  [
    'Where can you watch a movie?',
    'At the cinema.',
    ['At the library.', 'At the pharmacy.', 'At the post office.'],
    'A cinema is a place to watch movies.',
    'Em que lugar você pode assistir a um filme?',
  ],
  [
    'Where can children study?',
    'At the school.',
    ['At the supermarket.', 'At the station.', 'At the fire station.'],
    'A school is a place for learning.',
    'Em que lugar as crianças podem estudar?',
  ],
  [
    'Where can you buy medicine?',
    'At the pharmacy.',
    ['At the museum.', 'At the park.', 'At the restaurant.'],
    'A pharmacy sells medicine and health products.',
    'Em que lugar você pode comprar remédios?',
  ],
  [
    'Where can you send a letter?',
    'At the post office.',
    ['At the zoo.', 'At the bakery.', 'At the playground.'],
    'A post office provides mail services.',
    'Em que lugar você pode enviar uma carta?',
  ],
  [
    'Where can you see old objects and art?',
    'At the museum.',
    ['At the bank.', 'At the bus stop.', 'At the supermarket.'],
    'A museum displays objects, art, and history.',
    'Em que lugar você pode ver objetos antigos e obras de arte?',
  ],
  [
    'Where can you play outside?',
    'At the park.',
    ['At the hospital.', 'At the bank.', 'At the post office.'],
    'A park is a public outdoor place for leisure.',
    'Em que lugar você pode brincar ao ar livre?',
  ],
  [
    'Where can you buy food and household items?',
    'At the supermarket.',
    ['At the cinema.', 'At the library.', 'At the school.'],
    'A supermarket sells many food and household products.',
    'Em que lugar você pode comprar alimentos e produtos para a casa?',
  ],
  [
    'Where can you take a bus?',
    'At the bus stop.',
    ['At the bakery.', 'At the museum.', 'At the pharmacy.'],
    'People wait for buses at a bus stop.',
    'Em que lugar você pode pegar um ônibus?',
  ],
  [
    'Where can you catch a train?',
    'At the train station.',
    ['At the restaurant.', 'At the library.', 'At the park.'],
    'A train station is where passengers board trains.',
    'Em que lugar você pode pegar um trem?',
  ],
  [
    'Where can you eat a meal?',
    'At the restaurant.',
    ['At the hospital.', 'At the bank.', 'At the fire station.'],
    'A restaurant serves meals.',
    'Em que lugar você pode fazer uma refeição?',
  ],
  [
    'Where can you keep money and use banking services?',
    'At the bank.',
    ['At the zoo.', 'At the cinema.', 'At the school.'],
    'A bank provides banking services.',
    'Em que lugar você pode guardar dinheiro e usar serviços bancários?',
  ],
  [
    'Where can you see animals?',
    'At the zoo.',
    ['At the post office.', 'At the bakery.', 'At the station.'],
    'A zoo is a place where visitors can see animals.',
    'Em que lugar você pode ver animais?',
  ],
  [
    'Where do firefighters work?',
    'At the fire station.',
    ['At the library.', 'At the supermarket.', 'At the museum.'],
    'Firefighters work at a fire station.',
    'Em que lugar os bombeiros trabalham?',
  ],
  [
    'Which place has swings and slides for children?',
    'The playground.',
    ['The pharmacy.', 'The bank.', 'The hospital.'],
    'A playground has equipment for children to play.',
    'Qual lugar tem balanços e escorregadores para crianças?',
  ],
  [
    'Which place helps people cross a road safely?',
    'The crosswalk.',
    ['The bakery.', 'The cinema.', 'The museum.'],
    'A crosswalk is a marked place for crossing a road.',
    'Qual lugar ajuda as pessoas a atravessar uma rua com segurança?',
  ],
  [
    'Which place is usually next to streets and cars?',
    'The sidewalk.',
    ['The library.', 'The zoo.', 'The restaurant.'],
    'People walk on the sidewalk beside a street.',
    'Qual lugar costuma ficar ao lado das ruas e dos carros?',
  ],
  [
    'What does “places in the city” mean?',
    'locations found in a city',
    ['only colors in a city', 'actions happening at home', 'names of animals'],
    'The phrase refers to common city locations and buildings.',
    'O que significa a expressão “places in the city”?',
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
            `This option is not the place described: ${correct}`;
      });
      return {
        schemaVersion: 'content-v1',
        id: `2026t3v1_ing_places_city_${String(index + 1).padStart(3, '0')}`,
        contentSetId: '2026-t3-v1',
        subject: 'ingles',
        topic: 'places-city',
        topicName: 'Places in the city',
        question,
        questionPt,
        options,
        correctIndex,
        explanation,
        wrongExplanations,
        skill: 'reconhecer-vocabulario-de-lugares',
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
    `t3-ingles-places-city: ok (${questions.length} questoes com apoio em portugues; revisao deve ser registrada separadamente)\n`,
  );
}
if (require.main === module) main();
module.exports = { buildQuestions, sha256 };
