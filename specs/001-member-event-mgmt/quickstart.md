# Quickstart: 団体メンバー・イベント管理ツール

## 前提条件

- Node.js 20 以上
- npm 10 以上

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# データベースの初期化（SQLite ファイルを生成 + スキーマ適用）
npm run db:migrate

# 開発サーバーの起動
npm run dev
```

ブラウザで `http://localhost:3000` を開く。

## 主要コマンド

| コマンド | 内容 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run db:migrate` | DBマイグレーション実行 |
| `npm run db:studio` | Prisma Studio（DB GUI）起動 |
| `npm test` | ユニット・統合テスト実行（Vitest） |
| `npm run test:e2e` | E2Eテスト実行（Playwright） |
| `npm run lint` | リント実行 |
| `npm run typecheck` | 型チェック実行 |

## ディレクトリ構成

```text
src/
├── app/                    # Next.js App Router ページ・APIルート
│   ├── page.tsx            # ダッシュボード
│   ├── members/            # メンバー管理画面
│   │   ├── page.tsx        # 一覧
│   │   ├── new/page.tsx    # 新規作成
│   │   └── [id]/edit/page.tsx  # 編集
│   ├── events/             # イベント管理画面
│   │   ├── page.tsx        # 一覧
│   │   ├── new/page.tsx    # 新規作成
│   │   ├── [id]/page.tsx   # 詳細
│   │   └── [id]/edit/page.tsx  # 編集
│   └── api/                # APIルート
│       ├── members/        # メンバーCRUD
│       ├── events/         # イベントCRUD
│       └── attendances/    # 参加記録CRUD
├── components/             # 共通UIコンポーネント
├── lib/                    # ユーティリティ・DB接続
│   └── prisma.ts           # Prismaクライアント
└── types/                  # 共通型定義

prisma/
├── schema.prisma           # データモデル定義
└── migrations/             # マイグレーション履歴

tests/
├── unit/                   # ユニットテスト（Vitest）
├── integration/            # 統合テスト（Vitest）
└── e2e/                    # E2Eテスト（Playwright）
```

## データリセット

```bash
# DBファイルを削除して再作成
rm prisma/dev.db
npm run db:migrate
```
