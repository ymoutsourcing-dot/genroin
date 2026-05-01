# 元老院プロジェクト

意思決定OS。React PWA（Vercel）+ GAS + Google Sheets + AI（OpenAI gpt-4o-mini × Anthropic claude-haiku-4-5 のコンセンサス2社）構成。

## 場所・URL

- **コード**: `F:\FGoogleDrive\元老院\コード\genroin`
- **リポジトリ**: https://github.com/ymoutsourcing-dot/genroin
- **本番（Vercel）**: https://genroin.vercel.app
- **GAS Web App**: `https://script.google.com/macros/s/AKfycbzGMnq2PCB2zXkpz_-a2DNH0svR-TCLJnyTqCD2Bts-YYp2ur0PUv-IQEFFJgz-Brjy/exec`
- **GAS エディタ**: `https://script.google.com/home/projects/1ELMT-sGjCeiwCcYZg8Xzs1-MbCC-GY5TNdoqxfXooTiaeNw_ygeDqibL/edit`
- **スプレッドシート**: マイドライブ「元老院システム」（GAS が自動作成、SHEET_ID は GAS スクリプトプロパティに保存）

## ファイル

- `src/GenroinConsole.jsx` — 単一の主コンポーネント（2000行超、状態・ロジック・UI 全部）
- `_gas_code.gs` — GAS 側コードの**ローカル正本**。エディタへは手動コピペ＋デプロイで反映
- `public/manifest.json` / `public/sw.js` / `public/icon.png` / `public/icon-512.png` — PWA 構成
- `eslint.config.js` / `vite.config.js` / `package.json` — フロントビルド系

## スタック

- フロント: React 19 + Vite + Vercel（PWA、Service Worker 登録済）
- バックエンド: Google Apps Script + Google Sheets
- AI: OpenAI `gpt-4o-mini` + Anthropic `claude-haiku-4-5`（2社コンセンサス）

## 認証・セキュリティ（重要）

- **secret**: `vXrkAMH0xcSbnnWwgo5sO4EFGZdLHVzdetYoXVcG`（40字、`abc123` から rotate 済）
  - React 側 `GAS_SECRET` と GAS 側 `SECRET` で**同値**。両方更新が必要
  - **secret を code に直書き OK**（漏れ前提、防衛は `ALLOWED_COMMANDS` ホワイトリスト）
- **CORS 回避**: fetch の `Content-Type` は `text/plain;charset=utf-8`（preflight 回避、GAS 側 `JSON.parse(e.postData.contents)` でそのまま読める）
- **PC 実行ホワイトリスト**: `ALLOWED_COMMANDS = { ping, openApp, sync, buildApp }`
- **OAuth スコープ**: `appsscript.json` に `spreadsheets` / `drive` / `script.external_request` / `script.scriptapp` を明示

## 実装済み機能

| 機能 | 概要 |
|---|---|
| AI判断タブ | カテゴリ→入力→OK/NG 判定、履歴 50件、★重要/破棄/保留 |
| 喫煙所→元老院 | 自由投稿 → AI 構造化（要約/カテゴリ/優先度/タイトル）|
| 議事タブ | 採用Yes/No、メモ、勅命に下す（Yes時のみ）+ フィルタ（未決/採用/否決/全て、デフォ未決）|
| 勅命タブ | 案件一覧、ステータス、実行録追加 |
| AI進言（右パネル） | GPT が状況分析して全体戦略を提案 |
| AI審議（議題ごと） | 採用理由／懸念点／推奨アクション の3ブロック |
| AI再審議（反映） | textarea で陛下コメント → GPT が論点更新（`aiReviewWithFeedback`）|
| ワンクリック | AI進言の C-XXX を即採用＋勅命化 |
| バックアップ／復元 | Drive「元老院バックアップ」フォルダ、JSON 保存 |
| 通知 | 優先度A未決＋期限超過のアプリ内バナー |
| 共有URL | `?tab=&id=` で deep link、🔗 コピーボタン |
| 元老院モード | OFF=白基調 / ON=黒+金 雅文言、トグル切替 |
| 3カラム | 左パネル（戦況）、中央メイン、右パネル（AI進言＋メモ＋バックアップ）|

## 未着手（次の進化）

1. **PC agent** — `enqueueCommand` した queued コマンドを PC側で poll/実行する常駐プログラム
2. **Web Push** — サーバ起点の本物の通知（VAPID + Service Worker）
3. **LINE/Slack 連携** — 進言や勅命を外部チャンネルへ

## 🔴 復旧可能性（最重要・触る前に確認）

| 対象 | 復旧可否 | 備考 |
|---|---|---|
| シート行 | ✅ 可 | Drive 内バックアップから復元可 |
| コード | ✅ 可 | ローカル正本 + git |
| 既存デプロイの新バージョン | ✅ 可 | 旧バージョンに戻せる |
| **スクリプトプロパティ**（OPENAI_API_KEY / ANTHROPIC_API_KEY / SHEET_ID）| ❌ **不可** | 再設定必要。**触る時は事前確認必須** |
| **デプロイURL**（/exec の ID）| ❌ **不可** | 「新しいデプロイ」を作ると別 ID で React 側 URL 不一致になる。**「デプロイを管理→編集→新バージョン」のみ使う** |

## 慣習・癖

- `useState` 初期化関数を活用して TDZ 回避（`const X; useState(X)` は X が下にあると死ぬ）
- 元老院モード ON 時の文言は雅口調、OFF はシンプル。`T(regal, normal)` ヘルパーで分岐
- GAS への大量コード push は Chrome MCP の chunked 注入が **fragile** → **手動コピペが安全・高速**（`gas-deploy-prompt` スキル参照）
- secret は code 直書き OK だが、新しい認可キーを追加する時は React/GAS 両側更新を忘れない

## 関連スキル（global、`~/.claude/skills/`）

- `gas-deploy-prompt` — `_gas_code.gs` 更新後の手動デプロイ依頼テンプレ（Chrome MCP push が不安定なケース用）
- `gas-deploy` — Chrome MCP で GAS デプロイダイアログ自動操作（成功時はこっちが速い）
- `genroin-safe-ops` — 危険操作（スクリプトプロパティ等の非バックアップ対象）の自動化／強警告ルール
- `chrome-keepalive` — Chrome MCP セッション開始時の Service Worker keepAlive

## 開発コマンド

```bash
# 開発サーバ
cd "F:/FGoogleDrive/元老院/コード/genroin"
npm run dev

# 本番ビルド（Vercel が自動だが手元確認用）
npm run build

# デプロイ（フロント）
git push origin main  # → Vercel 自動ビルド

# デプロイ（GAS）
# 1. _gas_code.gs を編集
# 2. gas-deploy-prompt スキルで手順表示
# 3. GAS エディタへ手動コピペ
# 4. デプロイを管理→編集→新バージョン→デプロイ（新規デプロイは作らない）
```

## このリポを触る AI への指示

- **スクリプトプロパティ削除/編集は事前確認必須**
- **「新しいデプロイ」ボタンは絶対押さない**（既存デプロイの編集のみ）
- secret rotation は React 側 `GAS_SECRET` と GAS 側 `SECRET` の両方更新
- `_gas_code.gs` 編集時は最後に「デプロイ手順を表示するか？」と聞く（gas-deploy-prompt 参照）
- `src/GenroinConsole.jsx` は2000行超の単一ファイル。分割は慎重に（state/handler の依存関係が密）
- AI 関連の変更は OpenAI と Anthropic の**両方**に対応（コンセンサス2社の前提）
