"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppAction } from "@/components/app-action-provider";
import { getCurrentUser, updateCurrentUser } from "@/lib/api-client";

const profileSchema = z.object({
  fullName: z.string().min(1, "Tên là bắt buộc."),
  phone: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AdminProfilePage() {
  const { isBlocking, beginBlocking, runAction } = useAppAction();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      bankName: "",
      bankAccountNumber: "",
    },
  });

  useEffect(() => {
    const release = beginBlocking("Đang tải thông tin admin...");
    getCurrentUser()
      .then((user) => {
        form.reset({
          fullName: user.fullName ?? "",
          phone: user.phone ?? "",
          bankName: user.bankName ?? "",
          bankAccountNumber: user.bankAccountNumber ?? "",
        });
      })
      .finally(release);
  }, [beginBlocking, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    const result = await runAction(
      () =>
        updateCurrentUser({
          fullName: values.fullName,
          phone: values.phone ?? "",
          bankName: values.bankName ?? "",
          bankAccountNumber: values.bankAccountNumber ?? "",
        }),
      {
        loadingMessage: "Đang lưu thông tin admin...",
        successTitle: "Cập nhật thành công",
        successDescription: "Thông tin admin đã được cập nhật.",
      }
    );

    if (!result) return;

    form.reset({
      fullName: result.fullName ?? "",
      phone: result.phone ?? "",
      bankName: result.bankName ?? "",
      bankAccountNumber: result.bankAccountNumber ?? "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Thông tin admin</h1>
        <p className="text-muted-foreground">Dữ liệu đang lấy trực tiếp từ API tài khoản hiện tại.</p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Chỉnh sửa hồ sơ</CardTitle>
          <CardDescription>Cập nhật họ tên, số điện thoại và thông tin ngân hàng của tài khoản admin.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isBlocking} placeholder="Nhập họ và tên" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isBlocking} placeholder="Nhập số điện thoại" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngân hàng</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isBlocking} placeholder="Tên ngân hàng" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tài khoản</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isBlocking} placeholder="Số tài khoản" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isBlocking} className="w-full sm:w-auto">
                {isBlocking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Lưu thay đổi
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
