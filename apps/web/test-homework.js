const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000/auth/login');
  await page.fill('input[name="email"]', 't1_branch1@schoolos.test');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation();
  
  const response = await page.goto('http://localhost:3000/homework');
  const text = await page.content();
  
  if (text.includes('Application error') || text.includes('Runtime Error') || response.status() >= 400) {
     console.log('SERVER ERROR:', response.status());
     console.log(text.substring(0, 1000));
  } else {
     console.log('SUCCESS! Title:', await page.title());
     console.log('Headings:', await page.locator('h1, h2').allInnerTexts());
  }
  
  await browser.close();
})();
