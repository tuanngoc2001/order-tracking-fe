"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, ClipboardList, Clock3, ShoppingBag, Users } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getAdminDashboard, type AdminDashboardResponse, type AdminRecentOrderResponse } from "@/lib/api-client";
import { useAppAction } from "@/components/app-action-provider";

function Pagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        disabled={currentPage === 1}
        onClick={() => onChange(Math.max(1, currentPage - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {Array.from({ length: totalPages }).map((_, index) => {
        const page = index + 1;

        return (
          <button
            key={page}
            onClick={() => onChange(page)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium ${
              currentPage === page ? "border-sky-500 bg-sky-500 text-white" : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminRecentOrderResponse["status"] }) {
  const map = {
    processing: { label: "Đang xử lý", className: "bg-sky-50 text-sky-600" },
    pending: { label: "Chờ xử lý", className: "bg-amber-50 text-amber-600" },
    shipping: { label: "Đang vận chuyển", className: "bg-indigo-50 text-indigo-600" },
    completed: { label: "Đã giao hàng", className: "bg-emerald-50 text-emerald-600" },
    cancelled: { label: "Đã hủy", className: "bg-rose-50 text-rose-600" },
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${map[status].className}`}>{map[status].label}</span>;
}

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; dataKey?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const revenue = payload.find((item) => item.dataKey === "revenue")?.value ?? 0;
  const orders = payload.find((item) => item.dataKey === "orders")?.value ?? 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-xl">
      <p className="font-semibold text-slate-900">{label}</p>
      <p className="mt-1 font-semibold text-sky-600">
        Doanh thu: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(revenue))}
      </p>
      <p className="mt-1 text-slate-500">Đơn hàng: {new Intl.NumberFormat("vi-VN").format(Number(orders))}</p>
    </div>
  );
}

function StatCard({
  title,
  value,
  extra,
  icon,
}: {
  title: string;
  value: string;
  extra: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-500">{icon}</div>
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-[26px] font-bold leading-none text-slate-900">{value}</p>
          <p className="mt-3 text-xs text-slate-400">{extra}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { beginBlocking } = useAppAction();
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [customerPage, setCustomerPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);

  useEffect(() => {
    const release = beginBlocking("Đang tải dashboard admin...");
    getAdminDashboard()
      .then((data) => {
        setDashboard(data);
        setSelectedYear(data.availableYears[0] ?? "");
      })
      .finally(release);
  }, [beginBlocking]);

  const revenueData = useMemo(() => {
    if (!dashboard) return [];
    if (!selectedYear) return dashboard.monthlyRevenue;
    return dashboard.monthlyRevenue.filter((item) => item.year === selectedYear);
  }, [dashboard, selectedYear]);

  const customerPageSize = 5;
  const orderPageSize = 10;
  const customerTotalPages = Math.max(1, Math.ceil((dashboard?.topCustomers.length ?? 0) / customerPageSize));
  const orderTotalPages = Math.max(1, Math.ceil((dashboard?.recentOrders.length ?? 0) / orderPageSize));

  const pagedCustomers = useMemo(() => {
    const items = dashboard?.topCustomers ?? [];
    const start = (customerPage - 1) * customerPageSize;
    return items.slice(start, start + customerPageSize);
  }, [customerPage, dashboard]);

  const pagedOrders = useMemo(() => {
    const items = dashboard?.recentOrders ?? [];
    const start = (orderPage - 1) * orderPageSize;
    return items.slice(start, start + orderPageSize);
  }, [dashboard, orderPage]);

  const metricIcons = [<ShoppingBag className="h-5 w-5" key="revenue" />, <ClipboardList className="h-5 w-5" key="orders" />, <Users className="h-5 w-5" key="users" />, <Clock3 className="h-5 w-5" key="processing" />];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[28px] font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Toàn bộ số liệu đang lấy trực tiếp từ API backend.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(dashboard?.metrics ?? []).map((metric, index) => (
          <StatCard key={metric.title} title={metric.title} value={metric.value} extra={metric.note} icon={metricIcons[index] ?? metricIcons[0]} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.65fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Doanh thu theo tháng</h2>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              {(dashboard?.availableYears ?? []).map((year) => (
                <option key={year} value={year}>
                  Năm {year}
                </option>
              ))}
            </select>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueData} margin={{ top: 16, right: 10, left: -18, bottom: 0 }} barCategoryGap="42%">
                <defs>
                  <linearGradient id="revenueBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.75} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 6" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={12} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tickMargin={10} tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(value) => `${Math.round(Number(value) / 1_000_000)}M`} />
                <Tooltip cursor={{ fill: "rgba(14, 165, 233, 0.08)" }} content={<RevenueTooltip />} />
                <Bar dataKey="revenue" fill="url(#revenueBar)" radius={[10, 10, 4, 4]} maxBarSize={56} />
                <Line type="monotone" dataKey="orders" stroke="#0f172a" strokeWidth={2.5} dot={{ r: 4, fill: "#ffffff", stroke: "#0f172a", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#0f172a", stroke: "#ffffff", strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-slate-900">Top khách hàng</h2>

          <div className="space-y-3">
            {pagedCustomers.map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-600">
                    {(customerPage - 1) * customerPageSize + index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{customer.name}</p>
                    <p className="text-xs text-slate-400">{customer.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-sm font-semibold text-slate-800">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(customer.totalAmount)}
                  </span>
                  <span className="text-xs text-slate-400">{customer.orderCount} đơn</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Pagination currentPage={customerPage} totalPages={customerTotalPages} onChange={setCustomerPage} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Đơn hàng mới nhất</h2>

        <div className="space-y-3 md:hidden">
          {pagedOrders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900">{order.trackingCode}</h3>
                  <p className="mt-1 truncate text-xs text-slate-400">{order.customerEmail}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Khách hàng</p>
                  <p className="mt-1 truncate font-semibold text-slate-700">{order.customerName}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Tổng tiền</p>
                  <p className="mt-1 truncate font-semibold text-slate-900">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(order.totalAmount)}
                  </p>
                </div>
                <div className="col-span-2 rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-400">Ngày tạo</p>
                  <p className="mt-1 font-semibold text-slate-700">
                    {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(order.createdAt))}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-400">
                <th className="pb-3 font-medium">Mã đơn hàng</th>
                <th className="pb-3 font-medium">Khách hàng</th>
                <th className="pb-3 font-medium">Tổng tiền</th>
                <th className="pb-3 font-medium">Trạng thái</th>
                <th className="pb-3 font-medium">Ngày tạo</th>
              </tr>
            </thead>

            <tbody>
              {pagedOrders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100 last:border-none">
                  <td className="py-4 font-medium text-slate-700">{order.trackingCode}</td>
                  <td className="py-4 text-slate-600">
                    <div>{order.customerName}</div>
                    <div className="text-xs text-slate-400">{order.customerEmail}</div>
                  </td>
                  <td className="py-4 text-slate-700">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(order.totalAmount)}
                  </td>
                  <td className="py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-4 text-slate-500">
                    {new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(order.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Pagination currentPage={orderPage} totalPages={orderTotalPages} onChange={setOrderPage} />
        </div>
      </div>
    </div>
  );
}
