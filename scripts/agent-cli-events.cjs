const path = require('node:path');
const { DISABLED_FEATURES } = require('./agent-auth.cjs');
const VERSION = 'codex-0.160.0-events-v2';
function startupMessages(home) {
  return [
    `Under-development features enabled: skip_host_skill_discovery. Under-development features are incomplete and may behave unpredictably. To suppress this warning, set \`suppress_unstable_features_warning = true\` in ${path.join(home, 'config.toml')}.`,
    'Code Mode is unavailable because code-mode host is disabled. Code mode will fail closed; enable `features.code_mode_host` and install `codex-code-mode-host`.',
  ];
}
function warningContext(context) {
  const proof = context?.preflight;
  return (
    typeof context?.authHome === 'string' &&
    path.isAbsolute(context.authHome) &&
    path.resolve(context.authHome) === context.authHome &&
    proof?.cliVersion === '0.160.0' &&
    proof.auth === 'chatgpt-keyring' &&
    proof.skills === 'disabled-and-context-checked' &&
    proof.features?.skip_host_skill_discovery === true &&
    DISABLED_FEATURES.every((name) => proof.features[name] === false)
  );
}
const TOOLS = new Set([
  'command_execution',
  'file_change',
  'mcp_tool_call',
  'web_search',
  'collab_tool_call',
  'image_generation',
  'image_view',
]);
const LIFECYCLE = new Set([
  'thread.started',
  'turn.started',
  'turn.completed',
  'turn.failed',
  'item.started',
  'item.updated',
  'item.completed',
  'error',
]);
const MESSAGES = {
  invalid_jsonl: 'eventos da CLI invalidos',
  forbidden_tool: 'ferramenta proibida na execucao delimitada',
  unknown_item: 'tipo de item desconhecido na CLI',
  unknown_event: 'tipo de evento desconhecido na CLI',
  invalid_plan: 'atualizacao de plano invalida',
  invalid_usage: 'uso de tokens invalido',
  process_failure: 'erro de execucao informado pela CLI',
  incomplete_turn: 'execucao sem evento de conclusao',
};
function safeType(value) {
  return typeof value === 'string' && /^[a-z_][a-z0-9_.-]{0,79}$/.test(value)
    ? value
    : '<invalido>';
}
function analyzeEvents(jsonl, allowedTools = [], context = {}) {
  let usage = null,
    completed = false,
    started = false,
    threadStarted = false;
  const warnings = [],
    issues = [],
    types = Object.create(null);
  const issue = (code, line, event, item) => {
    if (issues.length < 100)
      issues.push({
        code,
        line,
        eventType: safeType(event?.type),
        itemType: item ? safeType(item.type) : null,
        itemId:
          typeof item?.id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(item.id)
            ? item.id
            : null,
      });
  };
  const lines = jsonl.split('\n');
  for (let index = 0; index < lines.length; index++) {
    if (!lines[index].trim()) continue;
    let event;
    try {
      event = JSON.parse(lines[index]);
    } catch {
      issue('invalid_jsonl', index + 1);
      continue;
    }
    if (!event || typeof event !== 'object' || Array.isArray(event)) {
      issue('invalid_jsonl', index + 1);
      continue;
    }
    if (event.type === 'thread.started') threadStarted = true;
    if (
      event.type === 'turn.started' ||
      event.type === 'turn.completed' ||
      event.type === 'turn.failed'
    )
      started = true;
    const item = event.item;
    const key = safeType(event.type) + (item ? ':' + safeType(item.type) : '');
    if (Object.hasOwn(types, key) || Object.keys(types).length < 100)
      types[key] = (types[key] || 0) + 1;
    if (!LIFECYCLE.has(event.type))
      issue('unknown_event', index + 1, event, item);
    if (item) {
      const kind = item.type;
      if (TOOLS.has(kind)) {
        if (!allowedTools.includes(kind))
          issue('forbidden_tool', index + 1, event, item);
      } else if (kind === 'todo_list') {
        if (
          !Array.isArray(item.items) ||
          Object.keys(item).some(
            (name) => !['id', 'type', 'items'].includes(name),
          ) ||
          item.items.some(
            (row) =>
              !row ||
              typeof row.text !== 'string' ||
              !row.text.trim() ||
              typeof row.completed !== 'boolean' ||
              Object.keys(row).some(
                (name) => !['text', 'completed'].includes(name),
              ),
          )
        )
          issue('invalid_plan', index + 1, event, item);
      } else if (kind === 'error') {
        const code = warningContext(context)
          ? startupMessages(context.authHome).indexOf(item.message)
          : -1;
        if (
          !started &&
          threadStarted &&
          event.type === 'item.completed' &&
          Object.keys(event).sort().join(',') === 'item,type' &&
          Object.keys(item).sort().join(',') === 'id,message,type' &&
          typeof item.id === 'string' &&
          /^[a-zA-Z0-9_-]{1,100}$/.test(item.id) &&
          code >= 0 &&
          !warnings.some((row) => row.code === `startup_config_${code + 1}`)
        )
          warnings.push({
            code: `startup_config_${code + 1}`,
            line: index + 1,
            itemId: item.id,
          });
        else issue('process_failure', index + 1, event, item);
      } else if (!['agent_message', 'reasoning', 'plan'].includes(kind))
        issue('unknown_item', index + 1, event, item);
    } else if (typeof event.type === 'string' && event.type.startsWith('item.'))
      issue('invalid_jsonl', index + 1, event);
    if (['turn.failed', 'error'].includes(event.type))
      issue('process_failure', index + 1, event, item);
    if (event.type === 'turn.completed') {
      completed = true;
      if (event.usage) {
        const keys = ['input_tokens', 'cached_input_tokens', 'output_tokens'];
        if (
          !keys.every(
            (name) =>
              Number.isSafeInteger(event.usage[name]) && event.usage[name] >= 0,
          )
        )
          issue('invalid_usage', index + 1, event);
        else
          usage = Object.fromEntries(
            keys.map((name) => [name, event.usage[name]]),
          );
      }
    }
  }
  if (!completed) issue('incomplete_turn', lines.length);
  const reasonCode = issues[0]?.code || null;
  return {
    version: VERSION,
    accepted: issues.length === 0,
    reasonCode,
    reason: reasonCode ? MESSAGES[reasonCode] : null,
    completed,
    usage,
    types,
    issues,
    warnings,
  };
}
function assertEvents(summary) {
  if (!summary.accepted) {
    const first = summary.issues[0];
    const error = new Error(
      `${summary.reason}${first?.itemType ? `: ${first.itemType}, linha ${first.line}` : ''}`,
    );
    error.diagnosis = summary;
    throw error;
  }
  return summary.usage;
}
module.exports = { VERSION, analyzeEvents, assertEvents, startupMessages };
