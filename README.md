# 寝る前のカフェイン

その 1 杯を飲んだら、寝るときに体に何 mg のカフェインが残るかを確かめる Web アプリです。

https://caffeine-at-bedtime.ayasnppk00.workers.dev/

## できること

- 7 つの飲み物のボタンに、今飲んだ場合の就寝時の残量と判定（大丈夫、グレー、アウト）を表示します。
- 飲んだ飲み物のボタンをタップすると、タップした時刻で記録します。直前の記録は取り消せます。
- 何も飲まなかった場合の就寝時の残量、昨夜の残量、今日飲んだ量を表示します。
- 設定画面で、就寝時刻、判定の境目、各飲み物のカフェイン量を変更できます。

残量は、半減期を 8 時間として計算します。計算式、判定の境目、カフェイン量の出典は [docs/requirements.md](./docs/requirements.md) に書いています。

記録と設定はブラウザの localStorage に保存し、サーバーには送りません。iPhone の Safari は 7 日間開かなかったサイトの localStorage を削除します。記録を残すには、ホーム画面に追加して使います。

## 開発

Node.js のバージョンは `.node-version`、pnpm のバージョンは `package.json` の `packageManager` に書いています。

```sh
pnpm install
pnpm dev
```

| コマンド | 内容 |
|---|---|
| `pnpm dev` | 開発サーバーを起動する |
| `pnpm test` | Vitest でテストを実行する |
| `pnpm lint` | Biome で静的解析をする |
| `pnpm type-check` | TypeScript の型エラーを確かめる |
| `pnpm build` | 本番用にビルドする |
| `pnpm deploy` | Cloudflare Workers にデプロイする |

画面と見た目の設計は [docs/design.md](./docs/design.md)、テストの設計は [docs/test-design.md](./docs/test-design.md) に書いています。

## ライセンス

[MIT](./LICENSE)
