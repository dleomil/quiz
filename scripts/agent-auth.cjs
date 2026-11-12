const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { ROOT } = require('./document-catalog.cjs');

const CLI_VERSION = '0.167.1';
const COMPATIBLE_PROFILE_VERSIONS = new Set(['0.160.0', CLI_VERSION]);
const DEFAULT_AUTH_HOME = path.join(os.homedir(), '.codex-quiz-auth');
const SYSTEM_SKILLS = [
  'review-agent',
  'skill-creator',
  'skill-installer',
  'openai-docs',
  'imagegen',
];
const DISABLED_FEATURES = [
  'shell_tool',
  'shell_snapshot',
  'apps',
  'hooks',
  'multi_agent',
  'multi_agent_v2',
  'plugins',
  'remote_plugin',
  'skill_mcp_dependency_install',
  'skill_search',
  'memories',
  'goals',
  'browser_use',
  'browser_use_external',
  'browser_use_full_cdp_access',
  'computer_use',
  'in_app_browser',
  'in_app_chat',
  'in_app_local_automation',
  'image_generation',
  'view_image',
  'code_mode',
  'code_mode_host',
  'code_mode_only',
  'artifact',
  'workspace_dependencies',
  'tool_suggest',
  'step_model_switching',
  'request_permissions_tool',
  'auth_elicitation',
  'realtime_conversation',
  'daemon_auto_start',
  'sleep_tool',
  'agent_message_board',
  'send_message_to_user_async',
  'external_agent_memory_import',
];
const CONFIG = [
  'cli_auth_credentials_store = "keyring"',
  'forced_login_method = "chatgpt"',
  'web_search = "disabled"',
  'approval_policy = "never"',
  'sandbox_mode = "read-only"',
  'project_doc_max_bytes = 0',
  'history.persistence = "none"',
  '[agents]',
  'enabled = false',
  '[features]',
  ...DISABLED_FEATURES.map((name) => `${name} = false`),
  'skip_host_skill_discovery = true',
  '',
].join('\n');
const MARKER = 'quiz-dedicated-auth-v1';

