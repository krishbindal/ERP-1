const fs = require('fs');
const path = 'apps/web/src/proxy.ts';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(
  /const { data: { user }, error } = await supabase\.auth\.getUser\(\)/,
  \let user = null;
  let error = null;
  for (let i = 0; i < 5; i++) {
    const res = await supabase.auth.getUser();
    user = res.data?.user;
    error = res.error;
    if (!error || error.message !== 'Failed to fetch') break;
    console.warn(\\proxy.ts getUser failed to fetch, retrying \\/5...\\);
    await new Promise(r => setTimeout(r, 1000));
  });
fs.writeFileSync(path, code);
