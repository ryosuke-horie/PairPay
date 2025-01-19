import { z } from "zod";

export const registerInputSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上である必要があります"),
});

export const loginInputSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードは必須です"),
});

export const registerResponseSchema = z.object({
  message: z.string(),
});

export const loginResponseSchema = z.object({
  message: z.string(),
  token: z.string(),
});

export const apiErrorSchema = z.object({
  error: z.string(),
});