'use client';

import { useCallback, useEffect, useState } from 'react';
import type { LoginInput, RegisterInput, User } from '@share-purse/shared';
import { trpc } from '../trpc/client';
import { clearAuthToken, getAuthToken, setAuthToken, validateAuthToken } from '../trpc/provider';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 認証状態の確認
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const isValid = await validateAuthToken();
        if (isValid) {
          const { user } = await trpc.auth.me.query();
          setUser(user);
          setIsAuthenticated(true);
        } else {
          clearAuthToken();
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
  }, []);

  const register = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      setError(null);
      await trpc.auth.register.mutate(data);
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
      const result = await trpc.auth.login.mutate(data);
      setAuthToken(result.token);
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
    clearAuthToken();
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