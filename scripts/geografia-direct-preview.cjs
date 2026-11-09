const fs = require('node:fs');
const path = require('node:path');
const {
  digest,
  reviewProjection,
  packageHash,
} = require('./content-delivery.cjs');
const coverage = require('../config/content-coverage-manifest.json');
const ROOT = path.resolve(__dirname, '..');
const OUTPUT = 'docs/editorial/2026-t3-v2-geografia-direct/preview';
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );
async function buildPreview() {
  const manifest = {
    schemaVersion: 'geografia-draft-preview-v1',
    purpose: 'editorial-preview',
    published: false,
    batches: [],
  };
  const cards = [];
  const choices = [];
  for (const topic of Object.keys(
    coverage.contentSets['2026-t3-v2'].subjects.geografia,
  )) {
    const draft = JSON.parse(
      fs.readFileSync(
        path.join(ROOT, `docs/drafts/2026-t3-v2-geo-${topic}.json`),
        'utf8',
      ),
    );
    const batch = {
      key: `2026-t3-v2/geografia/${topic}`,
      sourceSha256: packageHash(draft.questions),
      questions: [],
    };
    for (const q of draft.questions) {
      const hash = digest(reviewProjection(q));
      batch.questions.push({ id: q.id, sha256: hash });
      choices.push(
        `<option value="${cards.length}">${escape(q.sourceRef.topic)} · ${q.id.slice(-3)}</option>`,
      );
      cards.push(
        `<article data-id="${escape(q.id)}" ${cards.length ? 'hidden' : ''}><p class="topic">${escape(q.sourceRef.topic)}</p><h2>${escape(q.question)}</h2><ol type="A">${q.options.map((o, i) => `<li>${escape(o)}${i === q.correctIndex ? ' <span class="correct">Resposta correta</span>' : ''}</li>`).join('')}</ol><div class="explanation"><strong>Explicação</strong><p>${escape(q.explanation)}</p></div><details><summary>Feedbacks das alternativas incorretas</summary>${Object.entries(
          q.wrongExplanations,
        )
          .map(
            ([i, t]) =>
              `<p><strong>${String.fromCharCode(65 + Number(i))}.</strong> ${escape(t)}</p>`,
          )
          .join(
            '',
          )}</details><footer><div>ID: ${escape(q.id)} · versão ${q.version}</div><div>SHA-256 editorial: ${hash}</div><div>Hash do tema: ${batch.sourceSha256}</div></footer></article>`,
      );
    }
    manifest.batches.push(batch);
  }
  const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Geografia · revisão editorial</title><style>*{box-sizing:border-box}body{margin:0;background:#f1f5f9;color:#172b3a;font:17px/1.55 system-ui,sans-serif}main{max-width:900px;margin:40px auto;padding:0 20px}h1{font-size:30px;margin-bottom:6px}h2{font-size:25px;line-height:1.35}.notice{color:#4b5d6b}nav{display:flex;gap:10px;margin:24px 0;align-items:center}select{min-width:0;flex:1;padding:12px;font:inherit;border:1px solid #a9b9c5;border-radius:8px}button{padding:12px;border:1px solid #a9b9c5;border-radius:8px;background:white;font:inherit;cursor:pointer}article{background:white;padding:30px;border:1px solid #dbe4ea;border-radius:16px;box-shadow:0 6px 24px #1231}article[hidden]{display:none}.topic{color:#176c72;font-weight:650;margin:0}li{margin:12px 0;padding-left:8px}.correct{display:inline-block;color:#126342;font-size:13px;font-weight:700;background:#e2f5eb;border-radius:5px;padding:2px 7px}.explanation{background:#eef7f8;padding:18px;border-radius:10px}.explanation p{margin:6px 0}details{margin:22px 0}summary{cursor:pointer}footer{font:12px/1.7 monospace;color:#526672;overflow-wrap:anywhere;border-top:1px solid #dbe4ea;padding-top:16px}@media(max-width:600px){main{margin:20px auto;padding:0 12px}article{padding:20px}h2{font-size:22px}nav{flex-wrap:wrap}select{width:100%;flex-basis:100%}}</style><main><h1>Geografia · revisão editorial</h1><p class="notice">180 questões candidatas · 3º ano · 2026-t3-v2<br>Aceite editorial e autorização de publicação pendentes.</p><nav aria-label="Questões"><button id="previous">Anterior</button><select aria-label="Escolher questão">${choices.join('')}</select><button id="next">Próxima</button></nav>${cards.join('')}</main><script>const cards=[...document.querySelectorAll('article')],select=document.querySelector('select');function show(i){const n=(i+cards.length)%cards.length;select.value=String(n);cards.forEach((c,j)=>c.hidden=j!==n)}select.addEventListener('change',()=>show(Number(select.value)));document.querySelector('#previous').addEventListener('click',()=>show(Number(select.value)-1));document.querySelector('#next').addEventListener('click',()=>show(Number(select.value)+1));</script></html>`;
  fs.mkdirSync(path.join(ROOT, OUTPUT), { recursive: true });
  const formattedHtml = await require('prettier').format(html, {
    parser: 'html',
  });
  fs.writeFileSync(path.join(ROOT, OUTPUT, 'index.html'), formattedHtml);
  manifest.htmlSha256 = require('node:crypto')
    .createHash('sha256')
    .update(formattedHtml)
    .digest('hex');
  fs.writeFileSync(
    path.join(ROOT, OUTPUT, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  );
  return manifest;
}
if (require.main === module) {
  buildPreview()
    .then((m) =>
      console.log(
        `Preview: ${m.batches.reduce((n, b) => n + b.questions.length, 0)} IDs; ${OUTPUT}/index.html`,
      ),
    )
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
module.exports = { buildPreview };
