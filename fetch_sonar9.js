const https = require("https");
https.get("https://sonarcloud.io/api/issues/search?pullRequest=18&projects=krishbindal_ERP-1&resolved=false", (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    try {
      const issues = JSON.parse(data).issues;
      issues.forEach(i => console.log(`${i.component}:${i.line} - ${i.message}`));
    } catch(e) {
      console.log(data);
    }
  });
});
