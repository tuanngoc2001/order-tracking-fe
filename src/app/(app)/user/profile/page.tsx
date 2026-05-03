"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useAppAction } from "@/components/app-action-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentUser, getUserStats, updateCurrentUser, type UserProfileResponse, type UserStatsResponse } from "@/lib/api-client";

const profileSchema = z.object({
  fullName: z.string().min(1, "Họ và tên là bắt buộc."),
  phone: z.string().min(1, "Số điện thoại là bắt buộc."),
  bank: z.string().min(1, "Tên ngân hàng là bắt buộc."),
  accountNumber: z.string().min(1, "Số tài khoản là bắt buộc."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const bankList = [
  { value: "vietcombank", label: "Vietcombank" },
  { value: "vietinbank", label: "VietinBank" },
  { value: "bidv", label: "BIDV" },
  { value: "agribank", label: "Agribank" },
  { value: "vpbank", label: "VPBank" },
  { value: "techcombank", label: "Techcombank" },
];

export default function UserProfilePage() {
  const { isBlocking, runAction, beginBlocking } = useAppAction();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [stats, setStats] = useState<UserStatsResponse | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", phone: "", bank: "vietcombank", accountNumber: "" },
  });

  useEffect(() => {
    const release = beginBlocking("Đang tải hồ sơ...");
    Promise.all([getCurrentUser(), getUserStats()])
      .then(([user, userStats]) => {
        setProfile(user);
        setStats(userStats);
        form.reset({
          fullName: user.fullName ?? "",
          phone: user.phone ?? "",
          bank: user.bankName ?? "vietcombank",
          accountNumber: user.bankAccountNumber ?? "",
        });
      })
      .catch(console.error)
      .finally(release);
  }, [beginBlocking, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    await runAction(
      async () => {
        const updated = await updateCurrentUser({
          fullName: data.fullName,
          phone: data.phone,
          bankName: data.bank,
          bankAccountNumber: data.accountNumber,
        });
        setProfile(updated);
      },
      {
        loadingMessage: "Đang lưu thông tin...",
        successTitle: "Cập nhật thành công",
        successDescription: "Thông tin cá nhân của bạn đã được cập nhật.",
      }
    );
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Thông Tin Cá Nhân</h1>
        <p className="text-muted-foreground">Cập nhật thông tin và xem thống kê của bạn.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thống kê</CardTitle>
            <CardDescription>Tổng quan về hoạt động của bạn.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="text-sm text-muted-foreground">Họ tên</div>
              <div className="text-lg font-bold">{profile?.fullName ?? "-"}</div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <span className="text-sm font-medium text-muted-foreground">Số đơn hàng đã đặt</span>
              <span className="text-lg font-bold">{stats?.totalOrders ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <span className="text-sm font-medium text-muted-foreground">Doanh thu hoàn thành</span>
              <span className="text-lg font-bold">{formatCurrency(stats?.totalRevenue ?? 0)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Chỉnh sửa thông tin</CardTitle>
            <CardDescription>Thay đổi sẽ được lưu lại cho tài khoản của bạn.</CardDescription>
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
                      <FormControl><Input {...field} disabled={isBlocking} /></FormControl>
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
                      <FormControl><Input {...field} disabled={isBlocking} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bank"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngân hàng</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isBlocking}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Chọn ngân hàng..." /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bankList.map((bank) => (
                            <SelectItem key={bank.value} value={bank.value}>{bank.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tài khoản</FormLabel>
                      <FormControl><Input {...field} disabled={isBlocking} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isBlocking} className="w-full sm:w-auto">
                  {isBlocking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu thay đổi
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
