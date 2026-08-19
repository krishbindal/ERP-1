import { defineConfig, devices } from "@playwright/test";

type Role = "superadmin" | "branchadmin" | "teacher";
type BrowserName = "chromium" | "mobile-chrome" | "webkit";

function createRoleProject(role: Role, browser: BrowserName) {
  let deviceName = "Desktop Chrome";
  if (browser === "mobile-chrome") deviceName = "Pixel 5";
  if (browser === "webkit") deviceName = "Desktop Safari";

  return {
    name: `${browser}-${role}`,
    use: { 
      ...devices[deviceName],
      storageState: `playwright/.auth/${role}.json`,
    },
    metadata: {
      role,
      browser,
    },
    dependencies: ["setup"],
  };
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "setup",
      testMatch: "**/*.setup.ts",
    },
    
    createRoleProject("superadmin", "chromium"),
    createRoleProject("branchadmin", "chromium"),
    createRoleProject("teacher", "chromium"),

    createRoleProject("superadmin", "mobile-chrome"),
    createRoleProject("branchadmin", "mobile-chrome"),
    createRoleProject("teacher", "mobile-chrome"),

    createRoleProject("superadmin", "webkit"),
    createRoleProject("branchadmin", "webkit"),
    createRoleProject("teacher", "webkit"),
  ],

  webServer: {
    command: process.env.CI ? "npm run start:web" : "npm run dev:web",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    cwd: "../../",
  },
});

