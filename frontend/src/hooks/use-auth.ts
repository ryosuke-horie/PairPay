import { useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import type { RegisterInput, RegisterResponse, ApiError } from '@/types/auth';

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

      return response.json();
    },
  });

  return {
    register,
  };
}