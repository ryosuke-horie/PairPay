import { test, expect } from '@playwright/test';
import { generateTestUser, invalidUser } from './test-data/users';

test.describe('認証フロー', () => {
  test('新規ユーザー登録からログインまでの流れ', async ({ page }) => {
    const newUser = generateTestUser();

    // 1. 登録ページへ移動
    await page.goto('/register');

    // 2. フォームの入力
    await page.getByTestId('name-input').fill(newUser.name);
    await page.getByTestId('email-input').fill(newUser.email);
    await page.getByTestId('password-input').fill(newUser.password);

    // 3. 登録の実行と完了を待機
    await page.getByTestId('register-button').click()

    // 4. ログインフォームの入力
    await page.getByTestId('email-input').fill(newUser.email);
    await page.getByTestId('password-input').fill(newUser.password);

    // 5. ログインの実行と完了を待機
    await Promise.all([
      page.getByTestId('login-button').click()
    ]);

    // TODO: 6. ログイン後の表示確認
  });

  test('無効な認証情報でのログイン', async ({ page }) => {
    // 1. ログインページへ移動
    await page.goto('/login');

    // 2. 無効な認証情報を入力
    await page.getByTestId('email-input').fill(invalidUser.email);
    await page.getByTestId('password-input').fill(invalidUser.password);

    // 3. ログインボタンをクリック
    await page.getByTestId('login-button').click();

    // 4. エラーメッセージの表示を確認
    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page.getByTestId('error-message')).toContainText('メールアドレスまたはパスワードが正しくありません');

    // 5. URLが変更されていないことを確認
    await expect(page).toHaveURL('/login');
  });

  test('登録フォームのバリデーション', async ({ page }) => {
    // 1. 登録ページへ移動
    await page.goto('/register');

    // 2. 空のフォームを送信
    await page.getByTestId('register-button').click();

    // 3. 各フィールドのバリデーションメッセージを確認
    await expect(page.getByTestId('name-error')).toContainText('名前は必須です');
    await expect(page.getByTestId('email-error')).toContainText('有効なメールアドレスを入力してください');
    await expect(page.getByTestId('password-error')).toContainText('パスワードは8文字以上である必要があります');

    // 4. 無効なメールアドレスの入力
    await page.getByTestId('email-input').fill('invalid-email');
    await page.getByTestId('register-button').click();
    await expect(page.getByTestId('email-error')).toContainText('有効なメールアドレスを入力してください');

    // 5. 短すぎるパスワードの入力
    await page.getByTestId('password-input').fill('123');
    await page.getByTestId('register-button').click();
    await expect(page.getByTestId('password-error')).toContainText('パスワードは8文字以上である必要があります');
  });
});