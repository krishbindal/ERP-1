const fs = require('fs');
const data = JSON.parse(fs.readFileSync('artifacts_dir/apps/web/playwright-report/results.json', 'utf8'));

for (const s1 of data.suites) {
  if (!s1.suites) continue;
  for (const s2 of s1.suites) {
    if (!s2.specs) continue;
    for (const spec of s2.specs) {
      if (spec.tests[0].results[0].status === 'failed' && spec.title.includes('Teacher can access /students')) {
        console.log('Test:', spec.title);
        console.log('Stdout:', spec.tests[0].results[0].stdout);
        console.log('Stderr:', spec.tests[0].results[0].stderr);
        console.log('---');
      }
    }
  }
}