function check(condition, message) {
  if (!condition) throw new Error(message);
}
function isWithin(target, root) {
  return target === root || target.startsWith(`${root}${path.sep}`);
}
function profilePath(value) {
  check(
    typeof value === 'string' && path.isAbsolute(value),
    'use --auth-home absoluto e dedicado',
  );
  const parent = fs.realpathSync(path.dirname(value));
  const target = path.join(parent, path.basename(value));
  const personal = path.join(os.homedir(), '.codex');
  const repo = fs.realpathSync(ROOT);
  check(
    !isWithin(target, repo) &&
      !isWithin(repo, target) &&
      !isWithin(target, personal) &&
      !isWithin(personal, target),
    'perfil deve ficar fora do repositorio e do Codex pessoal',
  );
  if (fs.existsSync(target)) {
    check(
      !fs.lstatSync(target).isSymbolicLink() &&
        fs.lstatSync(target).isDirectory(),
      'perfil invalido ou symlink',
    );
  }
  return target;
}
function initializeProfile(value) {
  const home = profilePath(value);
  if (fs.existsSync(home)) {
    check(
      fs.readdirSync(home).length === 0,
      'perfil existente nao sera alterado',
    );
  } else fs.mkdirSync(home, { mode: 0o700 });
  fs.chmodSync(home, 0o700);
  fs.writeFileSync(path.join(home, 'config.toml'), CONFIG, {
    flag: 'wx',
    mode: 0o600,
  });
  fs.writeFileSync(
    path.join(home, 'quiz-profile.json'),
    `${JSON.stringify({ schemaVersion: MARKER, cliVersion: CLI_VERSION })}\n`,
    { flag: 'wx', mode: 0o600 },
  );
  return home;
}
function validateProfile(value) {
  const home = profilePath(value);
  const stat = fs.statSync(home);
  check(
    (stat.mode & 0o077) === 0 &&
      (!process.getuid || stat.uid === process.getuid()),
    'permissoes inseguras no perfil',
  );
  for (const entry of fs.readdirSync(home)) {
    check(
      !fs.lstatSync(path.join(home, entry)).isSymbolicLink(),
      'symlink no perfil dedicado',
    );
    check(
      !/^(auth\.json|AGENTS\.md|hooks(?:\.json)?|plugins|agents|rules|mcp.*|.*\.config\.toml)$/i.test(
        entry,
      ),
      'arquivo externo ou cache de token proibido no perfil',
    );
    if (entry === 'skills') validateSystemSkills(home);
  }
  check(
    fs.readFileSync(path.join(home, 'config.toml'), 'utf8') === CONFIG,
    'configuracao do perfil diverge',
  );
  const marker = JSON.parse(
    fs.readFileSync(path.join(home, 'quiz-profile.json'), 'utf8'),
  );
  check(
    marker.schemaVersion === MARKER &&
      COMPATIBLE_PROFILE_VERSIONS.has(marker.cliVersion),
    'identidade do perfil invalida',
  );
  return home;
}
function validateSystemSkills(home) {
  const directory = path.join(home, 'skills');
  const walk = (target) => {
    const stat = fs.lstatSync(target);
    check(!stat.isSymbolicLink(), 'symlink nas skills do perfil dedicado');
    check(
      stat.isDirectory() || stat.isFile(),
      'entrada irregular nas skills do perfil dedicado',
    );
    if (stat.isDirectory())
      for (const entry of fs.readdirSync(target))
        walk(path.join(target, entry));
  };
  walk(directory);
  check(
    fs.statSync(directory).isDirectory() &&
      fs.readdirSync(directory).every((entry) => entry === '.system'),
    'skills externas proibidas no perfil',
  );
  const system = path.join(directory, '.system');
  if (!fs.existsSync(system)) return;
  check(
    fs.statSync(system).isDirectory() &&
      fs
        .readdirSync(system)
        .every(
          (entry) =>
            SYSTEM_SKILLS.includes(entry) ||
            entry === '.codex-system-skills.marker',
        ),
    'skill de sistema desconhecida; revisar versao da CLI',
  );
}
function skillArguments(home) {
  return [
    '--config',
    `skills.config=[${SYSTEM_SKILLS.map((name) => `{path=${JSON.stringify(path.join(home, 'skills', '.system', name, 'SKILL.md'))},enabled=false}`).join(',')}]`,
  ];
}
function assertNoEnabledSkills(raw) {
  const messages = JSON.parse(raw);
  check(
    Array.isArray(messages) &&
      messages.length > 0 &&
      messages.every(
        (message) =>
          (message.type === 'message' &&
            typeof message.role === 'string' &&
            Array.isArray(message.content) &&
            message.content.length > 0 &&
            message.content.every((part) => typeof part.text === 'string')) ||
          (message.type === 'additional_tools' &&
            Array.isArray(message.tools) &&
            message.tools.every((tool) => tool.name === 'functions')),
      ),
    'contexto de preflight invalido',
  );
  for (const message of messages)
    if (message.type !== 'message') continue;
    else
      for (const part of message.content || []) {
        const value = part.text || '';
        const marker = '### Available skills';
        if (!value.includes(marker)) continue;
        const section = value
          .slice(value.indexOf(marker) + marker.length)
          .split(/\n#{1,3} /)[0];
        check(
          !/(?:^|\n)[ \t]*-[ \t]+\S/.test(section),
          'skill ativa no contexto protegido',
        );
      }
}
function environment(authHome, sessionHome) {
  const result = {
    CODEX_HOME: authHome,
    HOME: os.homedir(),
    XDG_CONFIG_HOME: sessionHome,
    XDG_DATA_HOME: sessionHome,
  };
  for (const key of ['PATH', 'LANG', 'LC_ALL', 'TERM', 'NO_COLOR'])
    if (process.env[key]) result[key] = process.env[key];
  result.TMPDIR = sessionHome;
  return result;
}
function runnerEnvironment(authHome, sessionHome) {
  return {
    ...environment(authHome, sessionHome),
    CODEX_HOME: path.join(os.homedir(), '.codex'),
  };
}
function isolationArguments(sessionHome) {
  return [
    'forced_login_method="chatgpt"',
    'web_search="disabled"',
    'approval_policy="never"',
    'project_doc_max_bytes=0',
    'history.persistence="none"',
    'agents.enabled=false',
    'features.skip_host_skill_discovery=true',
    'shell_environment_policy.inherit="none"',
    `shell_environment_policy.set={ HOME=${JSON.stringify(sessionHome)}, TMPDIR=${JSON.stringify(sessionHome)} }`,
    ...DISABLED_FEATURES.map(
      (name) =>
        `features.${name === 'code_mode' ? 'code_mode.enabled' : name}=false`,
    ),
  ].flatMap((value) => ['--config', value]);
}
function checkedCall(bin, args, options, includeStderr = false) {
  const { skillHome = options.env.CODEX_HOME, ...spawnOptions } = options;
  const result = spawnSync(bin, [...args, ...skillArguments(skillHome)], {
    ...spawnOptions,
    encoding: 'utf8',
    timeout: 30000,
    maxBuffer: 16 * 1024 * 1024,
  });
  check(
    result.status === 0 && !result.error,
    args[0] === 'login' && args[1] === 'status'
      ? `autenticacao indisponivel: ${classifyAuthStatus(`${result.stdout || ''}\n${result.stderr || ''}`)}; nenhuma chamada de modelo iniciada`
      : `preflight ${args.slice(0, 2).join(' ')} falhou`,
  );
  return includeStderr
    ? `${result.stdout || ''}${result.stderr || ''}`
    : result.stdout || '';
}
function classifyAuthStatus(value) {
  const lines = String(value)
    .split(/\r?\n/)
    .map((line) => line.trim());
  if (lines.some((line) => /^Logged in using ChatGPT(?:[ .:(]|$)/i.test(line)))
    return 'chatgpt';
  if (lines.some((line) => /keyring|keychain|credential store/i.test(line)))
    return 'keyring-unavailable';
  if (
    lines.some((line) =>
      /not logged in|login required|unauthenticated/i.test(line),
    )
  )
    return 'login-required';
  if (lines.some((line) => /api key/i.test(line))) return 'different-method';
  return 'unrecognized';
}
function preflight(bin, home, sessionHome, workspace, model) {
  validateProfile(home);
  const options = {
    cwd: workspace,
    env: runnerEnvironment(home, sessionHome),
    skillHome: home,
  };
  const version = checkedCall(bin, ['--version'], options).trim();
  check(
    version === `codex-cli ${CLI_VERSION}`,
    'versao da CLI nao validada para o isolamento',
  );
  const auth = checkedCall(
    bin,
    ['login', 'status', '--config', 'forced_login_method="chatgpt"'],
    options,
    true,
  );
  check(
    classifyAuthStatus(auth) === 'chatgpt',
    `autenticacao indisponivel: ${classifyAuthStatus(auth)}; nenhuma chamada de modelo iniciada`,
  );
  const features = checkedCall(
    bin,
    ['features', 'list', ...isolationArguments(sessionHome)],
    options,
  );
  for (const name of DISABLED_FEATURES) {
    const match = features
      .split('\n')
      .find((line) => line.split(/\s+/)[0] === name);
    if (match && /\sremoved\s+true\s*$/.test(match)) continue;
    check(
      match && /\sfalse\s*$/.test(match),
      `isolamento nao confirmado: ${name}`,
    );
  }
  check(
    features
      .split('\n')
      .some(
        (line) =>
          line.split(/\s+/)[0] === 'skip_host_skill_discovery' &&
          /\strue\s*$/.test(line),
      ),
    'isolamento nao confirmado: descoberta de skills pessoais',
  );
  let mcp;
  try {
    mcp = JSON.parse(
      checkedCall(bin, ['mcp', 'list', '--json'], {
        cwd: workspace,
        env: environment(home, sessionHome),
        skillHome: home,
      }),
    );
  } catch {
    throw new Error('preflight MCP retornou resposta invalida');
  }
  check(Array.isArray(mcp) && mcp.length === 0, 'MCP ou connector configurado');
  let catalog;
  try {
    catalog = JSON.parse(
      checkedCall(bin, ['debug', 'models', '--bundled'], options),
    );
  } catch {
    throw new Error('catalogo de modelos invalido');
  }
  const models = Array.isArray(catalog) ? catalog : catalog.models;
  check(
    Array.isArray(models) && models.some((entry) => entry.slug === model),
    'modelo ausente do catalogo; sem fallback',
  );
  assertNoEnabledSkills(
    checkedCall(
      bin,
      [
        'debug',
        'prompt-input',
        ...isolationArguments(sessionHome),
        '--config',
        `model=${JSON.stringify(model)}`,
        'Confirme somente o contexto de preflight.',
      ],
      {
        cwd: workspace,
        env: environment(home, sessionHome),
        skillHome: home,
      },
    ),
  );
  validateProfile(home);
  return {
    cliVersion: CLI_VERSION,
    features: Object.fromEntries([
      ...DISABLED_FEATURES.map((name) => [name, false]),
      ['skip_host_skill_discovery', true],
    ]),
    mcpServerCount: mcp.length,
    auth: 'chatgpt-existing-profile',
    modelCatalogued: model,
    accountModelAccess: 'not-yet-observed',
    skills: 'disabled-and-context-checked',
  };
}

function runCli() {
  let sessionHome;
  try {
    const command = process.argv[2];
    check(['init', 'login', 'status'].includes(command), 'comando invalido');
    const authHome =
      process.argv.length === 3
        ? DEFAULT_AUTH_HOME
        : process.argv.length === 5 && process.argv[3] === '--auth-home'
          ? process.argv[4]
          : null;
    check(
      typeof authHome === 'string',
      'use init|login|status [--auth-home <diretorio>]',
    );
    const home =
      command === 'init'
        ? initializeProfile(authHome)
        : validateProfile(authHome);
    if (command === 'init') {
      process.stdout.write(
        'Perfil dedicado preparado; execute login com o mesmo --auth-home. Nenhuma credencial foi copiada.\n',
      );
      return;
    }
    sessionHome = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-auth-session-'));
    const result = spawnSync(
      'codex',
      [
        'login',
        ...(command === 'login' ? ['--device-auth'] : ['status']),
        ...skillArguments(home),
      ],
      {
        cwd: sessionHome,
        env: runnerEnvironment(home, sessionHome),
        stdio: 'inherit',
      },
    );
    check(
      result.status === 0,
      'login ou chaveiro indisponivel; sem alternativa por arquivo ou API',
    );
    validateProfile(home);
  } catch (error) {
    process.stderr.write(`agent-auth: ${error.message}\n`);
    process.exitCode = 1;
  } finally {
    if (sessionHome) fs.rmSync(sessionHome, { recursive: true, force: true });
  }
}
if (require.main === module) runCli();
module.exports = {
  classifyAuthStatus,
  CLI_VERSION,
  COMPATIBLE_PROFILE_VERSIONS,
  DEFAULT_AUTH_HOME,
  SYSTEM_SKILLS,
  CONFIG,
  DISABLED_FEATURES,
  environment,
  runnerEnvironment,
  initializeProfile,
  isolationArguments,
  preflight,
  validateProfile,
  skillArguments,
  assertNoEnabledSkills,
};
