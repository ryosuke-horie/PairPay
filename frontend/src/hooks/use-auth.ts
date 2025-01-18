import { useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import type { RegisterInput, RegisterResponse, LoginInput, LoginResponse, ApiError } from '@/types/auth';

export function useAuth() {
  const [backendUrl, setBackendUrl] = useState('http://localhost:8787');

  useEffect(() => {
    const url = document.querySelector('[data-backend-url]')?.getAttribute('data-backend-url');
    if (url) {
      setBackendUrl(url);
    }
  }, []);

  const register = useMutation<RegisterResponse, ApiError, RegisterInput>({
    mutationFn: async (input: RegisterInput) => {
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
        mode: 'cors',
      });

      if (!response.ok) {
        const error = (await response.json()) as ApiError;
        throw new Error(error.error || '登録に失敗しました');
      }

      return response.json() as Promise<RegisterResponse>;
    },
  });

  const login = useMutation<LoginResponse, ApiError, LoginInput>({
    mutationFn: async (input: LoginInput) => {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
        mode: 'cors',
      });

      if (!response.ok) {
        const error = (await response.json()) as ApiError;
        throw new Error(error.error || 'ログインに失敗しました');
      }

      const data = (await response.json()) as LoginResponse;
      // JWTトークンをローカルストレージに保存
      localStorage.setItem('token', data.token);
      return data;
    },
  });

  return {
    register,
    login,
  };
}