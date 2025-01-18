# 共有家計簿 SharePurse

[![Test](https://github.com/r-horie/share-purse/actions/workflows/test.yml/badge.svg)](https://github.com/r-horie/share-purse/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/r-horie/share-purse/branch/main/graph/badge.svg)](https://codecov.io/gh/r-horie/share-purse)

## 開発環境のセットアップ

```bash
# バックエンドのセットアップ
cd backend
npm install

# テストの実行
npm run test        # テストを監視モードで実行
npm run test:ci     # テストを1回実行（CI用）
npm run test:coverage # カバレッジレポートを生成
```

## バックエンドのディレクトリ構成

```
backend/
├── src/
│   ├── di/                    # 依存性注入（DI）関連
│   │   └── container.ts       # DIコンテナの実装
│   │
│   ├── repositories/          # データアクセス層
│   │   └── user.repository.ts # ユーザー関連のデータアクセス
│   │
│   ├── services/             # ビジネスロジック層
│   │   └── auth.service.ts   # 認証関連のビジネスロジック
│   │
│   ├── routes/              # ルーティング層
│   │   └── auth.route.ts    # 認証関連のエンドポイント
│   │
│   ├── middleware/          # ミドルウェア
│   │   └── auth.middleware.ts # 認証用ミドルウェア
│   │
│   ├── utils/              # ユーティリティ
│   │   └── auth.ts        # 認証関連のユーティリティ関数
│   │
│   ├── types/             # 型定義
│   │   └── index.ts      # アプリケーション全体の型定義
│   │
│   └── index.ts          # アプリケーションのエントリーポイント
│
├── drizzle/              # データベース関連
│   ├── schema.ts        # データベーススキーマ定義
│   └── migrations/      # マイグレーションファイル
```

### 各ディレクトリの役割

#### `src/di/`

- 依存性注入（DI）のためのコンテナを提供
- コンポーネント間の依存関係を管理
- テスト容易性と柔軟性を向上

#### `src/repositories/`

- データベースとのやり取りを担当
- CRUDオペレーションを実装
- データアクセスの抽象化を提供

#### `src/services/`

- ビジネスロジックを実装
- 複数のリポジトリを組み合わせた処理
- ドメインルールの適用

#### `src/routes/`

- APIエンドポイントの定義
- リクエストのバリデーション
- レスポンスの整形

#### `src/middleware/`

- リクエスト処理の共通機能
- 認証・認可の処理
- リクエスト・レスポンスの加工

#### `src/utils/`

- 共通のユーティリティ関数
- ヘルパー関数
- 再利用可能なロジック

#### `src/types/`

- TypeScriptの型定義
- インターフェースの定義
- 型の共有と再利用

#### `drizzle/`

- データベーススキーマの定義
- マイグレーションファイル
- データベース設定

### アーキテクチャの特徴

1. **レイヤードアーキテクチャ**
   - 各層の責務を明確に分離
   - 依存関係の方向を制御
   - コードの保守性を向上

2. **依存性注入（DI）**
   - コンポーネント間の疎結合を実現
   - テスト容易性を向上
   - 実装の差し替えが容易

3. **インターフェースベース設計**
   - 実装の詳細を隠蔽
   - モック化が容易
   - 拡張性の確保

## APIエンドポイント

### 認証関連

#### ユーザー登録

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "ユーザー名",
  "email": "example@example.com",
  "password": "password123"
}
```

#### ログイン

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "example@example.com",
  "password": "password123"
}
```

レスポンス例：

```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "name": "ユーザー名",
    "email": "example@example.com"
  }
}
```

### 認証が必要なエンドポイント

認証が必要なエンドポイントには、以下のヘッダーが必要です：

```
Authorization: Bearer JWT_TOKEN
```
