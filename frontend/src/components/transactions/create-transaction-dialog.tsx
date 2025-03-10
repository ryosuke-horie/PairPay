"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { convertFormToApiInput, transactionFormSchema } from "../../../../packages/shared/src/schemas/transaction";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { api } from "@/trpc/client";
import { useToast } from "@/hooks/use-toast";
import type { TRPCClientErrorLike } from "@trpc/client";
import { useState } from "react";
import type { z } from "zod";
import { useAuth } from "@/hooks/use-auth";

type FormValues = z.infer<typeof transactionFormSchema>;

export function CreateTransactionDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const utils = api.useContext();
  const [isOpen, setIsOpen] = useState(false);

  // tRPCのミューテーション
  const createMutation = api.transaction.create.useMutation({
    onSuccess: () => {
      // 支出一覧を再取得
      utils.transaction.list.invalidate();
      // 未精算一覧も再取得
      utils.settlement.getUnSettlementList.invalidate();
      toast({
        title: "支出を登録しました",
      });
      form.reset();
      setIsOpen(false);
    },
    onError: (error: TRPCClientErrorLike<any>) => {
      toast({
        title: "エラーが発生しました",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // フォームの初期化
  const form = useForm<FormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      title: '',
      amount: '',
      transactionDate: new Date(),
    },
  });

  // フォーム送信
  const onSubmit = (data: FormValues) => {
    const apiInput = convertFormToApiInput(data);
    createMutation.mutate(apiInput);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>支出を登録</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>支出の登録</DialogTitle>
          <DialogDescription>
            新しい共同支出を登録します。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* 支出内容入力 */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>支出内容</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例：食費、交通費など"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 金額入力 */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>金額</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 支出日選択 */}
            <FormField
              control={form.control}
              name="transactionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>支出日</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "yyyy/MM/dd", { locale: ja })
                          ) : (
                            <span>日付を選択</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("2000-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? "登録中..." : "登録する"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}