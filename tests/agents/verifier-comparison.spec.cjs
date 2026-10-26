const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  DISABLED_FEATURES,
  initializeProfile,
} = require('../../scripts/agent-auth.cjs');
const evaluation = require('../../scripts/agent-evaluation.cjs');
const { digest } = require('../../scripts/document-catalog.cjs');
const comparison = require('../../scripts/agent-verifier-comparison.cjs');

function fakeCodex(directory, root) {
  const bin = path.join(directory, 'codex-fake.cjs');
  const record = path.join(directory, 'calls.jsonl');
  const cases = JSON.parse(
    fs.readFileSync(
      path.join(root, 'tests/fixtures/agent-verifier-comparison/cases.json'),
      'utf8',
    ),
  ).cases;
  const answers = Object.fromEntries(
    cases.map((item) => {
      const findings = item.expectedFindings.map((requirementId) => {
        const evidence = {
          'VER-EMPTY':
            'reduce sem valor inicial retorna o primeiro elemento e falha para lista vazia.',
          'VER-INPUT':
            'A entrada aceita valores invalidos e deveria lancar TypeError quando correct nao e booleano.',
          'VER-EVIDENCE':
            'O teste claimed-mixed-score esperava 4 e observou actual=5, contradizendo o relato.',
        }[requirementId];
        return { requirementId, severity: 'major', evidence };
      });
      return [
        item.id,
        {
          decision: item.decision,
          findings,
          facts: ['Codigo e testes sinteticos inspecionados.'],
          limitations: ['Amostra pequena.'],
        },
      ];
    }),
  );
  const source = [
    '#!/usr/bin/env node',
    'const fs=require("node:fs"),cp=require("node:child_process");',
    'const args=process.argv.slice(2);',
    'if(args[0]==="--version"){console.log("codex-cli 0.160.0");process.exit(0);}',
    'if(args[0]==="login"){console.log("Logged in using ChatGPT");process.exit(0);}',
    'if(args[0]==="features"){for(const name of ' +
      JSON.stringify(DISABLED_FEATURES) +
      ')console.log(name+" stable false");console.log("skip_host_skill_discovery beta true");process.exit(0);}',
    'if(args[0]==="mcp"){console.log("[]");process.exit(0);}',
    'if(args[0]==="debug"&&args[1]==="prompt-input"){console.log(JSON.stringify([{type:"message",role:"developer",content:[{text:"Contexto sem skills."}]}]));process.exit(0);}',
    'if(args[0]==="debug"){console.log(JSON.stringify({models:[{slug:"gpt-5.6-terra"},{slug:"gpt-6.1-sol"}]}));process.exit(0);}',
    'if(args[0]==="sandbox"){const index=args.indexOf("-e");const result=cp.spawnSync(process.execPath,["-e",args[index+1],args.at(-1)],{cwd:process.cwd(),encoding:"utf8"});process.stdout.write(result.stdout||"");process.stderr.write(result.stderr||"");process.exit(result.status||0);}',
    'if(args[0]!=="exec")process.exit(2);',
    'const prompt=fs.readFileSync(0,"utf8");',
    'const match=prompt.match(/"id":"verify-([a-z-]+)"/);',
    'if(!match)process.exit(3);',
    'const output=' + JSON.stringify(answers) + '[match[1]];',
    'if(!output)process.exit(4);',
    'fs.writeFileSync(args[args.indexOf("--output-last-message")+1],JSON.stringify(output));',
    'fs.appendFileSync(' +
      JSON.stringify(record) +
      ',JSON.stringify({model:args[args.indexOf("--model")+1],apiKey:process.env.OPENAI_API_KEY||null})+"\\n");',
    'console.log(JSON.stringify({type:"thread.started",thread_id:"fake-thread"}));',
    'console.log(JSON.stringify({type:"turn.started"}));',
    'console.log(JSON.stringify({type:"item.completed",item:{id:"message_0",type:"agent_message",text:"Resposta concluida."}}));',
    'console.log(JSON.stringify({type:"turn.completed",usage:{input_tokens:12,cached_input_tokens:0,output_tokens:5}}));',
  ].join('\n');
  fs.writeFileSync(bin, source, { mode: 0o700 });
  return { bin, record };
}

