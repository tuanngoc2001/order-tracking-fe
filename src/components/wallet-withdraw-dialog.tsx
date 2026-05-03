"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppAction } from "@/components/app-action-provider";
import { useToast } from "@/hooks/use-toast";
import {
  createWithdrawalRequest,
  getCurrentUser,
  getUserReferralSummary,
  type UserProfileResponse,
  type UserReferralSummaryResponse,
} from "@/lib/api-client";

const VND_PER_COIN = 1000;

const formatNumber = (amount: number) => new Intl.NumberFormat("vi-VN").format(amount);
const formatCoins = (amount: number) => `${formatNumber(amount)} xu`;
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);

const normalizeCoinInput = (value: string) => value.replace(/\D/g, "");

const withdrawalStatusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  pending: { label: "Đang chờ duyệt", variant: "outline" },
  approved: { label: "Đã thanh toán", variant: "default" },
  rejected: { label: "Từ chối", variant: "secondary" },
};

export function WalletWithdrawDialog() {
  const { toast } = useToast();
  const { runAction } = useAppAction();
  const [summary, setSummary] = useState<UserReferralSummaryResponse | null>(null);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [withdrawCoins, setWithdrawCoins] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    Promise.all([getUserReferralSummary(), getCurrentUser()])
      .then(([referralSummary, currentUser]) => {
        setSummary(referralSummary);
        setProfile(currentUser);
      })
      .catch(console.error);
  }, []);

  const bankName = profile?.bankName || "";
  const bankAccountNumber = profile?.bankAccountNumber || "";
  const hasBankInfo = Boolean(bankName && bankAccountNumber);
  const availableCoins = summary?.withdrawableCoins ?? 0;
  const requestedCoins = Number(withdrawCoins || 0);

  const withdrawError = useMemo(() => {
    if (!withdrawCoins) return "";
    if (!Number.isFinite(requestedCoins) || requestedCoins <= 0) return "Vui lòng nhập số xu muốn rút lớn hơn 0.";
    if (requestedCoins > availableCoins) return `Số xu muốn rút không được vượt quá ${formatCoins(availableCoins)}.`;
    return "";
  }, [availableCoins, requestedCoins, withdrawCoins]);

  const canWithdraw = hasBankInfo && requestedCoins > 0 && !withdrawError && availableCoins > 0;

  const handleWithdraw = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canWithdraw) return;

    await runAction(
      async () => {
        const updated = await createWithdrawalRequest({ amount: requestedCoins });
        setSummary(updated);
        setWithdrawCoins("");
      },
      {
        loadingMessage: "Đang gửi yêu cầu rút tiền...",
        successTitle: "Đã gửi yêu cầu rút tiền",
        successDescription: "Yêu cầu của bạn đang chờ duyệt.",
        errorTitle: "Không thể rút tiền",
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="hidden items-center gap-2 md:flex">
        <DialogTrigger asChild>
          <Button size="sm" className="h-10 rounded-xl bg-sky-500 px-3 text-sm font-semibold hover:bg-sky-600">
            <Banknote className="mr-2 h-4 w-4" />
            Rút tiền
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-h-[86vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rút tiền hoa hồng</DialogTitle>
          <DialogDescription>Kiểm tra số xu khả dụng, thông tin tài khoản và lịch sử rút tiền.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
            <p className="text-sm text-slate-500">Xu khả dụng</p>
            <p className="mt-2 text-2xl font-bold text-sky-700">{formatCoins(availableCoins)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Tổng xu</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{formatCoins(summary?.coinBalance ?? 0)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Đang chờ rút</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{formatCoins(summary?.pendingWithdrawal ?? 0)}</p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={handleWithdraw} className="space-y-4 rounded-xl border border-slate-200 p-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Thông tin rút tiền</h3>
              <p className="mt-1 text-sm text-slate-500">1 xu = 1.000 VNĐ. Tiền sẽ được chuyển về tài khoản ngân hàng trong hồ sơ.</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-4">
                <span>Ngân hàng</span>
                <span className="font-semibold text-slate-900">{bankName || "Chưa cập nhật"}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-4">
                <span>Số tài khoản</span>
                <span className="font-semibold text-slate-900">{bankAccountNumber || "Chưa cập nhật"}</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Số xu muốn rút</label>
              <Input
                type="text"
                inputMode="numeric"
                value={withdrawCoins}
                onChange={(event) => setWithdrawCoins(normalizeCoinInput(event.target.value))}
                placeholder="Nhập số xu"
                aria-invalid={Boolean(withdrawError)}
                className={withdrawError ? "border-red-400 focus:border-red-400 focus:ring-red-100" : undefined}
              />
              <p className="mt-2 text-xs text-slate-500">
                Tương đương: {formatCurrency((requestedCoins || 0) * VND_PER_COIN)}
              </p>
              {withdrawError && <p className="mt-2 text-sm text-red-500">{withdrawError}</p>}
            </div>

            <Button type="submit" disabled={!canWithdraw} className="w-full">
              <Banknote className="mr-2 h-4 w-4" />
              Gửi yêu cầu rút tiền
            </Button>

            {!hasBankInfo && (
              <p className="text-sm text-amber-600">
                Bạn cần cập nhật ngân hàng và số tài khoản trong phần Cài đặt trước khi rút tiền.
              </p>
            )}
          </form>

          <div className="rounded-xl border border-slate-200 p-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Lịch sử rút tiền</h3>
              <p className="mt-1 text-sm text-slate-500">Các yêu cầu rút xu về tài khoản ngân hàng của bạn.</p>
            </div>

            <div className="mt-4 rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Số xu</TableHead>
                    <TableHead>Ngân hàng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(summary?.withdrawals ?? []).length > 0 ? (
                    summary!.withdrawals.map((item) => {
                      const status = withdrawalStatusMap[item.status] ?? { label: item.status, variant: "outline" as const };
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{formatCoins(item.amount)}</TableCell>
                          <TableCell>
                            <div className="font-medium text-slate-900">{item.bankName}</div>
                            <div className="text-xs text-muted-foreground">{item.bankAccountNumber}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>{new Date(item.createdAt).toLocaleString("vi-VN")}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                        Bạn chưa có yêu cầu rút tiền nào.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function UserCoinBalanceLabel() {
  const [summary, setSummary] = useState<UserReferralSummaryResponse | null>(null);

  useEffect(() => {
    getUserReferralSummary().then(setSummary).catch(console.error);
  }, []);

  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600">
      <Wallet className="h-3.5 w-3.5" />
      {formatCoins(summary?.withdrawableCoins ?? 0)}
    </span>
  );
}
