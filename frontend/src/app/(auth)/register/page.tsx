import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">アカウント作成</h1>
        <p className="text-sm text-muted-foreground">
          必要な情報を入力して、アカウントを作成してください
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}