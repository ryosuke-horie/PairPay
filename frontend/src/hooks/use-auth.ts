import { useMutation } from '@tanstack/react-query';
import type { LoginInput, RegisterInput } from '@/types/auth';
import { config } from '@/config/env';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContext {
  user: User | null;
  register: ReturnType<typeof useRegisterMutation>;
  login: ReturnType<typeof useLoginMutation>;
}

interface RegisterResponse {
  message: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface ApiError {
  message: string;
}

interface ApiErrorResponse {
  error: string;
}

const useRegisterMutation = () => {
  return useMutation<RegisterResponse, ApiError, RegisterInput>({
    mutationFn: async (data) => {
      const response = await fetch(`${config.backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.error);
      }

      const result = await response.json() as RegisterResponse;
      return result;
    },
  });
};

const useLoginMutation = () => {
  return useMutation<LoginResponse, ApiError, LoginInput>({
    mutationFn: async (data) => {
      const response = await fetch(`${config.backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json() as ApiErrorResponse;
        throw new Error(errorData.error || 'Invalid email or password');
      }

      const result = await response.json() as LoginResponse;
      localStorage.setItem('token', result.token);
      return result;
    },
  });
};

let currentUser: User | null = null;

export function useAuth(): AuthContext {
  const register = useRegisterMutation();
  const login = useLoginMutation();

  // ログイン成功時にユーザー情報を設定
  if (login.data?.user && !currentUser) {
    currentUser = login.data.user;
  }

  return {
    user: currentUser,
    register,
    login,
  };
}