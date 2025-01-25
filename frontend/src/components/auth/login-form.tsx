'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { loginInputSchema } from '../../../../packages/shared/src/schemas/auth';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';

type FormValues = {
  email: string;
  password: string;
};

export function LoginForm() {
  const { toast } = useToast();
  const { login, isLoading, error } = useAuth();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await login(values);
      toast({
        title: 'ログイン成功',
        description: 'ログインに成功しました',
      });

      router.push('/transactions');
    } catch (err) {
      toast({
        title: 'エラー',
        description: err instanceof Error ? err.message : 'ログインに失敗しました',
        variant: 'destructive',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive" data-testid="error-message">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input
                  data-testid="email-input"
                  placeholder="example@example.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage data-testid="email-error" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>パスワード</FormLabel>
              <FormControl>
                <Input
                  data-testid="password-input"
                  placeholder="********"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage data-testid="password-error" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
          data-testid="login-button"
        >
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </Button>
      </form>
    </Form>
  );
}