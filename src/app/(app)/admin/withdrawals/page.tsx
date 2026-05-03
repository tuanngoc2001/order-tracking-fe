"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Clock3, HandCoins, Search, XCircle } from "lucide-react";
import { getAdminWithdrawals, type AdminWithdrawalResponse } from "@/lib/api-client";
import { useAppAction } from "@/components/app-action-provider";

type WithdrawalStatus = AdminWithdrawalResponse["status"];
type StatusFilter = "all" | WithdrawalStatus;

const statusMeta: Record<
  WithdrawalStatus,
  {
    label: string;
    className: string;
    icon: React.ReactNode;
  }
> = {
  pending: {
    label: "Chờ xử lý",
    className: "bg-amber-50 text-amber-700 ring-amber-100",
    icon: <Clock3 className="h-3.5 w-3.5" />,
  },
  approved: {
    label: "Đã duyệt",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    icon: <BadgeCheck className="h-3.5 w-3.5" />,
  },
  rejected: {
    label: "Từ chối",
    className: "bg-rose-50 text-rose-700 ring-rose-100",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: WithdrawalStatus }) {
  const meta = statusMeta[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.className}`}>
      {meta.icon}
      {meta.label}
    </span>
  );
}

function StatCard({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
          <HandCoins className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          <p className="mt-2 text-xs font-medium text-slate-400">{note}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminWithdrawalsPage() {
  const { beginBlocking } = useAppAction();
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalResponse[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    const release = beginBlocking("Đang tải yêu cầu rút tiền...");
    getAdminWithdrawals()
      .then(setWithdrawals)
      .finally(release);
  }, [beginBlocking]);

  const stats = useMemo(() => {
    const pending = withdrawals.filter((item) => item.status === "pending");
    const approved = withdrawals.filter((item) => item.status === "approved");
    const totalPending = pending.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalApproved = approved.reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      totalRequests: withdrawals.length,
      pendingRequests: pending.length,
      totalPending,
      totalApproved,
    };
  }, [withdrawals]);

  const filteredWithdrawals = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return withdrawals.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        [
          item.username,
          item.fullName ?? "",
          item.email,
          item.bankName,
          item.bankAccountNumber,
          String(item.id),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter, withdrawals]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Yêu cầu rút tiền</h1>
          <p className="mt-1 text-sm text-slate-500">
            Danh sách các yêu cầu rút tiền do người dùng gửi từ ví hoa hồng.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
          <HandCoins className="h-4 w-4" />
          {stats.pendingRequests} yêu cầu chờ xử lý
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Tổng yêu cầu" value={new Intl.NumberFormat("vi-VN").format(stats.totalRequests)} note="Tất cả yêu cầu trong hệ thống" />
        <StatCard title="Chờ xử lý" value={new Intl.NumberFormat("vi-VN").format(stats.pendingRequests)} note="Cần admin kiểm tra thanh toán" />
        <StatCard title="Tổng tiền chờ rút" value={formatCurrency(stats.totalPending)} note="Tổng giá trị trạng thái chờ xử lý" />
        <StatCard title="Đã duyệt" value={formatCurrency(stats.totalApproved)} note="Tổng giá trị đã được duyệt" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
              placeholder="Tìm theo tên, email, ngân hàng, số tài khoản..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const active = statusFilter === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatusFilter(option.value)}
                  className={`h-10 rounded-xl px-4 text-sm font-semibold transition ${
                    active
                      ? "bg-sky-500 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-600"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Người dùng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Số tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Ngân hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredWithdrawals.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-4">
                      <div className="min-w-[220px]">
                        <p className="font-semibold text-slate-900">{item.fullName || item.username}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.email}</p>
                        <p className="mt-1 text-xs text-slate-400">@{item.username}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-900">{formatCurrency(item.amount)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="min-w-[180px]">
                        <p className="font-medium text-slate-700">{item.bankName}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.bankAccountNumber}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-500">{formatDate(item.createdAt)}</td>
                  </tr>
                ))}

                {filteredWithdrawals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                      Chưa có yêu cầu rút tiền phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
