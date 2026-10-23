import { defineConfig, devices } from '@playwright/test';

const port = 3200;

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
    // Journeys and axe checks run on the still page; e2e/motion.spec.ts turns motion back on (C-083).
    contextOptions: { reducedMotion: 'reduce' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: process.env.CI ? 'pnpm start' : 'pnpm dev',
    port,
    reuseExistingServer: !process.env.CI,
  },
});
