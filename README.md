# Share Purse

## Project Structure

```
share-purse/
├── package.json          # Workspace root configuration
├── packages/
│   └── shared/          # Shared package for types and schemas
│       ├── src/
│       │   ├── types/   # Shared TypeScript types
│       │   └── schemas/ # Shared Zod schemas
│       └── package.json
├── backend/             # Backend application (Hono)
└── frontend/           # Frontend application (Next.js)
```

## Setup

初回セットアップ:

```bash
# 依存関係のインストール
npm install

# 共有パッケージのビルド
npm run build:shared
```

## Development

開発サーバーの起動:

```bash
# すべてのアプリケーションを起動（共有パッケージのwatchモードを含む）
npm run dev

# または個別に起動
npm run dev:apps    # フロントエンドとバックエンドのみ
npm run dev:shared  # 共有パッケージのwatchモードのみ
```

### 共有パッケージの開発

`packages/shared`ディレクトリには、フロントエンドとバックエンド間で共有される型定義やスキーマが含まれています。

```bash
# 共有パッケージの開発時（watchモード）
npm run dev:shared

# 変更を1回だけビルド
npm run build:shared

# ビルド成果物のクリーン
npm run clean
```

## Workspace Structure

このプロジェクトはnpm workspaceを使用したモノレポ構造を採用しています。

### @share-purse/shared

フロントエンドとバックエンド間で共有される型定義やスキーマを含むパッケージです。

- `types/`: TypeScript型定義
- `schemas/`: Zodスキーマ定義

### Backend (Hono)

バックエンドアプリケーションです。

- tRPCサーバーとしての機能を提供
- HonoミドルウェアとしてtRPCを統合

### Frontend (Next.js)

フロントエンドアプリケーションです。

- tRPCクライアントを使用してバックエンドと通信
- 型安全なAPI呼び出しを実現

## 次のステップ

1. tRPCサーバーのセットアップ
   - Honoミドルウェアとの統合
   - ルーターの実装

2. tRPCクライアントのセットアップ
   - Next.jsとの統合
   - APIクライアントの実装

3. 既存のAPI実装をtRPCに移行
   - 認証関連のAPI
   - その他のエンドポイント