function fakeCodeModeFailure(sourceBin, targetBin, options = {}) {
  let source = fs.readFileSync(sourceBin, 'utf8');
  const outputWriter =
    'fs.writeFileSync(args[args.indexOf("--output-last-message")+1],JSON.stringify(output));';
  const outputReplacement = options.missingResponse
    ? 'void output;'
    : options.invalidResponse
      ? 'fs.writeFileSync(args[args.indexOf("--output-last-message")+1],JSON.stringify({invalid:true}));'
      : outputWriter;
  assert.ok(source.includes(outputWriter));
  source = source.replace(outputWriter, outputReplacement);

  const turnStarted = 'console.log(JSON.stringify({type:"turn.started"}));';
  const errorEvent =
    'console.log(JSON.stringify({type:"item.completed",item:{id:"code_mode_disabled",type:"error",message:' +
    JSON.stringify(comparison.CODE_MODE_DISABLED_MESSAGE) +
    '}}));';
  assert.ok(source.includes(turnStarted));
  source = source.replace(turnStarted, errorEvent + turnStarted);
  if (options.forbiddenTool) {
    source = source.replace(
      turnStarted,
      turnStarted +
        'console.log(JSON.stringify({type:"item.completed",item:{id:"tool",type:"command_execution"}}));',
    );
  }

  const turnCompleted =
    'console.log(JSON.stringify({type:"turn.completed",usage:{input_tokens:12,cached_input_tokens:0,output_tokens:5}}));';
  assert.ok(source.includes(turnCompleted));
  source = source.replace(
    turnCompleted,
    options.incompleteTurn
      ? 'process.exitCode=1;'
      : turnCompleted + 'process.exitCode=1;',
  );
  fs.writeFileSync(targetBin, source, { mode: 0o700 });
  return targetBin;
}

function approvedProfile(directory, packageFile, packageHash, root, label) {
  const home = initializeProfile(path.join(directory, label));
  comparison.approve(
    home,
    packageFile,
    'Aprovo o pacote ' +
      packageHash +
      ' e o limite de 12 chamadas, fixture ' +
      label +
      '.',
    true,
    root,
  );
  return home;
}

