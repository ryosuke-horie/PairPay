import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">ログイン</h1>
        <p className="text-sm text-muted-foreground">
          メールアドレスとパスワードを入力してログインしてください
        </p>
      </div>
      <LoginForm />
    </div>
  );
}