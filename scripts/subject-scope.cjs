function checkScope(paths, descriptor, readBase, readHead) {
  const subject = descriptor.subject;
  if (
    !['historia', 'ingles', 'matematica', 'ciencias'].includes(subject) ||
    descriptor.contentSetId !== '2026-t3-v2'
  )
    throw new Error('materia fora do procedimento');
  const allowed = new Set([
    '.github/subject-delivery.json',
    `js/data/t3-${subject}-v2-published.js`,
  ]);
  const prefix = `2026-t3-v2--${subject}--`;
  for (const name of paths) {
    if (allowed.has(name)) continue;
    if (
      new RegExp(`^docs/(?:drafts|editorial)/${prefix}[a-z0-9-]+\\.json$`).test(
        name,
      )
    )
      continue;
    if (
      new RegExp(
        `^docs/editorial/subject-runs/${subject}/[a-zA-Z0-9_-]+\\.json$`,
      ).test(name)
    )
      continue;
    if (name === 'index.html') {
      const before = readBase(name);
      const after = readHead(name);
      const tag = `    <script src="js/data/t3-${subject}-v2-published.js"></script>`;
      const lines = after.split('\n');
      if (
        lines.filter((line) => line === tag).length !== 1 ||
        lines.filter((line) => line !== tag).join('\n') !== before
      )
        throw new Error('index exige somente a inclusao do runtime autorizado');
      continue;
    }
    if (name === 'js/data/content-catalog.js') {
      const before = readBase(name),
        after = readHead(name);
      const pattern = /["']?publishedSubjects["']?\s*:\s*\[[^\]]*\]/g;
      const oldMatches = [...before.matchAll(pattern)],
        newMatches = [...after.matchAll(pattern)];
      if (
        oldMatches.length !== newMatches.length ||
        before.replace(pattern, 'PUBLICADOS') !==
          after.replace(pattern, 'PUBLICADOS')
      )
        throw new Error('catalogo alterado fora da disponibilidade');
      let changes = 0;
      for (let i = 0; i < oldMatches.length; i++) {
        const values = (value) =>
          [...value.matchAll(/["']([a-z]+)["']/g)]
            .map((match) => match[1])
            .filter((v) => v !== 'publishedSubjects');
        const oldValues = values(oldMatches[i][0]),
          newValues = values(newMatches[i][0]);
        if (oldMatches[i][0] === newMatches[i][0]) continue;
        changes++;
        if (
          oldValues.includes(subject) ||
          JSON.stringify(newValues.filter((v) => v !== subject)) !==
            JSON.stringify(oldValues) ||
          newValues.filter((v) => v === subject).length !== 1
        )
          throw new Error('catalogo mistura alteracoes de materias');
      }
      if (changes !== 1)
        throw new Error('catalogo exige uma unica materia nova');
      continue;
    }
    throw new Error(`arquivo fora da entrega por materia: ${name}`);
  }
  for (const required of [
    '.github/subject-delivery.json',
    `js/data/t3-${subject}-v2-published.js`,
    'index.html',
    'js/data/content-catalog.js',
  ])
    if (!paths.includes(required))
      throw new Error(`publicacao incompleta: ${required}`);
  return true;
}
module.exports = { checkScope };
