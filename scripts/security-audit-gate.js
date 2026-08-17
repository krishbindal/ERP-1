const fs = require('fs');

const auditData = JSON.parse(fs.readFileSync(0, 'utf-8'));

// Exceptions for Phase 3A.5: upstream framework issues that are build-time/unreachable
const exceptions = {
  'image-size': 'GHSA-w3rx-r6r6-pgpr, GHSA-5p2g-fcmc-qvqq - Metro bundler build-time dependency. Unreachable in prod.',
  'metro': 'Upstream dependency on image-size. Build-time only.',
  'metro-config': 'Upstream dependency on metro. Build-time only.',
  'metro-transform-worker': 'Upstream dependency on metro. Build-time only.',
  'uuid': 'GHSA-w5hq-g745-h8pq - Used by xcode for pbxproj parsing at build-time. Unreachable in prod.',
  'xcode': 'Upstream dependency on uuid. Build-time only.',
  'expo': 'Requires breaking downgrade to fix upstream build-time deps.',
  'expo-splash-screen': 'Upstream dependency on xcode. Build-time only.',
  'react-native': 'Requires breaking downgrade to 0.72. Framework limitation.',
  'react-native-reanimated': 'Upstream dependency on react-native.',
  'react-native-worklets': 'Upstream dependency on react-native.',
  '@react-native/virtualized-lists': 'Upstream dependency on react-native.',
  '@react-native/community-cli-plugin': 'Upstream dependency on metro.',
  '@react-native/metro-config': 'Upstream dependency on metro-config.',
  '@expo/cli': 'Upstream dependency on metro.',
  '@expo/config': 'Upstream dependency on xcode.',
  '@expo/config-plugins': 'Upstream dependency on xcode.',
  '@expo/inline-modules': 'Upstream dependency on xcode.',
  '@expo/local-build-cache-provider': 'Upstream dependency on xcode.',
  '@expo/metro': 'Upstream dependency on metro.',
  '@expo/metro-config': 'Upstream dependency on metro.',
  '@expo/prebuild-config': 'Upstream dependency on xcode.'
};

let failed = false;
let criticalCount = 0;
let highCount = 0;
let blockedCount = 0;

if (auditData.vulnerabilities) {
  for (const [pkg, vuln] of Object.entries(auditData.vulnerabilities)) {
    if (vuln.severity === 'critical' || vuln.severity === 'high') {
      if (vuln.severity === 'critical') criticalCount++;
      if (vuln.severity === 'high') highCount++;
      
      if (!exceptions[pkg]) {
        console.error(`[BLOCKED] Vulnerability in ${pkg} (${vuln.severity}) is NOT in the exception list.`);
        failed = true;
        blockedCount++;
      } else {
        console.warn(`[ACCEPTED] Vulnerability in ${pkg} (${vuln.severity}): ${exceptions[pkg]}`);
      }
    }
  }
}

console.log(`\nAudit Gate Summary:`);
console.log(`- Critical: ${criticalCount}`);
console.log(`- High: ${highCount}`);
console.log(`- Blocked: ${blockedCount}`);

if (failed) {
  console.error('\nERROR: Unaccepted CRITICAL or HIGH vulnerabilities found. Build failed.');
  process.exit(1);
} else {
  console.log('\nSUCCESS: All CRITICAL and HIGH vulnerabilities are accounted for via accepted exceptions.');
  process.exit(0);
}
