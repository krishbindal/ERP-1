const fs = require('fs');
const path = require('path');

if (!process.argv[2]) {
  throw new Error('ERROR: No report path provided');
}

const workspaceRoot = path.resolve(process.cwd());
const reportPath = path.resolve(process.argv[2]);
const relative = path.relative(workspaceRoot, reportPath);

if (relative === '' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
  throw new Error('ERROR: Path traversal detected');
}

if (!fs.existsSync(reportPath)) {
  throw new Error(`ERROR: Playwright report not found at ${reportPath}`);
}

const rawData = fs.readFileSync(reportPath, 'utf8');
const report = JSON.parse(rawData);

let total = 0;
let executed = 0;
let passed = 0;
let failed = 0;
let skipped = 0;
let unexpectedSkips = 0;
let roleScopeSkips = 0;
let projectScopeSkips = 0;

for (const suite of report.suites || []) {
  processSuite(suite);
}

function classifySkip(test) {
  const annotation = test.annotations?.find(a => a.type === 'skip');
  const description = annotation?.description || '';
  if (description === 'EXPECTED_ROLE_SCOPE' || description.includes('Only relevant for')) return 'ROLE';
  if (description === 'EXPECTED_PROJECT_SCOPE' || description === 'Only need to run proxy tests once') return 'PROJECT';
  return null;
}

function processSuite(suite) {
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      total++;
      const status = test.status;

      if (status === 'expected' && test.expectedStatus !== 'skipped') {
        executed++;
        passed++;
      } else if (status === 'skipped' || (status === 'expected' && test.expectedStatus === 'skipped')) {
        skipped++;
        const skipType = classifySkip(test);
        if (skipType === 'ROLE') roleScopeSkips++;
        else if (skipType === 'PROJECT') projectScopeSkips++;
        else {
          unexpectedSkips++;
          console.error(`Unexpected skip: ${test.projectName || 'unknown-project'} | ${spec.title}`);
        }
      } else {
        executed++;
        failed++;
      }
    }
  }
  for (const childSuite of suite.suites || []) processSuite(childSuite);
}

console.log('==================================================');
console.log('PLAYWRIGHT CERTIFICATION GATE');
console.log('==================================================');
console.log(`Total tests: ${total}`);
console.log(`Executed: ${executed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Intentionally skipped: ${skipped}`);
console.log(`  - EXPECTED_ROLE_SCOPE: ${roleScopeSkips}`);
console.log(`  - EXPECTED_PROJECT_SCOPE: ${projectScopeSkips}`);
console.log(`Unexpectedly skipped: ${unexpectedSkips}`);

if (failed > 0) process.exitCode = 1;
else if (unexpectedSkips > 0) process.exitCode = 1;
else if (executed === 0) process.exitCode = 1;
else {
  console.log('CERTIFICATION PASSED');
  process.exitCode = 0;
}
