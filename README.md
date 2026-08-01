# 美容室LINEbot

美容室オーナー向けの受託案件。LINE公式アカウントに届くFAQ（営業時間・メニュー料金・施術時間・駐車場など）にAIが自動応答し、答えられない質問・予約変更/キャンセルの相談はオーナーへ自動通知するLINE botです。

## 構成

- **Next.js**（App Router / TypeScript）：Webhook受信、FAQ応答ロジック、管理画面
- **LINE Messaging API**（`@line/bot-sdk`）：Webhook受信・返信・エスカレーション通知・友だち一斉配信
- **Claude API**（Haiku 4.5、`@anthropic-ai/sdk`）：FAQ照合・回答生成、確信度が低い場合のエスカレーション判定
- **Supabase**（`salon`スキーマ）：FAQ・お知らせデータの保存先
- **Vercel**：ホスティング

## ディレクトリ構成

```
app/
  api/line/webhook/   LINE Webhook受信エンドポイント
  admin/              管理画面（FAQ・お知らせのCRUD、簡易パスワード認証）
lib/
  faq.ts              FAQ応答ロジック（Supabase + Claude）
  line.ts             LINE Messaging APIクライアント
  supabase.ts         Supabaseクライアント（salonスキーマ）
  anthropic.ts        Claude APIクライアント
  session.ts          管理画面の簡易セッション検証
proxy.ts              /admin配下の認証保護（旧middleware）
```

## セットアップ

```bash
npm install
```

`.env.local`に以下の環境変数が必要です（値は本番はVercelの環境変数を参照）。

| 変数 | 用途 |
|---|---|
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase接続（`salon`スキーマ） |
| `LINE_CHANNEL_SECRET` / `LINE_CHANNEL_ACCESS_TOKEN` | LINE Messaging API |
| `LINE_OWNER_USER_ID` | エスカレーション通知の送信先（オーナーのLINEユーザーID） |
| `ANTHROPIC_API_KEY` | Claude API |
| `ADMIN_PASSWORD` | 管理画面ログインパスワード |
| `SESSION_SECRET` | 管理画面セッションCookieの署名鍵 |

```bash
npm run dev    # 開発サーバー
npm run lint   # ESLint
npm run build  # 本番ビルド
```

## デプロイ

`main`ブランチへのpushでVercelに自動デプロイされます（GitHub連携済み）。LINE Developersコンソール側のWebhook URLは本番URL（`/api/line/webhook`）を指定してください。

## ドキュメント

要件・設計・運用マニュアルはプロジェクトルート（`webapp/`の一つ上の階層）の`01_questions.md`〜`07_manual.md`を参照してください。
