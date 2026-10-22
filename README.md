# Socket Board

React、Hono、SQLite、Socket.IO で作った匿名掲示板です。構成は `memo-app` に合わせています。投稿は SQLite に保存し、新しい投稿を接続中の画面に即時配信します。投稿の削除機能はなく、時刻も保存しません。

## 起動

Node.js 22.13 以上と pnpm が必要です。

```bash
pnpm install
pnpm dev
```

<http://localhost:5173> を開いてください。Vite は `/socket.io` を Hono・Socket.IO（ポート 3001）へ転送します。別のブラウザタブで投稿すると、開いている画面にも新着が表示されます。接続が切れた場合は Socket.IO が再接続し、保存済みの投稿を読み直します。

## 構成

- `workspaces/client/main.tsx`: React の画面、Socket.IO 通信、画面の状態管理
- `workspaces/server/index.ts`: SQLite、Hono サーバー、Socket.IO 通信
- `data/app.sqlite`: 起動時に作られる SQLite ファイル

## Socket.IO イベント

- `posts`: 接続時にサーバーから投稿一覧（新しい順）を受け取る
- `post:create`: クライアントから本文（1〜500文字）を送る
- `post`: サーバーから全クライアントに新着投稿 `{ "id": 1, "text": "本文" }` を配信

投稿データは `id` と `text` だけです。
