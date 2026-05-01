# 元老院 PC Agent

元老院コンソールの「勅命に下す」→ コマンドキュー → **実 PC 実行** を繋ぐローカル常駐プロセス。

## 仕組み

```
元老院 UI
   ↓ enqueueCommand
GAS（コマンドシート: queued）
   ↓ getCommands (poll, agent)
PC Agent
   ↓ child_process.exec（type ホワイトリスト）
   ↓ updateCommand (status=done/error, result=[type]/[exit]/[log])
GAS（コマンドシート: done/error）
```

## セキュリティモデル（二重防衛）

1. **GAS 側**：`ALLOWED_COMMANDS` で type / required / enum を厳密チェック、`FORBIDDEN_PAYLOAD_PATTERNS` で危険文字列拒否
2. **agent 側**：`HANDLERS` に登録された type のみ実行。任意シェル文字列は受け付けない

両方に登録された type のみが実 PC で動く。

## 対応 type

| type | payload | 動作 |
|---|---|---|
| `ping` | なし | GAS が即 done 化（agent には来ない） |
| `openApp` | `{ name: 'chrome' \| 'vscode' \| 'explorer' \| 'finder' }` | アプリを起動 |
| `buildApp` | `{ project: 'genroin' }` | `npm run build` を実行 |
| `sync` | なし | プレースホルダ |

## セットアップ

```sh
cd F:/FGoogleDrive/元老院/コード/genroin/pc-agent
npm install
cp .env.example .env
# .env を編集（GAS_URL / SECRET）
npm start
```

要件：Node 18+（global `fetch` を使用）

## .env

| key | 説明 |
|---|---|
| `GAS_URL` | GAS Web App の `/exec` URL |
| `SECRET` | `_gas_code.gs` の `const SECRET` と同値 |
| `POLL_MS` | poll 間隔。デフォルト 5000ms |

### POLL_MS と GAS クォータ

GAS 無料枠：90 分/日、Workspace：6 時間/日。

| 間隔 | 1日あたり呼び出し | 推定 GAS 実行時間（500ms/回） |
|---|---|---|
| 3000ms | 28,800 | ~4.0 h（無料超過） |
| 5000ms | 17,280 | ~2.4 h（無料超過、Workspace OK） |
| 10000ms | 8,640 | ~1.2 h（無料 OK） |

無料アカウントなら 10000ms 以上を推奨。

## 動作確認

1. agent を起動（`npm start`）
2. 元老院 UI で `enqueueCommand` する（例：openApp + chrome）
3. agent コンソールに `[agent] → CMD-... type=openApp` と出る
4. Chrome が起動する
5. GAS のコマンドシートで該当行のステータスが `done`、結果列に `[type] openApp / [exit] 0 / [log] opened chrome` が入る

## ログ例

```
[agent] starting — poll every 5000 ms
[agent] GAS_URL: https://script.google.com/macros/s/AKfycbz...
[agent] handlers: ping, openApp, buildApp, sync
[agent] received 1 command(s)
[agent] → CMD-20260501-001 type=openApp
[agent] ✓ CMD-20260501-001 → done
```
