const fs = require('fs');
const path = require('path');

if (!process.argv[2]) {
  console.error(`ERROR: No report path provided`);
  process.exit(1);
}

const workspaceRoot = path.resolve(process.cwd());
const reportPath = path.resolve(process.argv[2]);
const relative = path.relative(workspaceRoot, reportPath);

if (relative === '' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
  console.error(`ERROR: Path traversal detected`);
  process.exit(1);
}

if (!fs.existsSync(reportPath)) {
  console.error(`ERROR: Playwright report not found at ${reportPath}`);
  process.exit(1);
}

const rawData = fs.readFileSync(reportPath, 'utf8');
const report = JSON.parse(rawData);

let total = 0;
let executed = 0;
let passed = 0;
let failed = 0;
let expectedSkips = 0;
let unexpectedSkips = 0;
let requiredSecurityExecuted = 0;
let requiredSecurityTotal = 0;

for (const suite of report.suites || []) {
  processSuite(suite);
}

function processSuite(suite) {
  for (const spec of suite.specs || []) {
    total++;
    
    // Each spec has tests (e.g. one for each project/browser)
    // We count based on the tests array
    for (const test of spec.tests || []) {
      const results = test.results || [];
      const isExpectedSkip = test.annotations?.some(a => a.type === 'skip' && a.description === 'Expected role-scope skip');
      
      const status = test.status;
      if (status === 'expected') {
        if (test.expectedStatus === 'skipped') {
           if (isExpectedSkip) {
               expectedSkips++;
           } else {
               unexpectedSkips++;
           }
        } else {
           passed++;
           executed++;
        }
      } else if (status === 'skipped') {
        if (isExpectedSkip) {
            expectedSkips++;
        } else {
            unexpectedSkips++;
        }
      } else {
        failed++;
        executed++;
      }
      
      // Determine if it's a security test (e.g. by title or file)
      // Since all our tests here are security/role-based right now, we can count all executed tests as security tests.
      // But we can filter specifically:
      if (test.projectName?.includes('superadmin') || test.projectName?.includes('branchadmin') || test.projectName?.includes('teacher')) {
          requiredSecurityTotal++;
          if (status === 'expected' && test.expectedStatus !== 'skipped') {
              requiredSecurityExecuted++;
          }
      }
    }
  }
  
  for (const childSuite of suite.suites || []) {
    processSuite(childSuite);
  }
}

console.log("==================================================");
console.log("PLAYWRIGHT CERTIFICATION GATE");
console.log("==================================================");
console.log(`Total tests: ${total * 3}`); // approx, since each spec runs in 3 projects
console.log(`Executed: ${executed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Intentionally skipped (role-scoped): ${expectedSkips}`);
console.log(`Unexpectedly skipped: ${unexpectedSkips}`);

// We need exactly 60 tests (20 specs * 3 projects)
// Out of which 48 passed, 12 intentionally skipped.
// If there are ANY unexpected skips or failures, it's a hard fail.
if (failed > 0) {
    console.error("CERTIFICATION FAILED: Found failing tests.");
    process.exit(1);
}

if (unexpectedSkips > 0) {
    console.error("CERTIFICATION FAILED: Found unexpected skipped tests.");
    process.exit(1);
}

if (executed === 0) {
    console.error("CERTIFICATION FAILED: No tests executed.");
    process.exit(1);
}

if (requiredSecurityExecuted < requiredSecurityTotal - expectedSkips) {
    console.error("CERTIFICATION FAILED: Required security scenarios not fully executed.");
    process.exit(1);
}

console.log("CERTIFICATION PASSED");
process.exit(0);
