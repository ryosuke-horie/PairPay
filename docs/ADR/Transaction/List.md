# 収支管理機能 設計ドキュメント 一覧機能

## 1. コンテキスト

収支一覧を表示するための基本的なコンポーネント構造を設計

## 2. データ構造

### トランザクション（transactions テーブル）

- id: number (主キー)
- title: string (取引内容)
- payerId: number (支出者ID)
- amount: number (金額)
- transactionDate: Date (取引日)
- createdAt: Date
- updatedAt: Date

## 3. コンポーネント設計

### コンポーネント構成

```
components/transactions/
  ├── transaction-list.tsx      // 取引一覧の親コンポーネント
  └── transaction-card.tsx      // 個々の取引を表示するカードコンポーネント
```

### TransactionList コンポーネント

- 役割：取引一覧の表示制御とデータ取得
- 機能：
  - 登録されている収支を全表示する
  - React Queryによる状態管理
  - ローディング状態とエラー状態の処理
  - TransactionCardコンポーネントへのデータ受け渡し

### TransactionCard コンポーネント

- 役割：個々の取引情報の表示
- 表示項目：
  - 取引のタイトル
  - 金額
  - 取引日
  - 支払者名
- 使用コンポーネント：
  - shadcn/uiのCardコンポーネント

## 4. データフロー

1. TransactionListコンポーネントがマウントされる
2. tRPCを通じて取引データを取得
3. 取得したデータを各TransactionCardコンポーネントにマッピング
4. ユーザーに取引一覧を表示

## 5. 備考

- 初期実装ではフィルタリング機能は含まない
- ページネーションやソート機能は将来的な拡張として考慮

## 6. テスト設計

### TransactionRepository テスト

findAllメソッドのテストケース：

- 全ての取引を正常に取得できること
  - DBから取得したデータが正しい構造（id, title, payerId, amount, transactionDate, createdAt, updatedAt）を持っているか検証
  - 複数のトランザクションが正しく取得できているか検証
- 取引が存在しない場合は空配列を返すこと
  - DBが空の場合の挙動を検証

### TransactionService テスト

getAllTransactionsメソッドのテストケース：

- 全ての取引履歴を正常に取得できること
  - リポジトリから取得したデータを正しく返却できているか検証
  - データの構造が期待通りか検証
- 取引が存在しない場合は空配列を返すこと
  - リポジトリから空配列が返された場合の挙動を検証
