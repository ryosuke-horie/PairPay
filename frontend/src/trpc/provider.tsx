'use client';

import { type ReactNode } from 'react';
import { trpc } from './client';

// trpcクライアントのグローバル設定
// アプリケーション起動時に自動的にトークンの検証を行う
export async function validateAuthToken() {
  try {
    const result = await trpc.auth.validateToken.query();
    return result.isValid;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

// トークンのクリア
export function clearAuthToken() {
  localStorage.removeItem('token');
}

// トークンの取得
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// トークンの設定
export function setAuthToken(token: string) {
  localStorage.setItem('token', token);
}

export function TrpcProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}