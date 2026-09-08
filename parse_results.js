const fs = require('fs');
const data = JSON.parse(fs.readFileSync('artifacts_dir/apps/web/playwright-report/results.json', 'utf8'));

let count = 0;
for (const s1 of data.suites) {
  if (!s1.suites) continue;
  for (const s2 of s1.suites) {
    if (!s2.specs) continue;
    for (const spec of s2.specs) {
      if (spec.tests[0].results[0].status === 'failed') {
        console.log('Test:', spec.title);
        console.log('Error:', spec.tests[0].results[0].error.message);
        console.log('---');
        count++;
        if (count >= 3) process.exit(0);
      }
    }
  }
}
