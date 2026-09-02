const fs = require('fs');
const data = JSON.parse(fs.readFileSync('artifacts3/apps/web/playwright-report/results.json', 'utf8'));

let targetTest = null;
function findFailedTest(obj) {
  if (!obj) return;
  if (obj.specs) {
    for (const spec of obj.specs) {
      for (const test of spec.tests) {
        if (test.projectName === 'chromium-teacher' && spec.title.includes('Teacher cannot access /students/new')) {
          targetTest = test;
        }
      }
    }
  }
  if (obj.suites) obj.suites.forEach(findFailedTest);
}

findFailedTest(data.suites.find(s => s.title === 'students-security.spec.ts'));

if (targetTest) {
  const result = targetTest.results[0];
  console.log("Status:", result.status);
  console.log("Steps:", result.steps.map(s => s.title).join('\n'));
} else {
  console.log("Not found");
}
