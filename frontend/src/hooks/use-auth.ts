'use client';

import { useCallback, useEffect, useState } from 'react';
import type { LoginInput, RegisterInput } from '../../../packages/shared/src/schemas/auth';
import { User } from '../../../packages/shared/src/types/user';
import { api } from '../trpc/client';

interface AuthHookResult {
  user: User | null;
  isAuthenticated: boolean;
  register: (data: RegisterInput) => Promise<void>;
  login: (data: LoginInput) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

export function useAuth(): AuthHookResult {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validateTokenQuery = api.auth.validateToken.useQuery(undefined, {
    enabled: false,
    retry: false,
  });
  
  const meQuery = api.auth.me.useQuery(undefined, {
    enabled: false,
    retry: false,
  });

  // 認証状態の確認
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const result = await validateTokenQuery.refetch();
        if (result.data?.isValid) {
          const meResult = await meQuery.refetch();
          if (meResult.data?.user) {
            setUser(meResult.data.user);
            setIsAuthenticated(true);
          }
        } else {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { mutateAsync: registerMutation } = api.auth.register.useMutation();
  const { mutateAsync: loginMutation } = api.auth.login.useMutation();

  const register = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      setError(null);
      await registerMutation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録中にエラーが発生しました');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await loginMutation(data);
      localStorage.setItem('token', result.token);
      setUser(result.user);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログイン中にエラーが発生しました');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return {
    user,
    isAuthenticated,
    register,
    login,
    logout,
    isLoading,
    error,
  };
}