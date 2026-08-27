const fs = require('fs');
const path = require('path');

function replaceSkips(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceSkips(fullPath);
        } else if (fullPath.endsWith('.spec.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            content = content.replace(/'Specific to branch admin and run only on chromium to avoid DB collisions'/g, "'EXPECTED_ROLE_SCOPE'");
            content = content.replace(/'Only applies to teachers and run only on chromium to avoid DB collisions'/g, "'EXPECTED_ROLE_SCOPE'");
            content = content.replace(/'Specific to branch admin'/g, "'EXPECTED_ROLE_SCOPE'");
            content = content.replace(/'Only applies to teachers'/g, "'EXPECTED_ROLE_SCOPE'");
            content = content.replace(/'Runs strictly on chromium-branchadmin to prevent DB conflicts'/g, "'EXPECTED_ROLE_SCOPE'");
            content = content.replace(/'Runs strictly on chromium-teacher to prevent DB conflicts'/g, "'EXPECTED_ROLE_SCOPE'");
            content = content.replace(/'Requires recipient auth state'/g, "'EXPECTED_ROLE_SCOPE'");
            
            fs.writeFileSync(fullPath, content);
        }
    });
}
replaceSkips('apps/web/e2e');
