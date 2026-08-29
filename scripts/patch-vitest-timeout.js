const fs = require('fs');
const path = require('path');

try {
  // Manually check common paths instead of require.resolve because vitest might not export package.json
  const possiblePaths = [
    path.join(__dirname, '../node_modules/vitest/dist/chunks'),
    path.join(__dirname, '../apps/web/node_modules/vitest/dist/chunks')
  ];
  const chunksDir = possiblePaths.find(p => fs.existsSync(p));

  if (!chunksDir) {
    console.log('Vitest chunks directory not found, skipping patch.');
    process.exit(0);
  }

  const files = fs.readdirSync(chunksDir).filter(f => f.startsWith('cli-api'));
  
  let patched = false;
  files.forEach(f => {
    const p = path.join(chunksDir, f);
    let c = fs.readFileSync(p, 'utf8');
    let changed = false;
    
    // Replace default 60s timeout with 5 minutes (300s) to survive slow WSL disk I/O
    if (c.includes('START_TIMEOUT = 6e4')) {
      c = c.replace(/START_TIMEOUT = 6e4/g, 'START_TIMEOUT = 300000');
      changed = true;
    }
    if (c.includes('WORKER_START_TIMEOUT = 9e4')) {
      c = c.replace(/WORKER_START_TIMEOUT = 9e4/g, 'WORKER_START_TIMEOUT = 300000');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(p, c);
      console.log(`[Vitest Patch] Increased worker startup timeout in ${f}`);
      patched = true;
    }
  });

  if (!patched) {
    console.log('[Vitest Patch] No files needed patching or already patched.');
  }
} catch (e) {
  console.warn('[Vitest Patch] Failed to patch vitest:', e.message);
}
