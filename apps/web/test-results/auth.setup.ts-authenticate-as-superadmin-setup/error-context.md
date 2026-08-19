# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.setup.ts >> authenticate as superadmin
- Location: e2e\auth.setup.ts:11:8

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation to "/" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - heading "SchoolOS" [level=1] [ref=e5]
      - navigation [ref=e6]:
        - list [ref=e7]:
          - listitem [ref=e8]:
            - link "Dashboard" [ref=e9] [cursor=pointer]:
              - /url: /
          - listitem [ref=e15]:
            - link "Academic Structure" [ref=e16] [cursor=pointer]:
              - /url: /academic-structure
          - listitem [ref=e19]:
            - link "Students" [ref=e20] [cursor=pointer]:
              - /url: /students
      - generic [ref=e26]:
        - generic [ref=e27]: Profile
        - button [ref=e32]
    - generic [ref=e36]:
      - banner [ref=e37]:
        - generic [ref=e38]: No Branch Assigned
        - generic [ref=e40]:
          - generic [ref=e41]: User
          - generic [ref=e42]: U
      - main [ref=e43]:
        - generic [ref=e44]:
          - heading "Login" [level=1] [ref=e45]
          - generic [ref=e46]: Failed to fetch
          - generic [ref=e47]:
            - generic [ref=e48]:
              - generic [ref=e49]: Email
              - textbox "Email" [ref=e50]: superadmin.e2e@test.com
            - generic [ref=e51]:
              - generic [ref=e52]: Password
              - textbox "Password" [ref=e53]: password123
            - button "Sign in" [active] [ref=e54]
  - button "Open Next.js Dev Tools" [ref=e60] [cursor=pointer]
  - alert [ref=e64]
```

# Test source

```ts
  1  | import { test as setup } from '@playwright/test';
  2  | import * as path from 'path';
  3  | 
  4  | const roles = [
  5  |   { name: 'superadmin', email: 'superadmin.e2e@test.com' },
  6  |   { name: 'branchadmin', email: 'admin.a.e2e@test.com' },
  7  |   { name: 'teacher', email: 'teacher.a1.e2e@test.com' },
  8  | ];
  9  | 
  10 | for (const role of roles) {
  11 |   setup(`authenticate as ${role.name}`, async ({ page }) => {
  12 |     const authFile = path.join(__dirname, `../playwright/.auth/${role.name}.json`);
  13 |     
  14 |     await page.goto('/login');
  15 |     
  16 |     await page.getByLabel('Email').fill(role.email);
  17 |     await page.getByLabel('Password').fill('password123');
  18 |     await page.getByRole('button', { name: 'Sign in' }).click();
  19 | 
  20 |     try {
> 21 |       await page.waitForURL('/', { timeout: 10000 });
     |                  ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
  22 |     } catch (e) {
  23 |       const errorMsg = page.locator('.text-red-500');
  24 |       if (await errorMsg.isVisible({ timeout: 2000 })) {
  25 |         console.log('Login error:', await errorMsg.textContent());
  26 |       }
  27 |       throw e;
  28 |     }
  29 |     
  30 |     // Check that we are logged in by seeing "Academic Structure" link or something similar,
  31 |     // Actually, dashboard has something? Let's just wait for 1000ms.
  32 |     await page.waitForTimeout(1000);
  33 | 
  34 |     await page.context().storageState({ path: authFile });
  35 |   });
  36 | }
  37 | 
```