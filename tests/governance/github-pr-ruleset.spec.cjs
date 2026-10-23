const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ruleset = JSON.parse(
  fs.readFileSync(
    path.join(
      __dirname,
      '../../config/github-repository-rulesets/required-pull-request.json',
    ),
    'utf8',
  ),
);

assert.equal(ruleset.target, 'branch');
assert.equal(ruleset.enforcement, 'active');
assert.deepEqual(ruleset.conditions.ref_name.include, [
  'refs/heads/main',
  'refs/heads/develop',
]);
assert.deepEqual(ruleset.conditions.ref_name.exclude, []);
assert.deepEqual(ruleset.bypass_actors, []);
assert.deepEqual(ruleset.rules, [
  {
    type: 'pull_request',
    parameters: {
      required_approving_review_count: 0,
      dismiss_stale_reviews_on_push: false,
      require_code_owner_review: false,
      require_last_push_approval: false,
      required_review_thread_resolution: true,
      allowed_merge_methods: ['merge', 'squash'],
    },
  },
]);

process.stdout.write('github-pr-ruleset: ok\n');
