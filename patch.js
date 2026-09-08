const fs = require('fs');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.test.tsx')) { 
            results.push(file);
        }
    });
    return results;
}
const files = walk('apps/web/src');
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    if (content.includes("vi.mock('lucide-react'")) {
        if (!content.includes('AlertTriangle:')) {
            content = content.replace(/return\s*\{/, "return {\n    AlertTriangle: () => <svg data-testid=\"icon-alert-triangle\" />,\n    CheckCircle: () => <svg data-testid=\"icon-check-circle\" />,\n    AlertCircle: () => <svg data-testid=\"icon-alert-circle\" />,\n    Info: () => <svg data-testid=\"icon-info\" />,\n    X: () => <svg data-testid=\"icon-x\" />,");
            fs.writeFileSync(f, content, 'utf8');
            console.log('Patched ' + f);
        }
    }
});
