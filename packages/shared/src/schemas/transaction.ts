import { z } from "zod";

// APIリクエスト用のスキーマ
export const createTransactionSchema = z.object({
	title: z.string().min(1, "取引内容を入力してください"),
	amount: z.number().positive("金額は0より大きい値を入力してください"),
	transactionDate: z.coerce.date(),
});

// フロントエンドのフォーム用のスキーマ
export const transactionFormSchema = z.object({
	title: z.string().min(1, "取引内容を入力してください"),
	amount: z.string().min(1, "金額を入力してください"),
	transactionDate: z.date(),
});

// フォーム値をAPIリクエスト用に変換するための関数
export const convertFormToApiInput = (
	formData: z.infer<typeof transactionFormSchema>,
) => {
	return {
		title: formData.title,
		amount: Number(formData.amount),
		transactionDate: formData.transactionDate,
	};
};
