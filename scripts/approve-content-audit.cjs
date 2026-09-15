const fs = require('node:fs');
const path = require('node:path');
const { loadContentSources } = require('./validate-content.cjs');
const { validateAuditReport } = require('./validate-content-audit.cjs');

const ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(
  ROOT,
  'docs',
  'audits',
  '2026-t2-v1-quality-audit.json',
);

function argument(name) {
  const index = process.argv.indexOf(name);
  return index < 0 ? undefined : process.argv[index + 1];
}

function writeAtomically(filePath, value) {
  const directory = path.dirname(filePath);
  const directoryStat = fs.lstatSync(directory);
  const targetStat = fs.lstatSync(filePath);
  if (
    directoryStat.isSymbolicLink() ||
    !directoryStat.isDirectory() ||
    targetStat.isSymbolicLink() ||
    !targetStat.isFile()
  ) {
    throw new Error('caminho do relatorio invalido');
  }
  const tempPath = path.join(directory, `.audit-approval-${process.pid}.tmp`);
  try {
    fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, {
      flag: 'wx',
      mode: 0o600,
    });
    fs.renameSync(tempPath, filePath);
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

function buildApprovedReport(report, sources, approval) {
  if (report.reportStatus !== 'draft') {
    throw new Error('somente relatorio draft pode receber aprovacao');
  }
  const approvedReport = {
    ...report,
    reportStatus: 'final',
    humanApproval: {
      actorId: approval.actorId,
      decision: 'approved',
      approvedAt: approval.approvedAt,
      evidenceRef: approval.evidenceRef,
    },
  };
  const errors = validateAuditReport(
    approvedReport,
    sources,
    report.contentSetId,
  );
  if (errors.length) throw new Error(errors.join('; '));
  return approvedReport;
}

function main() {
  const actorId = argument('--actor-id');
  const approvedAt = argument('--approved-at');
  const evidenceRef = argument('--evidence-ref');
  if (!actorId || !approvedAt || !evidenceRef) {
    process.stderr.write(
      'uso: npm run approve:content-audit -- --actor-id <responsavel> --approved-at <AAAA-MM-DD> --evidence-ref <registro-de-aprovacao>\n',
    );
    process.exitCode = 1;
    return;
  }

  try {
    const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    const approvedReport = buildApprovedReport(
      report,
      loadContentSources(ROOT),
      {
        actorId,
        approvedAt,
        evidenceRef,
      },
    );
    writeAtomically(REPORT_PATH, approvedReport);
    process.stdout.write('content-audit-approval: ok (final)\n');
  } catch (error) {
    process.stderr.write(`content-audit-approval: ${error.message}\n`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = { argument, buildApprovedReport, writeAtomically };
