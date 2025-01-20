import { z } from "zod";
import { userCreateInputSchema, userSchema } from "../types/user";

// ユーザー登録関連
export const registerInputSchema = userCreateInputSchema;
export const registerResponseSchema = z.object({
	message: z.string(),
});

// ログイン関連
export const loginInputSchema = z.object({
	email: z.string().email("有効なメールアドレスを入力してください"),
	password: z.string().min(1, "パスワードは必須です"),
});

export const loginResponseSchema = z.object({
	message: z.string(),
	token: z.string(),
	user: userSchema,
});

// エラーと検証
export const apiErrorSchema = z.object({
	error: z.string(),
});

export const tokenValidationResponseSchema = z.object({
	isValid: z.boolean(),
});

// 型のエクスポート
export type RegisterInput = z.infer<typeof registerInputSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
export type TokenValidationResponse = z.infer<
	typeof tokenValidationResponseSchema
>;
