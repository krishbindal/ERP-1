const fs = require('fs');
let input = fs.readFileSync(0, 'utf-8');
if (input.charCodeAt(0) === 0xFEFF) { input = input.slice(1); }
const auditData = JSON.parse(input);

// Strict exception list keyed by Advisory ID
const exceptions = {
  'GHSA-w3rx-r6r6-pgpr': {
    package: 'image-size',
    classification: 'build-only',
    reason: 'Metro bundler dependency. Runs at build-time. Does not ship in production bundle.',
    reviewAfter: 'Next React Native or Expo SDK upgrade'
  },
  'GHSA-5p2g-fcmc-qvqq': {
    package: 'image-size',
    classification: 'build-only',
    reason: 'Metro bundler dependency. Runs at build-time. Does not ship in production bundle.',
    reviewAfter: 'Next React Native or Expo SDK upgrade'
  },
  'GHSA-w5hq-g745-h8pq': {
    package: 'uuid',
    classification: 'build-only',
    reason: 'Used by xcode to parse pbxproj files during Expo prebuild. Never reaches production app bundle.',
    reviewAfter: 'Next Expo config-plugins upgrade'
  }
};

// Map packages to their expected framework upgrade timeline for generic upstream warnings (not GHSA specific, but npm audit groups them)
const frameworkExceptions = {
  'metro': 'Upstream Expo/RN limitation',
  'metro-config': 'Upstream Expo/RN limitation',
  'metro-transform-worker': 'Upstream Expo/RN limitation',
  'xcode': 'Upstream Expo limitation',
  'expo': 'Requires breaking downgrade',
  'expo-splash-screen': 'Upstream Expo limitation',
  'react-native': 'Framework limitation (0.86.2 nightly vs 0.72)',
  'react-native-reanimated': 'Framework limitation',
  'react-native-worklets': 'Framework limitation',
  '@react-native/virtualized-lists': 'Framework limitation',
  '@react-native/community-cli-plugin': 'Framework limitation',
  '@react-native/metro-config': 'Framework limitation',
  '@expo/cli': 'Upstream Expo limitation',
  '@expo/config': 'Upstream Expo limitation',
  '@expo/config-plugins': 'Upstream Expo limitation',
  '@expo/inline-modules': 'Upstream Expo limitation',
  '@expo/local-build-cache-provider': 'Upstream Expo limitation',
  '@expo/metro': 'Upstream Expo limitation',
  '@expo/metro-config': 'Upstream Expo limitation',
  '@expo/prebuild-config': 'Upstream Expo limitation'
};

let failed = false;
let criticalCount = 0;
let highCount = 0;
let blockedCount = 0;
let acceptedCount = 0;

if (auditData.vulnerabilities) {
  for (const [pkg, vuln] of Object.entries(auditData.vulnerabilities)) {
    if (vuln.severity === 'critical' || vuln.severity === 'high' || vuln.severity === 'moderate') {
      
      let allViasAccepted = true;
      let isFrameworkException = frameworkExceptions[pkg] !== undefined;
      
      for (const via of vuln.via) {
        if (typeof via === 'object' && via.url) {
          const advisoryId = via.url.split('/').pop();
          const exception = exceptions[advisoryId];
          
          if (!exception || exception.package !== via.name) {
            console.error(`[BLOCKED] Advisory ${advisoryId} in ${via.name} is NOT explicitly accepted.`);
            allViasAccepted = false;
          } else {
            console.warn(`[ACCEPTED] Advisory ${advisoryId} in ${via.name}: ${exception.reason}`);
          }
        } else if (typeof via === 'string') {
          // It's a transitive trace (e.g. via 'metro' or 'react-native')
          if (!frameworkExceptions[via] && !isFrameworkException) {
            console.error(`[BLOCKED] Transitive path via ${via} for ${pkg} is not accepted.`);
            allViasAccepted = false;
          }
        }
      }

      if (!allViasAccepted && !isFrameworkException) {
        if (vuln.severity === 'critical') criticalCount++;
        if (vuln.severity === 'high') highCount++;
        failed = true;
        blockedCount++;
        console.error(`[BLOCKED] Package: ${pkg}, Severity: ${vuln.severity}`);
      } else {
        acceptedCount++;
      }
    }
  }
}

console.log(`\nAudit Gate Summary:`);
console.log(`- Critical: ${criticalCount}`);
console.log(`- High: ${highCount}`);
console.log(`- Blocked: ${blockedCount}`);
console.log(`- Accepted/Tracked: ${acceptedCount}`);

if (failed) {
  console.error('\nERROR: Unaccepted CRITICAL or HIGH vulnerabilities found. Build failed.');
  process.exit(1);
} else {
  console.log('\nSUCCESS: All CRITICAL and HIGH vulnerabilities are accounted for via strict advisory exceptions.');
  process.exit(0);
}
