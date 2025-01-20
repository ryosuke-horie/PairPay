'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { registerInputSchema } from '@share-purse/shared';

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
  name: string;
  email: string;
  password: string;
};

export function RegisterForm() {
  const { toast } = useToast();
  const { register, isLoading, error } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(registerInputSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await register(values);
      toast({
        title: '登録完了',
        description: 'アカウントの登録が完了しました',
      });
      window.location.href = '/login';
    } catch (err) {
      toast({
        title: 'エラー',
        description: err instanceof Error ? err.message : '登録に失敗しました',
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>お名前</FormLabel>
              <FormControl>
                <Input
                  data-testid="name-input"
                  placeholder="山田 太郎"
                  {...field}
                />
              </FormControl>
              <FormMessage data-testid="name-error" />
            </FormItem>
          )}
        />
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
          data-testid="register-button"
        >
          {isLoading ? '登録中...' : 'アカウントを作成'}
        </Button>
      </form>
    </Form>
  );
}