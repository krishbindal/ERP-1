const fs = require('fs');
const data = JSON.parse(fs.readFileSync('artifacts3/apps/web/playwright-report/results.json', 'utf8'));
const authSetup = data.suites.find(s => s.title === 'auth.setup.ts');
const specs = [];
function findSpecs(obj) {
  if (!obj) return;
  if (obj.specs) specs.push(...obj.specs);
  if (obj.suites) obj.suites.forEach(findSpecs);
}
findSpecs(authSetup);
specs.forEach(s => console.log(s.title, s.tests[0].results[0].status));
