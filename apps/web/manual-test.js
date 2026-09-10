/* eslint-disable */
const { chromium } = require('playwright-core');

(async () => {
  console.log('Starting manual site inspection...');
  const browser = await chromium.launch({ headless: true });
  
  // 1. Test Super Admin
  console.log('\n--- Testing Super Admin ---');
  const saContext = await browser.newContext({ storageState: 'playwright/.auth/superadmin.json' });
  const saPage = await saContext.newPage();
  await saPage.goto('http://localhost:3000/');
  await saPage.waitForLoadState('networkidle');
  let saTitle = await saPage.title();
  let saHeading = await saPage.locator('h1').first().textContent().catch(() => 'No H1');
  console.log('Page Title: ' + saTitle);
  console.log('Main Heading: ' + saHeading);
  let saNav = await saPage.locator('nav').innerText().catch(() => 'No Nav');
  console.log('Navigation items found:\n' + saNav.split('\n').filter(Boolean).join(', '));
  
  // Test Academic Structure
  console.log('Checking Academic Structure...');
  await saPage.goto('http://localhost:3000/academic-structure');
  let acaHeading = await saPage.locator('h1').first().textContent().catch(() => 'No H1');
  console.log('Academic Structure Heading: ' + acaHeading);
  
  // 2. Test Branch Admin
  console.log('\n--- Testing Branch Admin ---');
  const baContext = await browser.newContext({ storageState: 'playwright/.auth/branchadmin.json' });
  const baPage = await baContext.newPage();
  await baPage.goto('http://localhost:3000/');
  let baHeading = await baPage.locator('h1').first().textContent().catch(() => 'No H1');
  console.log('Branch Admin Home Heading: ' + baHeading);
  
  await baPage.goto('http://localhost:3000/students');
  let stuHeading = await baPage.locator('h1').first().textContent().catch(() => 'No H1');
  console.log('Students Page Heading: ' + stuHeading);
  let stuText = await baPage.locator('main').innerText().catch(() => '');
  console.log('Students Page Content snippet: ' + stuText.substring(0, 100).replace(/\n/g, ' ') + '...');

  // 3. Test Teacher
  console.log('\n--- Testing Teacher ---');
  const tContext = await browser.newContext({ storageState: 'playwright/.auth/teacher.json' });
  const tPage = await tContext.newPage();
  
  await tPage.goto('http://localhost:3000/attendance');
  let attHeading = await tPage.locator('h1').first().textContent().catch(() => 'No H1');
  console.log('Attendance Page Heading: ' + attHeading);
  
  await tPage.goto('http://localhost:3000/homework');
  let hwHeading = await tPage.locator('h1').first().textContent().catch(() => 'No H1');
  console.log('Homework Page Heading: ' + hwHeading);

  // 4. Test Guardian
  console.log('\n--- Testing Guardian ---');
  const gContext = await browser.newContext({ storageState: 'playwright/.auth/guardian.json' });
  const gPage = await gContext.newPage();
  
  await gPage.goto('http://localhost:3000/');
  let gHeading = await gPage.locator('h1').first().textContent().catch(() => 'No H1');
  console.log('Guardian Home Heading: ' + gHeading);
  
  await gPage.goto('http://localhost:3000/students');
  let gStuHeading = await gPage.locator('h1').first().textContent().catch(() => 'No H1');
  let gStuText = await gPage.locator('main').innerText().catch(() => '');
  console.log('Guardian Students Page Heading: ' + gStuHeading);
  console.log('Guardian Students Content: ' + gStuText.substring(0, 50).replace(/\n/g, ' '));

  await browser.close();
  console.log('\nInspection complete.');
})();
