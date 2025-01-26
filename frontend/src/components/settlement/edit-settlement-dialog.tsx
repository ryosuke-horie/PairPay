import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect } from "react";

const formSchema = z.object({
  shareRatio: z
    .number()
    .min(0, "0以上の数値を入力してください")
    .max(100, "100以下の数値を入力してください"),
  shareAmount: z
    .number()
    .min(0, "0以上の数値を入力してください"),
});

interface EditSettlementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  currentShareRatio: number;
  totalAmount: number;
  onSubmit: (shareRatio: number) => Promise<void>;
}

export function EditSettlementDialog({
  open,
  onOpenChange,
  title,
  currentShareRatio,
  totalAmount,
  onSubmit,
}: EditSettlementDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shareRatio: currentShareRatio * 100,
      shareAmount: Math.ceil(totalAmount * currentShareRatio),
    },
  });

  const watchShareRatio = form.watch("shareRatio");
  const watchShareAmount = form.watch("shareAmount");

  // 負担割合が変更されたら金額を更新
  useEffect(() => {
    const newAmount = Math.ceil(totalAmount * (watchShareRatio / 100));
    if (newAmount !== watchShareAmount) {
      form.setValue("shareAmount", newAmount, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [watchShareRatio, totalAmount]);

  // 金額が変更されたら負担割合を更新
  useEffect(() => {
    const newRatio = (watchShareAmount / totalAmount) * 100;
    if (newRatio !== watchShareRatio) {
      form.setValue("shareRatio", newRatio, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [watchShareAmount, totalAmount]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // 100で割って0-1の値に変換
      await onSubmit(values.shareRatio / 100);
      onOpenChange(false);
    } catch (error) {
      // エラーハンドリングは親コンポーネントで行う
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}の負担を編集</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="shareRatio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>割合（%）</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="5"
                      min="0"
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shareAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>負担金額（円）</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max={totalAmount}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 