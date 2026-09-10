const fs = require('fs');
const data = JSON.parse(fs.readFileSync('artifacts_dir/apps/web/playwright-report/results.json', 'utf8'));

for (const s1 of data.suites) {
  if (!s1.suites) continue;
  for (const s2 of s1.suites) {
    if (s2.title === 'Proxy / Middleware Runtime Security') {
      if (!s2.suites) continue;
      for (const s3 of s2.suites) {
        if (!s3.specs) continue;
        for (const spec of s3.specs) {
          if (spec.tests[0].results[0].status === 'failed') {
            console.log('Project:', spec.tests[0].projectName);
            console.log('Test:', spec.title);
            console.log('Error:', spec.tests[0].results[0].error.message);
            console.log('Stdout:', spec.tests[0].results[0].stdout);
            console.log('Stderr:', spec.tests[0].results[0].stderr);
            console.log('---');
          }
        }
      }
    }
  }
}
