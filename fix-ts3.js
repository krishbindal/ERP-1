const fs = require('fs');

function replaceInFile(path, replacements) {
    let content = fs.readFileSync(path, 'utf8');
    for (const {from, to} of replacements) {
        content = content.split(from).join(to);
    }
    fs.writeFileSync(path, content);
}

replaceInFile('apps/web/src/app/academic-structure/actions.ts', [
    { from: "catch (e: any) {\n    return { error: e.message };", to: "catch (e) {\n    return { error: (e as Error).message };" },
    { from: "catch (e: any) {", to: "catch (e) {" },
    { from: "return { error: e.message };", to: "return { error: (e as Error).message };" }
]);

replaceInFile('apps/web/src/app/admin/app-config/actions.ts', [
    { from: "catch (e: any) {\n    return { error: e.message };", to: "catch (e) {\n    return { error: (e as Error).message };" },
    { from: "catch (e: any) {", to: "catch (e) {" },
    { from: "return { error: e.message };", to: "return { error: (e as Error).message };" }
]);

