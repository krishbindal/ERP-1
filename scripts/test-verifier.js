const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'verify-playwright-results.js');

function runVerifier(reportData, expectFail = false) {
    const tmpPath = path.join(__dirname, 'tmp-report.json');
    fs.writeFileSync(tmpPath, JSON.stringify(reportData));
    
    try {
        const output = execSync(`node "${scriptPath}" "${tmpPath}"`, { encoding: 'utf8', stdio: 'pipe' });
        if (expectFail) {
            console.error("Expected failure, but it passed!");
            process.exit(1);
        }
        return output;
    } catch (e) {
        if (!expectFail) {
            console.error("Expected pass, but it failed!");
            console.error(e.stdout);
            console.error(e.stderr);
            process.exit(1);
        }
        return e.stdout + e.stderr;
    } finally {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    }
}

// Helper for passing test
const passTest = {
    projectName: 'chromium-teacher',
    status: 'expected',
    expectedStatus: 'passed',
    results: [{ status: 'passed' }]
};

// 1. All passed (no skips)
runVerifier({
    suites: [{
        specs: [{
            tests: [passTest]
        }]
    }]
}, false);

// 2. role-scoped skip
runVerifier({
    suites: [{
        specs: [{
            tests: [passTest, {
                projectName: 'chromium-superadmin',
                status: 'expected',
                expectedStatus: 'skipped',
                annotations: [{ type: 'skip', description: 'EXPECTED_ROLE_SCOPE' }]
            },
            {
                projectName: 'chromium-superadmin',
                status: 'skipped', // Some runners use this
                annotations: [{ type: 'skip', description: 'Only relevant for Teacher role' }]
            }]
        }]
    }]
}, false);

// 3. project-scoped skip
runVerifier({
    suites: [{
        specs: [{
            tests: [passTest, {
                projectName: 'webkit-teacher',
                status: 'expected',
                expectedStatus: 'skipped',
                annotations: [{ type: 'skip', description: 'EXPECTED_PROJECT_SCOPE' }]
            },
            {
                projectName: 'webkit-teacher',
                status: 'skipped',
                annotations: [{ type: 'skip', description: 'Only need to run proxy tests once' }]
            }]
        }]
    }]
}, false);

// 4. genuinely unexpected skip
runVerifier({
    suites: [{
        specs: [{
            tests: [passTest, {
                projectName: 'chromium-teacher',
                status: 'skipped',
                annotations: [{ type: 'skip', description: 'I just felt like skipping this today' }]
            }]
        }]
    }]
}, true); // Should fail

// 5. failed test
runVerifier({
    suites: [{
        specs: [{
            tests: [passTest, {
                projectName: 'chromium-teacher',
                status: 'unexpected', 
                results: [{ status: 'failed' }]
            }]
        }]
    }]
}, true); // Should fail

console.log("ALL VERIFIER TESTS PASSED!");
