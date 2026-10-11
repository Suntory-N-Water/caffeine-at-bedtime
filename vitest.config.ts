import { defineConfig } from 'vitest/config';

// vite.config.ts の Cloudflare プラグインはテスト中に workerd を起動しようとするため、テストは別の設定で動かす
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
