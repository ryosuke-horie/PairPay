# 収支管理機能 設計ドキュメント 削除機能

## 1. コンテキスト

取引一覧の各項目に削除機能を追加し、ユーザーが個別の取引を削除できるようにする

## 2. 技術的な決定

### セキュリティ考慮事項

- 削除操作は認証済みユーザーのみが実行可能
- 自分が作成した取引のみ削除可能

### UIデザイン

- TransactionCardコンポーネントに削除ボタン（ゴミ箱アイコン）を追加
- 誤操作防止のため、削除前に確認ダイアログを表示
- 削除成功時はToast通知で完了を表示

## 3. コンポーネント設計

### コンポーネント構成の変更点

```
components/transactions/
  ├── transaction-list.tsx       // 既存
  ├── transaction-card.tsx      // 削除ボタンの追加
  └── delete-transaction-dialog.tsx  // 新規：削除確認ダイアログ
```

### TransactionCard コンポーネントの変更

- 削除ボタンの追加（右上にゴミ箱アイコン）
- 削除確認ダイアログの表示トリガー
- 削除中のローディング状態の表示

### DeleteTransactionDialog コンポーネント（新規）

- shadcn/uiのAlertDialogを使用
- 削除確認メッセージの表示
- 削除実行/キャンセルボタン

## 4. APIの設計

### トランザクション削除エンドポイント

- パス: mutation `transaction.delete`
- パラメーター: `transactionId: number`
- レスポンス:
  - 成功時: `{ message: string }`
  - エラー時: エラーメッセージ

## 5. バックエンド実装

### TransactionService

- `deleteTransaction(transactionId: number, userId: number): Promise<void>`
  - 取引の存在確認
  - 削除権限の確認（作成者のみ削除可能）
  - 論理削除/物理削除の実行

### TransactionRepository

- `delete(transactionId: number): Promise<void>`
  - DBからの削除処理

## 6. データフロー

1. ユーザーが取引カードの削除ボタンをクリック
2. 削除確認ダイアログを表示
3. 確認後、tRPC mutationを実行
4. バックエンドで権限確認
5. DBから取引を削除
6. フロントエンドで取引一覧を更新
7. 完了通知を表示

## 7. エラーハンドリング

- 権限エラー: "この取引を削除する権限がありません"
- 存在しない取引: "指定された取引が見つかりません"
- 通信エラー: "削除中にエラーが発生しました。再度お試しください"

## 8. テスト設計

### ユニットテスト

- TransactionService
  - 正常な削除処理
  - 存在しない取引のエラー処理
  - 権限エラーの処理
- TransactionRepository
  - 削除処理の確認
