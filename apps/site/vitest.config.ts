import { defineConfig } from 'vitest/config';

// Unit tests only. Browser journeys live in e2e/ and run with Playwright.
export default defineConfig({
  test: {
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**', '.next/**'],
  },
});
