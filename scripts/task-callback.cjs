'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { randomUUID } = require('node:crypto');

function parse(argv) {
  const separator = argv.indexOf('--');
  const options = separator >= 0 ? argv.slice(0, separator) : argv;
  if (options.length && (options.length !== 2 || options[0] !== '--id'))
    throw new Error(
      'Uso: node scripts/task-callback.cjs [--id ID] -- comando [args...]',
    );
  const id = options.length ? options[1] : randomUUID();
  const command = separator >= 0 ? argv.slice(separator + 1) : [];
  if (!/^[A-Za-z0-9._-]{1,80}$/.test(id) || !command.length)
    throw new Error(
      'Uso: node scripts/task-callback.cjs [--id ID] -- comando [args...]',
    );
  return { id, command };
}

function notify(title, message) {
  if (process.platform !== 'darwin') return Promise.resolve(false);
  return new Promise((resolve) => {
    const escaped = (value) =>
      value
        .replaceAll('\\', '\\\\')
        .replaceAll('"', '\\"')
        .replace(/[\r\n]/g, ' ');
    const child = spawn(
      'osascript',
      [
        '-e',
        `display notification "${escaped(message)}" with title "${escaped(title)}"`,
      ],
      { stdio: 'ignore' },
    );
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      resolve(false);
    }, 5000);
    child.once('error', () => {
      clearTimeout(timer);
      resolve(false);
    });
    child.once('close', () => clearTimeout(timer));
    child.once('close', (code) => resolve(code === 0));
  });
}

async function run(
  { id, command },
  root = process.cwd(),
  notifier = notify,
  timeoutMs = 5000,
) {
  parse(['--id', id, '--', ...command]);
  const directory = path.join(root, '.codex', 'task-callbacks');
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const file = path.join(directory, `${id}.json`);
  const record = {
    schemaVersion: 'task-callback-v1',
    id,
    command: command[0],
    startedAt: new Date().toISOString(),
    status: 'running',
  };
  fs.writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`, {
    mode: 0o600,
    flag: 'wx',
  });
  const code = await new Promise((resolve) => {
    const child = spawn(command[0], command.slice(1), {
      stdio: 'inherit',
      shell: false,
    });
    child.once('error', () => resolve(127));
    child.once('close', (exitCode, signal) => {
      record.signal = signal || null;
      resolve(exitCode ?? 1);
    });
  });
  record.status = code === 0 ? 'succeeded' : 'failed';
  record.exitCode = code;
  record.completedAt = new Date().toISOString();
  fs.writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`, {
    mode: 0o600,
  });
  let timer;
  const notified = await Promise.race([
    Promise.resolve()
      .then(() =>
        notifier(
          `Tarefa ${record.status === 'succeeded' ? 'concluída' : 'falhou'}`,
          `${id} terminou com código ${code}.`,
        ),
      )
      .catch(() => false),
    new Promise((resolve) => {
      timer = setTimeout(() => resolve(false), timeoutMs);
    }),
  ]);
  clearTimeout(timer);
  process.stdout.write(
    `Callback ${id}: ${record.status}; registro ${file}; notificacao ${notified ? 'enviada' : 'indisponivel'}.\n`,
  );
  return code;
}

if (require.main === module) {
  try {
    run(parse(process.argv.slice(2)))
      .then((code) => {
        process.exitCode = code;
      })
      .catch((error) => {
        process.stderr.write(`${error.message}\n`);
        process.exitCode = 2;
      });
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
}

module.exports = { parse, run, notify };