async function main() {
  const root = path.resolve(__dirname, '../..');
  const temp = fs.mkdtempSync(
    path.join(os.tmpdir(), 'quiz-verifier-comparison-test-'),
  );
  try {
    const { configuration, corpus } = comparison.loadConfiguration(root);
    assert.equal(configuration.maximumInvocations, 12);
    assert.equal(
      corpus.cases.filter((item) => item.kind === 'control').length,
      3,
    );
    assert.equal(
      corpus.cases.filter((item) => item.kind !== 'control').length,
      3,
    );
    const caseById = Object.fromEntries(
      corpus.cases.map((item) => [item.id, item]),
    );
    assert.deepEqual(caseById['missing-empty-case'].expectedFindings, [
      'VER-EMPTY',
    ]);
    assert.deepEqual(caseById['missing-input-validation'].expectedFindings, [
      'VER-INPUT',
    ]);
    assert.deepEqual(caseById['contradictory-test-evidence'].expectedFindings, [
      'VER-EVIDENCE',
    ]);

    for (const item of corpus.cases) {
      const output =
        item.kind === 'control'
          ? {
              decision: 'approved',
              findings: [],
              facts: ['ok'],
              limitations: [],
            }
          : {
              decision: item.decision,
              findings: item.expectedFindings.map((requirementId) => ({
                requirementId,
                severity: 'major',
                evidence: {
                  'VER-EMPTY':
                    'reduce sem valor inicial falha para lista vazia',
                  'VER-INPUT':
                    'A entrada aceita valores invalidos e deveria lancar TypeError',
                  'VER-EVIDENCE':
                    'O teste claimed-mixed-score esperava 4 e observou actual=5, contradizendo o relato',
                }[requirementId],
              })),
              facts: ['ok'],
              limitations: [],
            };
      assert.equal(comparison.grade(item, output).passed, true, item.id);
    }
    const semanticEmptyEvidence = {
      decision: 'adjustments_required',
      findings: [
        {
          requirementId: 'VER-EMPTY',
          severity: 'major',
          evidence:
            'No codigo, [].reduce sem acumulador nao fornece resultado para lista vazia.',
        },
      ],
      facts: ['O trecho observado usa reduce sem valor inicial.'],
      limitations: [],
    };
    assert.equal(
      comparison.grade(caseById['missing-empty-case'], semanticEmptyEvidence)
        .passed,
      true,
    );
    const weakEmptyEvidence = {
      ...semanticEmptyEvidence,
      findings: semanticEmptyEvidence.findings.map((item) => ({ ...item })),
    };
    weakEmptyEvidence.findings[0].evidence =
      'Esse comportamento talvez seja incorreto.';
    assert.equal(
      comparison.grade(caseById['missing-empty-case'], weakEmptyEvidence)
        .passed,
      false,
    );
    const semanticContradictionEvidence = {
      decision: 'blocked',
      findings: [
        {
          requirementId: 'VER-EVIDENCE',
          severity: 'blocking',
          evidence:
            'No teste claimed-mixed-score esperava 4 e observou actual=5, em desacordo com a regra.',
        },
      ],
      facts: ['O harness registrou a divergencia esperada.'],
      limitations: [],
    };
    assert.equal(
      comparison.grade(
        caseById['contradictory-test-evidence'],
        semanticContradictionEvidence,
      ).passed,
      true,
    );
    const weakContradictionEvidence = {
      ...semanticContradictionEvidence,
      findings: semanticContradictionEvidence.findings.map((item) => ({
        ...item,
      })),
    };
    weakContradictionEvidence.findings[0].evidence =
      'A evidência está confusa.';
    assert.equal(
      comparison.grade(
        caseById['contradictory-test-evidence'],
        weakContradictionEvidence,
      ).passed,
      false,
    );
    const unsupportedExtraFinding = {
      decision: 'adjustments_required',
      findings: [
        {
          requirementId: 'VER-EVIDENCE',
          severity: 'major',
          evidence: 'O comando nao foi fornecido para reproduzir a suite.',
        },
      ],
      facts: ['Os resultados do harness foram fornecidos.'],
      limitations: [],
    };
    assert.equal(
      comparison.grade(caseById['valid-reducer'], unsupportedExtraFinding)
        .passed,
      false,
    );
    const missed = {
      decision: 'approved',
      findings: [],
      facts: [],
      limitations: [],
    };
    assert.equal(
      comparison.grade(caseById['missing-empty-case'], missed).passed,
      false,
    );

    const packagePayload = comparison.packagePayload(root);
    const packageFile = path.join(temp, 'package.json');
    fs.writeFileSync(
      packageFile,
      JSON.stringify({ ...packagePayload, sha256: digest(packagePayload) }),
      { mode: 0o600 },
    );
    assert.equal(
      comparison.verifyPackage(packageFile, root).maximumInvocations,
      12,
    );
    const corrupt = path.join(temp, 'corrupt-package.json');
    fs.writeFileSync(
      corrupt,
      JSON.stringify({ ...packagePayload, sha256: '0'.repeat(64) }),
      { mode: 0o600 },
    );
    assert.throws(
      () => comparison.verifyPackage(corrupt, root),
      /hash do pacote diverge/,
    );

    const home = initializeProfile(path.join(temp, 'dedicated-auth'));
    const fake = fakeCodex(temp, root);
    await assert.rejects(
      comparison.runOne(
        home,
        packageFile,
        'valid-reducer',
        'current',
        fake.bin,
        true,
        root,
      ),
      /ENOENT/,
    );
    const campaign = path.join(
      home,
      'quiz-evaluations',
      'agent-verifier-comparison-2026-10',
    );
    assert.equal(fs.readdirSync(path.join(campaign, 'attempts')).length, 0);
    assert.equal(fs.existsSync(fake.record), false);
    const readiness = comparison.verifyReady(
      home,
      comparison.verifyPackage(packageFile, root),
      fake.bin,
    );
    assert.equal(readiness.callsConsumed, 0);
    assert.equal(readiness.models.length, 2);
    assert.equal(readiness.accountModelAccess, 'not-yet-observed');
    const unauthenticated = path.join(temp, 'codex-no-login.cjs');
    fs.writeFileSync(
      unauthenticated,
      fs
        .readFileSync(fake.bin, 'utf8')
        .replace(
          'if(args[0]==="login"){console.log("Logged in using ChatGPT");process.exit(0);}',
          'if(args[0]==="login"){console.log("Not logged in");process.exit(1);}',
        ),
      { mode: 0o700 },
    );
    assert.throws(
      () =>
        comparison.verifyReady(
          home,
          comparison.verifyPackage(packageFile, root),
          unauthenticated,
        ),
      /preflight login status falhou/,
    );
    assert.throws(
      () =>
        comparison.approve(
          home,
          packageFile,
          'Aprovo sem hash explicito e sem teto.',
          true,
          root,
        ),
      /hash exato/,
    );
    const packageHash = comparison.verifyPackage(packageFile, root).sha256;
    const approval = comparison.approve(
      home,
      packageFile,
      'Aprovo o pacote ' +
        packageHash +
        ' e o limite de 12 chamadas, somente fixture.',
      true,
      root,
    );
    assert.equal(approval.maximumInvocations, 12);
    const lock = path.join(campaign, 'run.lock');
    fs.mkdirSync(lock, { mode: 0o700 });
    await assert.rejects(
      comparison.runOne(
        home,
        packageFile,
        'valid-reducer',
        'current',
        fake.bin,
        true,
        root,
      ),
      /EEXIST/,
    );
    assert.equal(fs.readdirSync(path.join(campaign, 'attempts')).length, 0);
    fs.rmdirSync(lock);
    assert.throws(() =>
      comparison.approve(
        home,
        packageFile,
        'Aprovo o pacote ' +
          packageHash +
          ' e o limite de 12 chamadas, duplicado.',
        true,
        root,
      ),
    );
    await assert.rejects(
      comparison.runOne(
        home,
        packageFile,
        'valid-reducer',
        'current',
        unauthenticated,
        true,
        root,
      ),
      /preflight login status falhou/,
    );
    assert.equal(fs.readdirSync(path.join(campaign, 'attempts')).length, 0);
    assert.equal(fs.existsSync(lock), false);

    for (const item of corpus.cases)
      for (const variant of ['current', 'candidate']) {
        const result = await comparison.runOne(
          home,
          packageFile,
          item.id,
          variant,
          fake.bin,
          true,
          root,
        );
        assert.equal(
          result.result,
          'completed',
          item.id + '-' + variant + ': ' + result.failureReason,
        );
        assert.equal(result.gradePassed, true, item.id + '-' + variant);
        assert.equal(result.modelInvocations, 1);
      }

    const validWork = JSON.parse(
      fs.readFileSync(
        path.join(campaign, 'runs', 'valid-reducer-current', 'work.json'),
        'utf8',
      ),
    );
    assert.equal(validWork.commands.length, 1);
    assert.match(validWork.commands[0], /"program"/);
    assert.equal(validWork.evidence.length, 5);
    const helperEvidence = JSON.parse(
      fs.readFileSync(
        path.join(campaign, 'runs', 'valid-helper-current', 'evidence.json'),
        'utf8',
      ),
    );
    const sparseInput = helperEvidence.results.find(
      (item) => item.id === 'sparse-array',
    );
    assert.equal(sparseInput.actual.error, 'TypeError');
    assert.equal(sparseInput.passed, true);
    const emptyEvidence = JSON.parse(
      fs.readFileSync(
        path.join(
          campaign,
          'runs',
          'missing-empty-case-current',
          'evidence.json',
        ),
        'utf8',
      ),
    );
    const failedEmpty = emptyEvidence.results.find(
      (item) => item.id === 'empty-list',
    );
    assert.equal(failedEmpty.actual, null);
    assert.equal(failedEmpty.passed, false);
    const inputEvidence = JSON.parse(
      fs.readFileSync(
        path.join(
          campaign,
          'runs',
          'missing-input-validation-current',
          'evidence.json',
        ),
        'utf8',
      ),
    );
    const failedInput = inputEvidence.results.find(
      (item) => item.id === 'invalid-correct-type',
    );
    assert.equal(failedInput.actual, 5);
    assert.equal(failedInput.passed, false);
    const contradictionEvidence = JSON.parse(
      fs.readFileSync(
        path.join(
          campaign,
          'runs',
          'contradictory-test-evidence-current',
          'evidence.json',
        ),
        'utf8',
      ),
    );
    const contradicted = contradictionEvidence.results.find(
      (item) => item.id === 'claimed-mixed-score',
    );
    assert.equal(contradicted.actual, 5);
    assert.equal(contradicted.expected, 4);
    assert.equal(contradicted.passed, false);

    const report = comparison.report(home, packageFile, true, root);
    assert.equal(report.completed, true);
    assert.equal(report.scoringComplete, true);
    assert.equal(report.responseRecoveries, 0);
    assert.equal(report.callsConsumed, 12);
    assert.equal(report.remainingInvocations, 0);
    assert.equal(report.activationEligible, false);
    assert.equal(report.variants.current.invocations, 6);
    assert.equal(report.variants.candidate.invocations, 6);
    assert.equal(report.variants.current.scored, 6);
    assert.equal(report.variants.candidate.scored, 6);
    assert.equal(report.variants.current.passed, 6);
    assert.equal(report.variants.candidate.passed, 6);
    assert.equal(report.variants.current.falsePositives, 0);
    assert.equal(report.variants.current.falseNegatives, 0);
    assert.equal(report.variants.candidate.falsePositives, 0);
    assert.equal(report.variants.candidate.falseNegatives, 0);
    await assert.rejects(
      () =>
        comparison.runOne(
          home,
          packageFile,
          'valid-reducer',
          'current',
          fake.bin,
          true,
          root,
        ),
      /slot ja reservado/,
    );
    const calls = fs
      .readFileSync(fake.record, 'utf8')
      .trim()
      .split('\n')
      .map(JSON.parse);
    assert.equal(calls.length, 12);
    assert.ok(calls.every((item) => item.apiKey === null));
    assert.equal(
      calls.filter((item) => item.model === 'gpt-5.6-terra').length,
      6,
    );
    assert.equal(
      calls.filter((item) => item.model === 'gpt-6.1-sol').length,
      6,
    );

    const failedHome = initializeProfile(
      path.join(temp, 'failed-dedicated-auth'),
    );
    const failedPackageHash = comparison.verifyPackage(
      packageFile,
      root,
    ).sha256;
    comparison.approve(
      failedHome,
      packageFile,
      'Aprovo o pacote ' +
        failedPackageHash +
        ' e o limite de 12 chamadas, fixture de falha.',
      true,
      root,
    );
    const failedBin = path.join(temp, 'codex-failed.cjs');
    const failedSource = fs
      .readFileSync(fake.bin, 'utf8')
      .replace(
        'if(args[0]!=="exec")process.exit(2);',
        'if(args[0]!=="exec")process.exit(2);if(args[0]==="exec"){console.log(JSON.stringify({type:"error",message:"fixture technical failure"}));process.exit(1);}',
      );
    fs.writeFileSync(failedBin, failedSource, { mode: 0o700 });
    const failedAttempt = await comparison.runOne(
      failedHome,
      packageFile,
      'valid-reducer',
      'current',
      failedBin,
      true,
      root,
    );
    assert.equal(failedAttempt.result, 'execution-failed');
    assert.equal(failedAttempt.modelInvocations, 1);
    await assert.rejects(
      comparison.runOne(
        failedHome,
        packageFile,
        'valid-reducer',
        'current',
        failedBin,
        true,
        root,
      ),
      /slot ja reservado/,
    );
    const failedReport = comparison.report(failedHome, packageFile, true, root);
    assert.equal(failedReport.callsConsumed, 1);
    assert.equal(failedReport.remainingInvocations, 11);
    assert.equal(failedReport.variants.current.technicalFailures, 1);
    assert.equal(failedReport.variants.current.falseNegatives, 0);

    const recoveredHome = approvedProfile(
      temp,
      packageFile,
      failedPackageHash,
      root,
      'recoverable-code-mode-auth',
    );
    const recoverableBin = fakeCodeModeFailure(
      fake.bin,
      path.join(temp, 'codex-code-mode-disabled.cjs'),
    );
    const recoveredAttempt = await comparison.runOne(
      recoveredHome,
      packageFile,
      'valid-reducer',
      'current',
      recoverableBin,
      true,
      root,
    );
    assert.equal(recoveredAttempt.result, 'response-recovered');
    assert.equal(recoveredAttempt.gradePassed, true);
    assert.equal(recoveredAttempt.modelInvocations, 1);
    assert.match(recoveredAttempt.failureReason, /execucao falhou/);
    assert.ok(recoveredAttempt.outputSha256);
    const recoveredDirectory = path.join(
      recoveredHome,
      'quiz-evaluations',
      'agent-verifier-comparison-2026-10',
      'runs',
      'valid-reducer-current',
    );
    const recoveredReceipt = evaluation.verifySeal(
      JSON.parse(
        fs.readFileSync(path.join(recoveredDirectory, 'receipt.json'), 'utf8'),
      ),
    );
    assert.equal(recoveredReceipt.result, 'response-recovered');
    assert.equal(recoveredReceipt.eventDiagnosis.reasonCode, 'process_failure');
    assert.ok(fs.existsSync(path.join(recoveredDirectory, 'grade.json')));
    const recoveredReport = comparison.report(
      recoveredHome,
      packageFile,
      true,
      root,
    );
    assert.equal(recoveredReport.completed, false);
    assert.equal(recoveredReport.scoringComplete, false);
    assert.equal(recoveredReport.responseRecoveries, 1);
    assert.equal(recoveredReport.variants.current.scored, 1);
    assert.equal(recoveredReport.variants.current.responseRecoveries, 1);
    assert.equal(recoveredReport.variants.current.passed, 1);
    assert.equal(recoveredReport.variants.current.technicalFailures, 1);
    await assert.rejects(
      comparison.runOne(
        recoveredHome,
        packageFile,
        'valid-reducer',
        'current',
        recoverableBin,
        true,
        root,
      ),
      /slot ja reservado/,
    );

    for (const [label, options] of [
      ['invalid-response', { invalidResponse: true }],
      ['missing-response', { missingResponse: true }],
      ['forbidden-tool', { forbiddenTool: true }],
      ['incomplete-turn', { incompleteTurn: true }],
    ]) {
      const home = approvedProfile(
        temp,
        packageFile,
        failedPackageHash,
        root,
        `${label}-auth`,
      );
      const bin = fakeCodeModeFailure(
        fake.bin,
        path.join(temp, `codex-${label}.cjs`),
        options,
      );
      const attempt = await comparison.runOne(
        home,
        packageFile,
        'valid-reducer',
        'current',
        bin,
        true,
        root,
      );
      assert.equal(attempt.result, 'execution-failed', label);
      assert.equal(attempt.gradePassed, false, label);
      assert.equal(attempt.outputSha256, null, label);
      const report = comparison.report(home, packageFile, true, root);
      assert.equal(report.scoringComplete, false, label);
      assert.equal(report.responseRecoveries, 0, label);
      assert.equal(report.variants.current.technicalFailures, 1, label);
    }
    process.stdout.write(
      'verifier-comparison: ok (12 slots isolados, recuperacao exata de Code Mode, falhas bloqueadas, sem chamadas reais)\n',
    );
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

main().catch((error) => {
  process.stderr.write(error.stack + '\n');
  process.exitCode = 1;
});
