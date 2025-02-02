import { defineConfig, devices } from '@playwright/test';

const productionUrl = process.env.PROD_URL;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'html' : [['html'], ['list']],
  timeout: 30000,

  use: {
    // PROD_URL が指定されている場合はそれを、本番環境用の URL として利用
    baseURL: productionUrl || 'http://localhost:3000',
    trace: process.env.CI ? 'retain-on-failure' : 'on',
    video: process.env.CI ? 'retain-on-failure' : 'on',
    screenshot: process.env.CI ? 'only-on-failure' : 'on',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 本番テスト時には Web サーバーの起動は不要なため、productionUrl がある場合は webServer 設定を適用しない
  ...(productionUrl ? {} : {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
  }),
});
