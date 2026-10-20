const { spawn } = require('node:child_process');

function execute(bin, args, options) {
  const { timeoutMs = 300000, input, ...childOptions } = options;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > 300000)
    return Promise.reject(
      new Error('prazo da invocacao esgotado ou invalido; sem repeticao'),
    );
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, {
      ...childOptions,
      detached: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let bytes = 0;
    let failure;
    const kill = () => {
      if (child.pid) {
        try {
          process.kill(-child.pid, 'SIGKILL');
        } catch {
          // O grupo ja encerrado nao exige outra acao.
        }
      }
    };
    const interrupt = () => {
      failure = new Error(
        'execucao interrompida; tentativa permanece consumida',
      );
      kill();
    };
    process.once('SIGTERM', interrupt);
    process.once('SIGINT', interrupt);
    const cleanup = () => {
      clearTimeout(timer);
      process.removeListener('SIGTERM', interrupt);
      process.removeListener('SIGINT', interrupt);
    };
    const timer = setTimeout(() => {
      failure = new Error('limite de cinco minutos; sem repeticao');
      kill();
    }, timeoutMs);
    child.stdout.on('data', (value) => {
      bytes += value.length;
      if (bytes > 16 * 1024 * 1024) {
        failure = new Error('eventos excedem limite');
        kill();
      } else stdout += value.toString();
    });
    child.stderr.on('data', (value) => {
      bytes += value.length;
      if (bytes > 16 * 1024 * 1024) {
        failure = new Error('eventos excedem limite');
        kill();
      }
    });
    child.on('error', (error) => {
      cleanup();
      kill();
      reject(error);
    });
    child.on('close', (code) => {
      cleanup();
      kill();
      if (failure || code !== 0) {
        let remote = '';
        for (const line of stdout.split('\n')) {
          try {
            const event = JSON.parse(line);
            const message =
              event.type === 'error'
                ? event.message
                : event.type === 'turn.failed'
                  ? event.error?.message
                  : null;
            if (typeof message === 'string') remote = message.slice(0, 1600);
          } catch {
            /* Somente eventos JSON conhecidos entram no diagnostico. */
          }
        }
        reject(
          failure ||
            new Error(
              `execucao falhou; sem repeticao ou fallback${remote ? `: ${remote}` : ''}`,
            ),
        );
      } else resolve(stdout);
    });
    child.stdin.on('error', () => {});
    child.stdin.end(input);
  });
}
module.exports = { execute };
