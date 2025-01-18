import { DrizzleD1Database } from 'drizzle-orm/d1';
import { ContextVariableMap } from 'hono';

// カスタムバリアブルの型定義
export interface Variables extends ContextVariableMap {
  user: {
    id: number;
    email: string;
  };
}

// 環境変数の型定義
export interface Bindings {
  DB: D1Database;
  JWT_SECRET: string;
}

// ユーザー関連の型定義
export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

// DB型定義
export interface Database {
  db: DrizzleD1Database;
}
