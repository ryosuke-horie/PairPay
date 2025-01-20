import { z } from "zod";

// 基本的なユーザー情報のスキーマ
export const userSchema = z.object({
	id: z.number(),
	name: z.string(),
	email: z.string().email(),
});

// パスワードを含むユーザースキーマ
export const userWithPasswordSchema = userSchema.extend({
	password: z.string(),
});

// ユーザー作成入力のスキーマ
export const userCreateInputSchema = z.object({
	name: z.string().min(1, "名前は必須です"),
	email: z.string().email("有効なメールアドレスを入力してください"),
	password: z.string().min(8, "パスワードは8文字以上である必要があります"),
});

// 型定義のエクスポート
export type User = z.infer<typeof userSchema>;
export type UserWithPassword = z.infer<typeof userWithPasswordSchema>;
export type UserCreateInput = z.infer<typeof userCreateInputSchema>;

// レスポンス型
export type UserResponse = Omit<User, "password">;
