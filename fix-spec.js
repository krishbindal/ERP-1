const fs = require('fs');
let content = fs.readFileSync('apps/web/e2e/branch-context.spec.ts', 'utf8');
content = content.replace("import { UserRole } from '../src/lib/types';\n", '');
content = content.replace("roles: [],", "roles: ['superadmin'],");
fs.writeFileSync('apps/web/e2e/branch-context.spec.ts', content);
