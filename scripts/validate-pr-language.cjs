const body = process.env.PR_BODY || '';
const forbidden = ['## Summary', '## Checks', '## Rollback'];

const found = forbidden.filter((heading) => body.includes(heading));
if (found.length) {
  process.stderr.write(
    `pr-language: use os rotulos em portugues; encontrados: ${found.join(', ')}\n`,
  );
  process.exitCode = 1;
} else {
  process.stdout.write('pr-language: ok\n');
}
