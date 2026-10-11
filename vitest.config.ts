import { defineConfig } from 'vitest/config';

// vite.config.ts を使うと、Cloudflare プラグインが作る Vite サーバーと Vitest のサーバーが衝突して
// 「There is already a server associated with the config.」で起動できないため、テストは別の設定で動かす
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
