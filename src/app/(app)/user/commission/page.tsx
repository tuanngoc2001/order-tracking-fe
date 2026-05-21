"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, HandCoins, Link2, Users, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppAction } from "@/components/app-action-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getUserReferralSummary, type UserReferralSummaryResponse } from "@/lib/api-client";

function SummaryCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4 md:p-6">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 break-words text-xl font-bold text-slate-900 md:text-2xl">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 md:h-11 md:w-11">{icon}</div>
      </CardContent>
    </Card>
  );
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const formatCoins = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)} xu`;

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  pending: { label: "Đang chờ", variant: "outline" },
  processing: { label: "Đang xử lý", variant: "outline" },
  shipping: { label: "Đang giao", variant: "secondary" },
  completed: { label: "Đã nhận", variant: "default" },
};

export default function UserCommissionPage() {
  const { toast } = useToast();
  const { beginBlocking } = useAppAction();
  const [summary, setSummary] = useState<UserReferralSummaryResponse | null>(null);

  useEffect(() => {
    const release = beginBlocking("Đang tải dữ liệu hoa hồng...");
    getUserReferralSummary()
      .then(setSummary)
      .catch(console.error)
      .finally(release);
  }, [beginBlocking]);

  const referralLink = useMemo(() => {
    if (!summary?.referralCode || typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/register?ref=${encodeURIComponent(summary.referralCode)}`;
  }, [summary?.referralCode]);

  const handleCopy = async (value: string, message: string) => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      toast({ title: "Đã sao chép", description: message });
    } catch {
      toast({
        title: "Không thể sao chép",
        description: "Trình duyệt chưa cho phép truy cập clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Giới thiệu & Hoa hồng</h1>
        <p className="text-muted-foreground">Theo dõi xu hoa hồng, link giới thiệu và lịch sử nhận hoa hồng.</p>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2">
              <HandCoins className="h-5 w-5 text-sky-600" />
              Mã giới thiệu của bạn
            </CardTitle>
            <CardDescription>Dùng mã này để mời người dùng mới đăng ký.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0 md:p-6 md:pt-0">
            <div className="break-all rounded-xl border border-dashed border-sky-200 bg-sky-50 px-4 py-5 text-center font-mono text-lg font-bold tracking-[0.16em] text-sky-700 md:text-xl">
              {summary?.referralCode ?? "---"}
            </div>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleCopy(summary?.referralCode ?? "", "Mã giới thiệu đã được sao chép.")}
            >
              <Copy className="mr-2 h-4 w-4" />
              Sao chép mã
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-sky-600" />
              Link giới thiệu của bạn
            </CardTitle>
            <CardDescription>Người đăng ký từ link này sẽ thuộc tuyến F1 trực tiếp của bạn.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0 md:p-6 md:pt-0">
            <div className="break-all rounded-xl border border-dashed border-sky-200 bg-slate-50 px-4 py-5 text-center text-sm font-medium text-slate-700">
              {referralLink || "Chưa có link giới thiệu"}
            </div>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleCopy(referralLink, "Link giới thiệu đã được sao chép.")}
            >
              <Copy className="mr-2 h-4 w-4" />
              Sao chép link
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <SummaryCard
          title="Xu khả dụng"
          value={formatCoins(summary?.withdrawableCoins ?? 0)}
          hint="Hiển thị trên thanh trên cùng"
          icon={<Wallet className="h-5 w-5" />}
        />
        <SummaryCard
          title="Tổng xu"
          value={formatCoins(summary?.coinBalance ?? 0)}
          hint="Hoa hồng từ đơn hoàn thành"
          icon={<HandCoins className="h-5 w-5" />}
        />
        <SummaryCard
          title="Số giao dịch"
          value={String(summary?.transactionCount ?? 0)}
          hint="Tổng đơn tạo hoa hồng"
          icon={<Copy className="h-5 w-5" />}
        />
        <SummaryCard
          title="F1 trực tiếp"
          value={String(summary?.directReferralCount ?? 0)}
          hint="Chỉ tính 1 cấp"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle>Lịch sử nhận hoa hồng</CardTitle>
          <CardDescription>Danh sách hoa hồng phát sinh từ đơn hàng của F1 trực tiếp.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <div className="space-y-3 md:hidden">
            {(summary?.history ?? []).length > 0 ? (
              summary!.history.map((item) => {
                const status = statusMap[item.status] ?? { label: item.status, variant: "outline" as const };

                return (
                  <article key={`${item.sourceUsername}-${item.trackingCode}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-slate-900">{item.type}</h3>
                        <p className="mt-1 truncate text-xs text-slate-400">{item.trackingCode}</p>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">Số tiền</p>
                        <p className="mt-1 font-bold text-slate-900">{formatCurrency(item.commissionAmount)}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">Từ người dùng</p>
                        <p className="mt-1 truncate font-semibold text-slate-700">{item.sourceUser || item.sourceUsername}</p>
                      </div>
                      <div className="col-span-2 rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">Ngày tạo</p>
                        <p className="mt-1 font-semibold text-slate-700">{new Date(item.createdAt).toLocaleString("vi-VN")}</p>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">
                Bạn chưa có lịch sử nhận hoa hồng.
              </div>
            )}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại giao dịch</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Từ người dùng</TableHead>
                  <TableHead>Đơn liên quan</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(summary?.history ?? []).length > 0 ? (
                  summary!.history.map((item) => {
                    const status = statusMap[item.status] ?? { label: item.status, variant: "outline" as const };
                    return (
                      <TableRow key={`${item.sourceUsername}-${item.trackingCode}`}>
                        <TableCell className="font-medium">{item.type}</TableCell>
                        <TableCell>{formatCurrency(item.commissionAmount)}</TableCell>
                        <TableCell>{item.sourceUser || item.sourceUsername}</TableCell>
                        <TableCell>{item.trackingCode}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>{new Date(item.createdAt).toLocaleString("vi-VN")}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Bạn chưa có lịch sử nhận hoa hồng.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
