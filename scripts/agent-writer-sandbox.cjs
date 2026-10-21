const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const { CLI_VERSION } = require('./agent-auth.cjs');

const PROFILE = 'quiz-isolated';
function check(value, message) {
  if (!value) throw new Error(message);
}
function executableAt(target) {
  try {
    const stat = fs.statSync(target);
    return stat.isFile() && (stat.mode & 0o111) !== 0;
  } catch {
    return false;
  }
}
function resolveExecutable(name, environment) {
  if (path.isAbsolute(name)) return executableAt(name) ? name : null;
  for (const directory of (environment.PATH || '').split(path.delimiter)) {
    if (!directory) continue;
    const target = path.join(directory, name);
    if (executableAt(target)) return target;
  }
  return null;
}
function codeModeHostProof(bin = 'codex', environment = process.env) {
  const candidates = (environment.PATH || '')
    .split(path.delimiter)
    .filter(Boolean)
    .map((directory) => path.join(directory, 'codex-code-mode-host'));
  const cliPath = resolveExecutable(bin, environment);
  if (cliPath)
    candidates.unshift(
      path.join(path.dirname(cliPath), 'codex-code-mode-host'),
    );
  const found = candidates.some(executableAt);
  check(
    found,
    'host de Code Mode indisponivel; autoria isolada bloqueada antes da invocacao',
  );
  return { available: true, enabledFeatures: ['shell_tool', 'code_mode_host'] };
}
function permissionArguments(workspace, scope, scratch) {
  check(
    ['darwin', 'linux'].includes(process.platform),
    'plataforma sem isolamento validavel',
  );
  const files = {
    ':root': 'deny',
    ':minimal': 'read',
    '/private/tmp': 'deny',
    '/private/var/folders': 'deny',
    '/tmp': 'deny',
    [os.homedir()]: 'deny',
    [workspace]: 'read',
    [scratch]: 'write',
  };
  if (process.platform === 'darwin') files['/System/Library/OpenSSL'] = 'read';
  for (const name of scope) files[path.join(workspace, name)] = 'write';
  return [
    '--config',
    `default_permissions="${PROFILE}"`,
    '--config',
    `permissions.${PROFILE}.filesystem={${Object.entries(files)
      .map(
        ([name, access]) => `${JSON.stringify(name)}=${JSON.stringify(access)}`,
      )
      .join(',')}}`,
    '--config',
    `permissions.${PROFILE}.network.enabled=false`,
  ];
}
function probe(bin, workspace, scope, scratch, authHome, original) {
  const probeHome = fs.mkdtempSync(
    path.join(os.tmpdir(), 'quiz-sandbox-config-'),
  );
  const outside = path.join(probeHome, 'outside-canary');
  const outsideLink = path.join(scratch, 'outside-link');
  const writable = path.join(workspace, scope[0]);
  let descriptor;
  let created = false;
  try {
    descriptor = fs.openSync(
      writable,
      fs.constants.O_RDWR | fs.constants.O_NOFOLLOW,
    );
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    descriptor = fs.openSync(
      writable,
      fs.constants.O_RDWR |
        fs.constants.O_CREAT |
        fs.constants.O_EXCL |
        fs.constants.O_NOFOLLOW,
      0o600,
    );
    created = true;
  }
  const before = fs.readFileSync(descriptor);
  fs.writeFileSync(outside, 'fixture sem credenciais');
  fs.symlinkSync(outside, outsideLink);
  try {
    fs.writeFileSync(
      path.join(probeHome, 'config.toml'),
      'approval_policy="never"\n',
    );
    const env = {
      PATH: process.env.PATH,
      HOME: scratch,
      CODEX_HOME: probeHome,
      TMPDIR: scratch,
    };
    const version = spawnSync(bin, ['--version'], {
      env,
      cwd: workspace,
      encoding: 'utf8',
      timeout: 10000,
    });
    check(
      version.status === 0 &&
        version.stdout.trim() === `codex-cli ${CLI_VERSION}`,
      'CLI da sandbox nao validada',
    );
    const cases = [
      ['copy-read', path.join(workspace, 'package.json'), false, true],
      ['scope-write', writable, true, true],
      ['outside-read', outside, false, false],
      ['outside-write', outside, true, false],
      ['symlink-read', outsideLink, false, false],
      ['original-read', path.join(original, 'package.json'), false, false],
      ['auth-read', path.join(authHome, 'config.toml'), false, false],
      [
        'extra-write',
        path.join(workspace, '.quiz-unapproved-probe'),
        true,
        false,
      ],
      [
        'traversal-write',
        path.join(workspace, '..', '.quiz-unapproved-probe'),
        true,
        false,
      ],
    ];
    const program = `const fs=require('node:fs'),net=require('node:net');
const cases=JSON.parse(process.argv[1]);const result={};let failed=false;
for(const [name,file,write,allowed] of cases){let actual=false;try{if(write)fs.writeFileSync(file,'probe');else fs.readFileSync(file);actual=true;}catch(e){if(!['EPERM','EACCES'].includes(e.code)){result[name]=e.code;failed=true;continue;}}result[name]=actual?'allowed':'denied';if(actual!==allowed)failed=true;}
const socket=net.connect({host:'127.0.0.1',port:9});socket.setTimeout(1500);
socket.on('connect',()=>{result.network='allowed';socket.destroy();failed=true;finish();});
socket.on('error',e=>{result.network=['EPERM','EACCES'].includes(e.code)?'denied':e.code;if(result.network!=='denied')failed=true;finish();});
socket.on('timeout',()=>{result.network='timeout';failed=true;socket.destroy();finish();});
function finish(){console.log(JSON.stringify(result));process.exitCode=failed?1:0;}`;
    const args = [
      'sandbox',
      '--include-managed-config',
      ...permissionArguments(workspace, scope, scratch),
      '-P',
      PROFILE,
      '-C',
      workspace,
      process.execPath,
      '-e',
      program,
      JSON.stringify(cases),
    ];
    const result = spawnSync(bin, args, {
      env,
      cwd: workspace,
      encoding: 'utf8',
      timeout: 15000,
      maxBuffer: 1024 * 1024,
    });
    check(
      !result.error && result.status === 0,
      'sandbox nao comprovada; escrita e chamadas de modelo bloqueadas',
    );
    const checks = JSON.parse(result.stdout.trim());
    check(
      Object.keys(checks).length === cases.length + 1 &&
        cases.every(
          ([name, , , allowed]) =>
            checks[name] === (allowed ? 'allowed' : 'denied'),
        ) &&
        checks.network === 'denied',
      'resposta de sandbox invalida',
    );
    return {
      cliVersion: CLI_VERSION,
      platform: process.platform,
      checks,
      modelInvocations: 0,
    };
  } finally {
    try {
      fs.ftruncateSync(descriptor, 0);
      fs.writeSync(descriptor, before, 0, before.length, 0);
    } finally {
      fs.closeSync(descriptor);
    }
    if (created) fs.unlinkSync(writable);
    fs.unlinkSync(outsideLink);
    fs.rmSync(probeHome, { recursive: true, force: true });
  }
}
module.exports = {
  permissionArguments,
  probe,
  codeModeHostProof,
  PROFILE,
};
