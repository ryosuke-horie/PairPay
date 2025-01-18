import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // テストファイルのパターンを指定
    include: ['**/*.test.ts'],
    // カバレッジレポートの設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/types/**'],
    },
    // テスト環境の設定
    environment: 'node',
    // タイムアウト時間を設定
    testTimeout: 10000,
    // Node.jsのWeb Crypto APIを使用可能にする
    globals: true,
  },
});
